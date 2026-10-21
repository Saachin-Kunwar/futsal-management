from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Turf, Booking
from .serializers import TurfSerializer, BookingSerializer
from accounts.permissions import IsStaffOrAdminRole

class TurfViewSet(viewsets.ModelViewSet):
    queryset = Turf.objects.all()
    serializer_class = TurfSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admins & Staff can see all bookings
        if user.role in ['ADMIN', 'STAFF']:
            return Booking.objects.all().order_by('-date', '-start_time')
        # Customers can only see their own bookings
        return Booking.objects.filter(customer=user).order_by('-date', '-start_time')

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == Booking.Status.CANCELLED:
            return Response({"error": "Booking is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Customers can cancel only if pending or confirmed
        booking.status = Booking.Status.CANCELLED
        booking.save()
        return Response({"message": "Booking cancelled successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def receipt(self, request, pk=None):
        booking = self.get_object()
        try:
            payment = booking.payment
        except Exception:
            return Response({"error": "Payment record not found."}, status=status.HTTP_404_NOT_FOUND)
        
        receipt_data = {
            "booking_id": booking.id,
            "customer": booking.customer.username,
            "turf": booking.turf.name,
            "date": booking.date,
            "time": f"{booking.start_time} - {booking.end_time}",
            "total_price": payment.total_amount,
            "paid_amount": payment.paid_amount,
            "remaining_balance": payment.remaining_balance,
            "payment_status": payment.payment_status,
            "payment_method": payment.payment_method,
            "created_at": booking.created_at
        }
        return Response(receipt_data, status=status.HTTP_200_OK)