import requests
from .models import CurrencyRate
from django.conf import settings

def refresh_currency_rates(base_currency='INR'):
    api_key = getattr(settings, 'EXCHANGE_RATE_API_KEY', None)
    if not api_key:
        return "API Key not found in settings."

    url = f"https://v6.exchangerate-api.com/v6/{api_key}/latest/{base_currency}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if data.get('result') == 'success':
            rates = data.get('conversion_rates', {})
            for target, rate in rates.items():
                CurrencyRate.objects.update_or_create(
                    base_currency=base_currency,
                    target_currency=target,
                    defaults={'rate': rate}
                )
            return f"Rates for {base_currency} updated successfully."
        else:
            return f"API Error: {data.get('error-type', 'Unknown error')}"
    except Exception as e:
        return f"Request failed: {str(e)}"

