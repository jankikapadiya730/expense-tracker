from rest_framework import viewsets, permissions, status, decorators

from rest_framework.response import Response
from .models import Expense, ExpenseSplit
from .serializers import ExpenseSerializer
from django.db.models import Q

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        group_id = self.request.query_params.get('group')
        if group_id:
            return Expense.objects.filter(group_id=group_id, is_deleted=False)
        return Expense.objects.filter(
            Q(group__memberships__user=self.request.user) | Q(paid_by=self.request.user),
            is_deleted=False
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

    @decorators.action(detail=True, methods=['post'])
    def nudge(self, request, pk=None):
        expense = self.get_object()
        if expense.paid_by != request.user:
            return Response({"error": "Only the person who paid can send reminders."}, status=status.HTTP_403_FORBIDDEN)
        
        pending_splits = expense.splits.filter(is_settled=False)
        # In a real app, send emails or push notifications here
        for split in pending_splits:
            print(f"NUDGE: {split.user.username} - Please pay ₹{split.share_amount} for '{expense.title}'")
            
        return Response({"detail": f"Reminders sent to {pending_splits.count()} people!"})

