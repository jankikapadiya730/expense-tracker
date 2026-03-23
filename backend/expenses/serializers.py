from rest_framework import serializers
from .models import Expense, ExpenseSplit
from accounts.serializers import UserSerializer

class ExpenseSplitSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = ExpenseSplit
        fields = ('id', 'user', 'user_id', 'share_amount', 'percentage', 'shares', 'is_settled', 'settled_at')
        read_only_fields = ('id', 'is_settled', 'settled_at')

class ExpenseSerializer(serializers.ModelSerializer):
    paid_by = UserSerializer(read_only=True)
    paid_by_id = serializers.UUIDField(write_only=True)
    splits = ExpenseSplitSerializer(many=True)

    class Meta:
        model = Expense
        fields = ('id', 'group', 'title', 'description', 'amount', 'currency', 'converted_amount_inr', 'category', 'paid_by', 'paid_by_id', 'date', 'due_date', 'receipt_image', 'ocr_extracted', 'split_type', 'is_recurring', 'notes', 'created_by', 'created_at', 'splits')

        read_only_fields = ('id', 'created_at', 'created_by', 'converted_amount_inr')

    def validate(self, data):
        splits = data.get('splits', [])
        amount = data.get('amount')
        split_type = data.get('split_type', 'equal')

        if not splits:
            raise serializers.ValidationError("At least one split is required.")

        if split_type == 'exact':
            total_split = sum(s.get('share_amount') for s in splits)
            if abs(total_split - amount) > 0.01:
                raise serializers.ValidationError(f"Total splits ({total_split}) must equal expense amount ({amount}).")
        
        elif split_type == 'percentage':
            total_percentage = sum(s.get('percentage', 0) for s in splits)
            if abs(total_percentage - 100) > 0.01:
                raise serializers.ValidationError(f"Total percentage ({total_percentage}) must equal 100%.")
            
            # Auto-calculate share amounts based on percentage
            for s in splits:
                s['share_amount'] = (s.get('percentage') / 100) * amount

        elif split_type == 'shares':
            total_shares = sum(s.get('shares', 0) for s in splits)
            if total_shares <= 0:
                raise serializers.ValidationError("Total shares must be greater than 0.")
            
            # Auto-calculate share amounts based on shares
            for s in splits:
                s['share_amount'] = (s.get('shares') / total_shares) * amount

        elif split_type == 'equal':
            share_amount = amount / len(splits)
            for s in splits:
                s['share_amount'] = share_amount

        return data

    def create(self, validated_data):
        splits_data = validated_data.pop('splits')
        expense = Expense.objects.create(**validated_data)
        for split_data in splits_data:
            ExpenseSplit.objects.create(expense=expense, **split_data)
        return expense
