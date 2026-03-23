from django.utils import timezone
from .models import Expense, ExpenseSplit
from .models_recurring import RecurringExpense
from datetime import timedelta
from dateutil.relativedelta import relativedelta

def process_recurring_expenses():
    today = timezone.now().date()
    recurring_expenses = RecurringExpense.objects.filter(is_active=True, next_due_date__lte=today, auto_add=True)
    
    count = 0
    for re in recurring_expenses:
        # Create the expense
        expense = Expense.objects.create(
            group=re.group,
            title=re.title,
            amount=re.amount,
            currency=re.currency,
            category=re.category,
            paid_by=re.paid_by,
            date=today,
            split_type=re.split_type,
            created_by=re.paid_by,
            is_recurring=True
        )
        
        # Create splits (Equal split for now)
        participants = re.participants.all()
        share_amount = re.amount / participants.count()
        for p in participants:
            ExpenseSplit.objects.create(
                expense=expense,
                user=p,
                share_amount=share_amount
            )
            
        # Update next_due_date
        if re.frequency == 'daily':
            re.next_due_date += timedelta(days=1)
        elif re.frequency == 'weekly':
            re.next_due_date += timedelta(weeks=1)
        elif re.frequency == 'monthly':
            re.next_due_date += relativedelta(months=1)
        elif re.frequency == 'yearly':
            re.next_due_date += relativedelta(years=1)
        
        re.save()
        count += 1
        
    return f"Processed {count} recurring expenses."
