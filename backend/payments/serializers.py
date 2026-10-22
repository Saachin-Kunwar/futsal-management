from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)
    customer_name = serializers.CharField(source='booking.customer.username', read_only=True)
    turf_name= serializers.CharField(source='booking.turf.name', read_only=True)
    booking_date= serializers.DateField(source='booking.date', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'booking_id', 'customer_name', 'turf_name', 'booking_date',
            'total_amount', 'paid_amount', 'remaining_balance',
            'payment_method', 'payment_status', 'transaction_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['total_amount', 'remaining_balance', 'payment_status', 'created_at', 'updated_at']
