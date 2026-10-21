from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        STAFF = 'STAFF', 'Staff'
        CUSTOMER = 'CUSTOMER', 'Customer'

    base_role = Role.CUSTOMER

    role = models.CharField(max_length=50, choices=Role.choices, default=base_role)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.role = self.base_role
            if self.is_superuser:
                self.role = self.Role.ADMIN
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"