from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Turf, Booking
from payments.models import Payment

class TurfSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turf
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    customer_username = serializers.CharField(source='customer.username', read_only=True)
    turf_name = serializers.CharField(source='turf.name', read_only=True)
    payment_status = serializers.CharField(source='payment.payment_status', read_only=True)
    remaining_balance = serializers.DecimalField(source='payment.remaining_balance', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'customer', 'customer_username', 'turf', 'turf_name',
            'date', 'start_time', 'end_time', 'duration_hours', 'shift',
            'total_price', 'is_peak_hour', 'status', 'payment_status',
            'remaining_balance', 'created_at'
        ]
        read_only_fields = ['customer', 'total_price', 'is_peak_hour', 'status', 'created_at']

    def validate(self, data):
        date = data.get('date')
        start_time = data.get('start_time')
        duration_hours = data.get('duration_hours', 1)
        turf = data.get('turf')

        # 1. Date validation (Cannot book in the past)
        if date < timezone.now().date():
            raise serializers.ValidationError({"date": "You cannot book a turf for a past date."})

        # 2. Calculate end time based on duration (1 or 2 hours)
        start_dt = datetime.combine(date, start_time)
        end_dt = start_dt + timedelta(hours=duration_hours)
        end_time = end_dt.time()
        data['end_time'] = end_time

        # 3. Determine Shift & Peak Hours
        # Peak hours: 4:00 PM (16:00) to 9:00 PM (21:00)
        hour = start_time.hour
        if 6 <= hour < 12:
            data['shift'] = Booking.ShiftType.MORNING
        elif 12 <= hour < 16:
            data['shift'] = Booking.ShiftType.AFTERNOON
        else:
            data['shift'] = Booking.ShiftType.EVENING

        # Peak hours rule: Evening shift or hours between 16:00 and 21:00
        if 16 <= hour < 21:
            data['is_peak_hour'] = True
            base_rate_per_hour = 1500.00  # NPR per hour peak
        else:
            data['is_peak_hour'] = False
            base_rate_per_hour = 1000.00  # NPR per hour off-peak

        data['total_price'] = base_rate_per_hour * duration_hours

        # 4. Strict Overlap / Double Booking Prevention
        # Overlapping condition: (ExistingStart < NewEnd) AND (ExistingEnd > NewStart)
        overlapping_bookings = Booking.objects.filter(
            turf=turf,
            date=date,
            status__in=[Booking.Status.PENDING, Booking.Status.CONFIRMED]
        ).filter(
            start_time__lt=end_time,
            end_time__gt=start_time
        )

        if self.instance:
            # Exclude current booking if updating/rescheduling
            overlapping_bookings = overlapping_bookings.exclude(pk=self.instance.pk)

        if overlapping_bookings.exists():
            raise serializers.ValidationError(
                {"non_field_errors": "This turf is already booked for the selected time slot. Please choose another time."}
            )

        return data

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['customer'] = request.user
        validated_data['status'] = Booking.Status.PENDING

        booking = super().create(validated_data)

        # Automatically initialize a payment record as Unpaid when a booking is created
        Payment.objects.create(
            booking=booking,
            total_amount=booking.total_price,
            paid_amount=0.00,
            payment_status='UNPAID'
        )
        return booking