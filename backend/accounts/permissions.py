from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """Allows access only to Admin users."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'

class IsStaffOrAdminRole(permissions.BasePermission):
    """Allows access to Admin and Staff users."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'STAFF']

class IsCustomerRole(permissions.BasePermission):
    """Allows access only to Customers."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'CUSTOMER'