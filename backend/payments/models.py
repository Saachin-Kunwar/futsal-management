from django.db import models
from bookings.models import Booking

class Payment(models.Model):
    class Method(models.TextChoices):
        CASH = 'CASH', 'Cash'
        ESEWA = 'ESEWA', 'eSewa'
        KHALTI = 'KHALTI', 'Khalti'
        BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer'

    class Status(models.TextChoices):
        PAID = 'PAID', 'Paid'
        UNPAID = 'UNPAID', 'Unpaid'
        PARTIALLY_PAID = 'PARTIALLY_PAID', 'Partially Paid'

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    remaining_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    payment_method = models.CharField(max_length=30, choices=Method.choices, default=Method.CASH)
    payment_status = models.CharField(max_length=20, choices=Status.choices, default=Status.UNPAID)
    
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Automatically calculate remaining balance & status
        self.remaining_balance = self.total_amount - self.paid_amount
        if self.paid_amount >= self.total_amount:
            self.payment_status = self.Status.PAID
            self.remaining_balance = 0.00
        elif self.paid_amount > 0:
            self.payment_status = self.Status.PARTIALLY_PAID
        else:
            self.payment_status = self.Status.UNPAID
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payment for Booking #{self.booking.id} - {self.payment_status}"