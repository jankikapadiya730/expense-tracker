from django.core.management.base import BaseCommand
from currencies.utils import refresh_currency_rates

class Command(BaseCommand):
    help = 'Refresh currency rates from the external API'

    def add_arguments(self, parser):
        parser.add_argument('--base', type=str, default='INR', help='Base currency for rates')

    def handle(self, *args, **options):
        base = options['base']
        self.stdout.write(f"Refreshing rates for base: {base}...")
        result = refresh_currency_rates(base)
        self.stdout.write(self.style.SUCCESS(result))
