from django.core.management.base import BaseCommand
from expenses.utils_recurring import process_recurring_expenses
from currencies.utils import refresh_currency_rates

class Command(BaseCommand):
    help = 'Processes all recurring expenses and refreshes currency rates without needing Redis/Celery'

    def handle(self, *args, **options):
        self.stdout.write("Refreshing currency rates...")
        refresh_currency_rates()
        
        self.stdout.write("Processing recurring expenses...")
        processed_count = process_recurring_expenses()
        
        self.stdout.write(self.style.SUCCESS(f"Successfully processed {processed_count} recurring expenses and updated rates."))
