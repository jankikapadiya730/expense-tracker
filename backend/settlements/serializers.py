from rest_framework import serializers
from .models import Settlement

class SettlementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settlement
        fields = '__all__'
        read_only_fields = ('created_at',)
