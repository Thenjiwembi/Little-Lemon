export const TIME_SLOTS = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 10;
  return `${String(hour).padStart(2, "0")}:00`;
});

export function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function initializeTimes() {
  return TIME_SLOTS;
}

export function updateTimes(bookings) {
  const unavailable = new Set(bookings.map((booking) => booking.reservation_slot));
  return TIME_SLOTS.filter((slot) => !unavailable.has(slot));
}
