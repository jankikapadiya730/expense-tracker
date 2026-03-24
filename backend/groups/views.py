from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status, decorators

from rest_framework.response import Response
from .models import Group, GroupMember
from .serializers import GroupSerializer, GroupMemberSerializer
from expenses.models import Expense, ExpenseSplit
from settlements.models import Settlement
from django.db.models import Sum
from django.core.mail import send_mail
from django.conf import settings


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Return only groups where user is a member
        return Group.objects.filter(memberships__user=self.request.user, is_archived=False)

    def perform_create(self, serializer):
        group = serializer.save(created_by=self.request.user)
        # Add creator as admin
        GroupMember.objects.create(
            group=group,
            user=self.request.user,
            role='admin',
            nickname_in_group=self.request.user.first_name or self.request.user.username
        )
        
        # Handle initial members if provided
        initial_members = self.request.data.get('initial_members', [])
        for username in initial_members:
            try:
                user_to_add = User.objects.get(username=username)
                if user_to_add != self.request.user: # Ensure creator isn't added twice or as a regular member
                    GroupMember.objects.get_or_create(
                        group=group,
                        user=user_to_add,
                        defaults={
                            'role': 'member',
                            'nickname_in_group': user_to_add.first_name or user_to_add.username
                        }
                    )
            except User.DoesNotExist:
                # Optionally log this or return a partial success/failure
                pass

    @decorators.action(detail=False, methods=['post'], url_path='join/(?P<invite_code>[^/.]+)')
    def join(self, request, invite_code=None):
        group = get_object_or_404(Group, invite_code=invite_code)
        
        if GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({"detail": "Already a member of this group."}, status=status.HTTP_400_BAD_REQUEST)
        
        GroupMember.objects.create(
            group=group,
            user=request.user,
            role='member',
            nickname_in_group=request.user.first_name or request.user.username
        )
        
        return Response(GroupSerializer(group).data, status=status.HTTP_201_CREATED)

    @decorators.action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        group = self.get_object()
        memberships = group.memberships.all()
        serializer = GroupMemberSerializer(memberships, many=True)
        return Response(serializer.data)
    @decorators.action(detail=True, methods=['get'])
    def balances(self, request, pk=None):
        group = self.get_object()
        members = group.memberships.all()
        balances = []
        
        for member in members:
            user = member.user
            # Total paid by this user in this group (expenses they covered)
            paid = Expense.objects.filter(group=group, paid_by=user, is_deleted=False).aggregate(total=Sum('amount'))['total'] or 0
            
            # Total owed by this user in this group (their share of expenses)
            owed = ExpenseSplit.objects.filter(expense__group=group, user=user, expense__is_deleted=False).aggregate(total=Sum('share_amount'))['total'] or 0
            
            # Settlements made by this user (paying others)
            settlements_made = Settlement.objects.filter(group=group, paid_by=user, is_confirmed=True).aggregate(total=Sum('amount'))['total'] or 0
            
            # Settlements received by this user (being paid by others)
            settlements_received = Settlement.objects.filter(group=group, paid_to=user, is_confirmed=True).aggregate(total=Sum('amount'))['total'] or 0
            
            # Net balance: (Paid + Settlements Made) - (Owed + Settlements Received)
            net = (paid + settlements_made) - (owed + settlements_received)
            
            balances.append({
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "nickname": member.nickname_in_group
                },
                "total_paid": paid,
                "total_owed": owed,
                "settlements_made": settlements_made,
                "settlements_received": settlements_received,
                "net_balance": net
            })
            
        return Response(balances)


    @decorators.action(detail=True, methods=['get'])
    def settlements(self, request, pk=None):
        group = self.get_object()
        settlements = group.settlements.all()
        # Simplified: we could create a SettlementSerializer later
        return Response([{
            "id": s.id,
            "paid_by": s.paid_by.username,
            "paid_to": s.paid_to.username,
            "amount": s.amount,
            "settled_at": s.settled_at,
            "is_confirmed": s.is_confirmed
        } for s in settlements])

    @decorators.action(detail=True, methods=['post'])
    def invite_by_email(self, request, pk=None):
        group = self.get_object()
        email = request.data.get('email')
        
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        invite_link = f"http://localhost:5173/groups/join/{group.invite_code}"
        
        subject = f"Invitation to join {group.name} on SplitSphere"
        message = f"""
Hi,

{request.user.username} has invited you to join the group "{group.name}" on SplitSphere.

You can join the group by clicking the link below:
{invite_link}

Alternatively, you can use the invite code: {group.invite_code}

Happy splitting!
The SplitSphere Team
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response({"detail": f"Invitation sent to {email}."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

