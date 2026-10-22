from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer
from accounts.permissions import IsStaffOrAdminRole

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admins & Staff can view all payments
        if user.role in ['ADMIN', 'STAFF']:
            return Payment.objects.all().order_by('-created_at')
        # Customers can only view payments related to their own bookings
        return Payment.objects.filter(booking__customer=user).order_by('-created_at')

    @action(detail=True, methods=['patch'])
    def record_payment(self, request, pk=None):
        """Allow staff/admin to record a payment (advance or full)"""
        payment = self.get_object()
        
        # Only admin or staff can record/update payments
        if request.user.role not in ['ADMIN', 'STAFF']:
            return Response({"error": "You do not have permission to record payments."}, status=status.HTTP_403_FORBIDDEN)

        amount_paid_now = request.data.get('paid_amount')
        payment_method = request.data.get('payment_method')
        transaction_id = request.data.get('transaction_id', '')

        if amount_paid_now is None:
            return Response({"error": "Please provide 'paid_amount'."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount_paid_now = float(amount_paid_now)
        except ValueError:
            return Response({"error": "Invalid amount format."}, status=status.HTTP_400_BAD_REQUEST)

        # Update paid amount (accumulate advance payments if needed)
        payment.paid_amount = float(payment.paid_amount) + amount_paid_now
        if payment_method:
            payment.payment_method = payment_method
        if transaction_id:
            payment.transaction_id = transaction_id

        payment.save() # save() method in model automatically recalculates remaining balance and status
        
        serializer = self.get_serializer(payment)
        return Response({
            "message": "Payment recorded successfully.",
            "payment": serializer.data
        }, status=status.HTTP_200_OK)