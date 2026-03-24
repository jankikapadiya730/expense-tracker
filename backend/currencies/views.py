from rest_framework import viewsets, decorators, status
from rest_framework.response import Response
from .models import CurrencyRate
from .serializers import CurrencyRateSerializer
from .utils import refresh_currency_rates

class CurrencyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CurrencyRate.objects.all()
    serializer_class = CurrencyRateSerializer

    @decorators.action(detail=False, methods=['post'])
    def refresh_rates(self, request):
        base_currency = request.data.get('base_currency', 'INR')
        result = refresh_currency_rates(base_currency)
        return Response({"detail": result}, status=status.HTTP_200_OK)

    @decorators.action(detail=False, methods=['get'])
    def supported_currencies(self, request):
        # Return a list of supported currency codes
        currencies = CurrencyRate.objects.values_list('target_currency', flat=True).distinct()
        if not currencies:
            # Fallback if no rates fetched yet
            return Response(['INR', 'USD', 'EUR', 'GBP'], status=status.HTTP_200_OK)
        return Response(list(currencies), status=status.HTTP_200_OK)
