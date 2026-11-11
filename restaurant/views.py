from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Booking
from .serializers import AvailabilitySerializer, BookingSerializer


def home(request):
    return render(request, "restaurant/home.html")


def book_page(request):
    return render(request, "restaurant/book.html", {"reservation_slots": Booking.RESERVATION_SLOTS})


def reservations_page(request):
    return render(request, "restaurant/reservations.html")


@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})


@api_view(["GET", "POST"])
def bookings_api(request):
    if request.method == "GET":
        queryset = Booking.objects.all()
        requested_date = request.query_params.get("date")
        if requested_date:
            queryset = queryset.filter(reservation_date=requested_date)
        # Public clients need availability only, not other customers' personal details.
        return Response(AvailabilitySerializer(queryset, many=True).data)

    serializer = BookingSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            booking = serializer.save()
    except IntegrityError:
        return Response(
            {"detail": "That reservation slot was just booked by another customer. Please choose another time."},
            status=status.HTTP_409_CONFLICT,
        )

    return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
