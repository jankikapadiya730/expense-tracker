from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    upi_id = models.CharField(max_length=50, blank=True, help_text="User's UPI ID for receiving payments")
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    preferred_currency = models.CharField(max_length=3, default='INR')
    timezone = models.CharField(max_length=50, default='UTC')
    notification_preferences = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.username
