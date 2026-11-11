from datetime import date, timedelta

from django.test import TestCase
from rest_framework.test import APIClient

from .models import Booking


class BookingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.reservation_date = date.today() + timedelta(days=1)
        self.payload = {
            "first_name": "Maya",
            "reservation_date": self.reservation_date.isoformat(),
            "reservation_slot": "18:00",
            "number_of_guests": 3,
            "occasion": "Birthday",
        }

    def test_booking_page_loads_and_contains_required_fields(self):
        response = self.client.get("/book/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'name="first_name"')
        self.assertContains(response, 'name="reservation_date"')
        self.assertContains(response, 'name="reservation_slot"')

    def test_create_booking_and_retrieve_availability_as_json(self):
        response = self.client.post("/bookings", self.payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["number_of_guests"], 3)
        listing = self.client.get("/bookings", {"date": self.reservation_date.isoformat()})
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(len(listing.json()), 1)
        self.assertEqual(listing.json()[0]["reservation_slot"], "18:00")
        self.assertNotIn("first_name", listing.json()[0])

    def test_duplicate_booking_is_rejected(self):
        self.client.post("/bookings", self.payload, format="json")
        response = self.client.post("/bookings", self.payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Booking.objects.count(), 1)

    def test_reservations_page_loads(self):
        response = self.client.get("/reservations/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No Booking")

    def test_invalid_name_is_rejected(self):
        response = self.client.post("/bookings", {**self.payload, "first_name": "1"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_guest_count_outside_allowed_range_is_rejected(self):
        response = self.client.post(
            "/bookings", {**self.payload, "number_of_guests": 11}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_past_reservation_date_is_rejected(self):
        response = self.client.post(
            "/bookings",
            {**self.payload, "reservation_date": (date.today() - timedelta(days=1)).isoformat()},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_csrf_endpoint_sets_cookie(self):
        response = self.client.get("/csrf/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("csrftoken", response.cookies)
