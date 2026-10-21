from django.db import models
from django.conf import settings

class Turf(models.Model):
    name = models.CharField(max_length=100, default="Main Turf")
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        COMPLETED = 'COMPLETED', 'Completed'

    class ShiftType(models.TextChoices):
        MORNING = 'MORNING', 'Morning'
        AFTERNOON = 'AFTERNOON', 'Afternoon'
        EVENING = 'EVENING', 'Evening'

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    turf = models.ForeignKey(Turf, on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_hours = models.IntegerField(default=1) # 1 or 2 hours
    shift = models.CharField(max_length=20, choices=ShiftType.choices)
    
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_peak_hour = models.BooleanField(default=False)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.username} - {self.date} ({self.start_time} to {self.end_time})"