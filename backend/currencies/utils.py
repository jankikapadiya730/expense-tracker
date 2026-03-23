import requests
from .models import CurrencyRate
from django.conf import settings

def refresh_currency_rates():
    # Example API: https://v6.exchangerate-api.com/v6/YOUR_KEY/latest/INR
    # For now, we'll use a public mock or hardcoded rates for core currencies
    # if you have an API key, you can set it in settings.py
    
    # Mock data for initial setup
    common_rates = {
        'INR': {'USD': 0.012, 'EUR': 0.011, 'GBP': 0.0094},
        'USD': {'INR': 83.0, 'EUR': 0.92, 'GBP': 0.79},
        'EUR': {'INR': 90.0, 'USD': 1.08, 'GBP': 0.86},
    }
    
    for base, targets in common_rates.items():
        for target, rate in targets.items():
            CurrencyRate.objects.update_or_create(
                base_currency=base,
                target_currency=target,
                defaults={'rate': rate}
            )
    
    return "Rates updated successfully (Mocked)"
