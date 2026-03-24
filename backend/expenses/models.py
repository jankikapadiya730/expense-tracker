from django.db import models
from django.conf import settings
from groups.models import Group
from currencies.models import CurrencyRate
from .models_recurring import RecurringExpense
import uuid
from django.core.exceptions import ObjectDoesNotExist

class Expense(models.Model):
    SPLIT_TYPE_CHOICES = [
        ('equal', 'Equal'),
        ('exact', 'Exact'),
        ('percentage', 'Percentage'),
        ('shares', 'Shares'),
    ]

    CATEGORY_CHOICES = [
        ('food', 'Food'),
        ('rent', 'Rent'),
        ('transport', 'Transport'),
        ('entertainment', 'Entertainment'),
        ('utilities', 'Utilities'),
        ('groceries', 'Groceries'),
        ('travel', 'Travel'),
        ('medical', 'Medical'),
        ('shopping', 'Shopping'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    converted_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    paid_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses_paid')
    date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    receipt_image = models.ImageField(upload_to='receipts/', null=True, blank=True)

    ocr_extracted = models.BooleanField(default=False)
    split_type = models.CharField(max_length=20, choices=SPLIT_TYPE_CHOICES, default='equal')
    is_recurring = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.converted_amount:
            if self.currency == self.group.currency:
                self.converted_amount = self.amount
            else:
                try:
                    # Try to find rate: 1 unit of self.currency = X units of group.currency
                    from currencies.models import CurrencyRate
                    rate_obj = CurrencyRate.objects.get(base_currency=self.currency, target_currency=self.group.currency)
                    self.converted_amount = self.amount * rate_obj.rate
                except (CurrencyRate.DoesNotExist, Exception):
                    # Fallback to amount if no rate found
                    self.converted_amount = self.amount
        super().save(*args, **kwargs)


    def __str__(self):
        return f"{self.title} - {self.amount}"

class ExpenseSplit(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='splits')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expense_splits')
    share_amount = models.DecimalField(max_digits=12, decimal_places=2)
    converted_share_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    shares = models.IntegerField(null=True, blank=True)
    is_settled = models.BooleanField(default=False)
    settled_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Calculate converted_share_amount based on expense's conversion rate
        if self.expense.amount > 0:
            rate = self.expense.converted_amount / self.expense.amount
            self.converted_share_amount = self.share_amount * rate
        else:
            self.converted_share_amount = self.share_amount
        super().save(*args, **kwargs)


    def __str__(self):
        return f"{self.user.username} owes {self.share_amount} for {self.expense.title}"
