from django.urls import path
from .views import NotificationListView, SendReminderView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('remind/', SendReminderView.as_view(), name='send_reminder'),
]
