from django.utils import timezone
from rest_framework import serializers

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "id", "first_name", "reservation_date", "reservation_slot",
            "number_of_guests", "occasion",
        ]
        read_only_fields = ["id"]

    def validate_first_name(self, value):
        cleaned = " ".join(value.strip().split())
        if not cleaned or not any(character.isalpha() for character in cleaned):
            raise serializers.ValidationError("Please enter a valid first name.")
        return cleaned

    def validate_reservation_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError("Please choose today or a future date.")
        return value

    def validate_number_of_guests(self, value):
        if not 1 <= value <= 10:
            raise serializers.ValidationError("Choose between 1 and 10 guests.")
        return value

    def validate(self, attrs):
        date = attrs.get("reservation_date")
        slot = attrs.get("reservation_slot")
        if date and slot and Booking.objects.filter(
            reservation_date=date, reservation_slot=slot
        ).exists():
            raise serializers.ValidationError(
                {"reservation_slot": "That time is already booked for this date."}
            )
        return attrs


class AvailabilitySerializer(serializers.ModelSerializer):
    """Expose only the date and time needed by the public availability UI."""

    class Meta:
        model = Booking
        fields = ["reservation_date", "reservation_slot"]
