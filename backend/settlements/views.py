from django.db.models import Q
import razorpay
from django.conf import settings
from rest_framework import viewsets, permissions, status, decorators
from rest_framework.response import Response
from .models import Settlement
from .serializers import SettlementSerializer
from groups.models import GroupMember
from django.shortcuts import get_object_or_404

# Initialize client inside a function or check for keys to avoid boot errors
def get_razorpay_client():
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class SettlementViewSet(viewsets.ModelViewSet):
    queryset = Settlement.objects.all()
    serializer_class = SettlementSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Settlement.objects.filter(Q(paid_by=self.request.user) | Q(paid_to=self.request.user))


    @decorators.action(detail=False, methods=['post'], url_path='create-order')
    def create_order(self, request):
        amount = request.data.get('amount')
        currency = request.data.get('currency', 'INR')
        paid_to_id = request.data.get('paid_to_id')
        
        if not amount or not paid_to_id:
            return Response({"error": "Amount and recipient are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Create Razorpay Order
        order_data = {
            'amount': int(float(amount) * 100), # amount in paise
            'currency': currency,
            'payment_capture': 1
        }
        
        if order_data['amount'] < 100:
            return Response({"error": "Minimum settlement amount is ₹1.00"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client = get_razorpay_client()
            order = client.order.create(data=order_data)

            return Response({
                "order_id": order['id'],
                "amount": order['amount'],
                "currency": order['currency'],
                "key_id": settings.RAZORPAY_KEY_ID
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @decorators.action(detail=False, methods=['post'], url_path='verify-payment')
    def verify_payment(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        group_id = request.data.get('group_id')
        paid_to_id = request.data.get('paid_to_id')
        amount = request.data.get('amount')

        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }

        try:
            # Verify Signature
            client = get_razorpay_client()
            client.utility.verify_payment_signature(params_dict)

            
            # Record Settlement
            from accounts.models import User
            from groups.models import Group
            group = get_object_or_404(Group, id=group_id)
            paid_to = get_object_or_404(User, id=paid_to_id)
            
            settlement = Settlement.objects.create(
                group=group,
                paid_by=request.user,
                paid_to=paid_to,
                amount=amount,
                recorded_by=request.user,
                is_confirmed=True
            )

            
            return Response(SettlementSerializer(settlement).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"VERIFICATION ERROR: {str(e)}")
            return Response({"error": f"Payment verification failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


