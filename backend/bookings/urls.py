from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TurfViewSet, BookingViewSet

router = DefaultRouter()
router.register(r'turfs', TurfViewSet, basename='turf')
router.register(r'reservations', BookingViewSet, basename='reservation')

urlpatterns = [
    path('', include(router.urls)),
]