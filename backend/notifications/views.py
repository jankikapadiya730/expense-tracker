from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Notification
from .serializers import NotificationSerializer
from accounts.models import User
from groups.models import Group

class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class SendReminderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_id = request.data.get('user_id')
        group_id = request.data.get('group_id')
        
        try:
            target_user = User.objects.get(id=user_id)
            group = Group.objects.get(id=group_id)
            
            Notification.objects.create(
                user=target_user,
                title=f"Payment Reminder: {group.name}",
                message=f"{request.user.username} is reminding you to settle your balances in {group.name}.",
                type='reminder'
            )
            return Response({"detail": "Reminder sent successfully."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
