from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("book/", views.book_page, name="book"),
    path("reservations/", views.reservations_page, name="reservations"),
    path("csrf/", views.csrf_token, name="csrf-token"),
    path("bookings", views.bookings_api, name="bookings-api"),
]
