from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils import timezone
from django.db.models import Sum
from accounts.models import User
from bookings.models import Booking
from payments.models import Payment
from accounts.permissions import IsStaffOrAdminRole
from bookings.serializers import BookingSerializer

class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStaffOrAdminRole]

    def get(self, request):
        today = timezone.now().date()

        # 1. Today's Bookings
        todays_bookings_qs = Booking.objects.filter(date=today).order_by('start_time')
        todays_bookings_serializer = BookingSerializer(todays_bookings_qs, many=True)

        # 2. Today's Income (Sum of paid_amount for payments updated/made today)
        todays_payments = Payment.objects.filter(updated_at__date=today)
        todays_income = todays_payments.aggregate(total=Sum('paid_amount'))['total'] or 0.00

        # 3. Total Registered Customers
        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()

        # 4. Upcoming Bookings (Bookings after today with CONFIRMED or PENDING status)
        upcoming_qs = Booking.objects.filter(date__gt=today, status__in=[Booking.Status.CONFIRMED, Booking.Status.PENDING]).order_by('date', 'start_time')[:10]
        upcoming_serializer = BookingSerializer(upcoming_qs, many=True)

        # 5. Cancelled Bookings
        cancelled_qs = Booking.objects.filter(status=Booking.Status.CANCELLED).order_by('-date')[:10]
        cancelled_serializer = BookingSerializer(cancelled_qs, many=True)

        data = {
            "metrics": {
                "todays_bookings_count": todays_bookings_qs.count(),
                "todays_income": todays_income,
                "total_customers": total_customers,
                "upcoming_bookings_count": Booking.objects.filter(date__gt=today, status__in=[Booking.Status.CONFIRMED, Booking.Status.PENDING]).count(),
                "cancelled_bookings_count": Booking.objects.filter(status=Booking.Status.CANCELLED).count(),
            },
            "todays_bookings": todays_bookings_serializer.data,
            "upcoming_bookings": upcoming_serializer.data,
            "cancelled_bookings": cancelled_serializer.data,
        }

        return Response(data, status=200)