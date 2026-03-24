from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CurrencyViewSet

router = DefaultRouter()
router.register(r'', CurrencyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
