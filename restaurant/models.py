from django.core.validators import MinLengthValidator, MinValueValidator, MaxValueValidator
from django.db import models


class Booking(models.Model):
    RESERVATION_SLOTS = [(f"{hour:02d}:00", f"{hour:02d}:00") for hour in range(10, 22)]
    OCCASIONS = [
        ("Birthday", "Birthday"),
        ("Anniversary", "Anniversary"),
        ("Date night", "Date night"),
        ("Other", "Other"),
    ]

    first_name = models.CharField(max_length=80, validators=[MinLengthValidator(2)])
    reservation_date = models.DateField()
    reservation_slot = models.CharField(max_length=5, choices=RESERVATION_SLOTS)
    number_of_guests = models.PositiveSmallIntegerField(
        default=2, validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    occasion = models.CharField(max_length=20, choices=OCCASIONS, default="Other")

    class Meta:
        ordering = ["reservation_date", "reservation_slot", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["reservation_date", "reservation_slot"],
                name="unique_booking_date_and_slot",
            ),
            models.CheckConstraint(
                check=models.Q(number_of_guests__gte=1) & models.Q(number_of_guests__lte=10),
                name="booking_guest_count_1_to_10",
            ),
        ]

    def __str__(self):
        return f"{self.first_name} — {self.reservation_date} at {self.reservation_slot}"
