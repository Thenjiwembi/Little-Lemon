import { useEffect, useReducer, useState } from "react";
import { getLocalDate, initializeTimes, updateTimes } from "./bookingUtils";

const OCCASIONS = ["Birthday", "Anniversary", "Date night", "Other"];

function timesReducer(state, action) {
  if (action.type === "availabilityLoaded") {
    return updateTimes(action.bookings);
  }
  return state;
}

export default function App() {
  const [form, setForm] = useState({
    first_name: "",
    reservation_date: getLocalDate(),
    reservation_slot: "",
    number_of_guests: "2",
    occasion: "Other",
  });
  const [availableTimes, dispatchTimes] = useReducer(timesReducer, initializeTimes());
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);
  const allTimes = initializeTimes();

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "reservation_date" ? { reservation_slot: "" } : {}),
    }));
  };

  async function loadAvailability(date) {
    try {
      const response = await fetch(`/bookings?date=${encodeURIComponent(date)}`);
      if (!response.ok) throw new Error("Availability could not be loaded. Please try again.");
      dispatchTimes({ type: "availabilityLoaded", bookings: await response.json() });
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    }
  }

  useEffect(() => {
    loadAvailability(form.reservation_date);
  }, [form.reservation_date]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setLoading(true);
    setMessage("");
    try {
      await fetch("/csrf", { credentials: "same-origin" });
      const csrfToken = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("csrftoken="))
        ?.split("=")[1];
      const response = await fetch("/bookings", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRFToken": decodeURIComponent(csrfToken) } : {}),
        },
        body: JSON.stringify({
          ...form,
          number_of_guests: Number(form.number_of_guests),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const detail = data.detail || Object.values(data).flat().join(" ");
        throw new Error(detail || "Your reservation could not be completed.");
      }
      setMessage(
        `Your table is confirmed for ${data.reservation_date} at ${data.reservation_slot}.`
      );
      setMessageType("success");
      setForm((previous) => ({ ...previous, first_name: "", reservation_slot: "" }));
      await loadAvailability(form.reservation_date);
    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Little Lemon home">
          <span className="brand-mark" aria-hidden="true">LL</span>
          <span>Little Lemon</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#booking">Book a table</a>
        </nav>
      </header>

      <main id="home">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <p className="eyebrow">Chicago's neighborhood table</p>
            <h1 id="hero-title">Fresh flavors.<br /><em>Good company.</em></h1>
            <p className="lead">Seasonal Mediterranean dishes, bright ingredients, and a table waiting for you.</p>
            <a className="button" href="#booking">Reserve a table</a>
          </div>
          <div className="hero-art" role="img" aria-label="Illustration of a lemon">🍋</div>
        </section>

        <section className="booking-section" id="booking" aria-labelledby="booking-title">
          <div className="section-heading">
            <p className="eyebrow">Make it a date</p>
            <h2 id="booking-title">Book a table</h2>
            <p>Choose your date, time and party details below.</p>
          </div>

          <div className="booking-layout">
            <form className="card form-card" onSubmit={handleSubmit}>
              <div className={`message ${messageType}`} role="status" aria-live="polite">
                {message}
              </div>

              <label htmlFor="first_name">First name</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={form.first_name}
                onChange={updateField}
                minLength="2"
                maxLength="80"
                autoComplete="given-name"
                placeholder="e.g. Maya"
                required
              />

              <label htmlFor="reservation_date">Choose date</label>
              <input
                id="reservation_date"
                name="reservation_date"
                type="date"
                value={form.reservation_date}
                min={getLocalDate()}
                onChange={updateField}
                required
              />

              <label htmlFor="reservation_slot">Choose time</label>
              <select
                id="reservation_slot"
                name="reservation_slot"
                value={form.reservation_slot}
                onChange={updateField}
                required
              >
                <option value="">Select a time</option>
                {allTimes.map((slot) => (
                  <option key={slot} value={slot} disabled={!availableTimes.includes(slot)}>
                    {slot}{!availableTimes.includes(slot) ? " — booked" : ""}
                  </option>
                ))}
              </select>

              <label htmlFor="number_of_guests">Number of guests</label>
              <input
                id="number_of_guests"
                name="number_of_guests"
                type="number"
                min="1"
                max="10"
                value={form.number_of_guests}
                onChange={updateField}
                required
              />

              <label htmlFor="occasion">Occasion</label>
              <select id="occasion" name="occasion" value={form.occasion} onChange={updateField}>
                {OCCASIONS.map((occasion) => <option key={occasion}>{occasion}</option>)}
              </select>

              <button className="button submit-button" type="submit" disabled={loading}>
                {loading ? "Confirming..." : "Confirm reservation"}
              </button>
            </form>

            <aside className="card availability-card">
              <p className="eyebrow">Your evening</p>
              <h3>Good food is better shared.</h3>
              <p>We look forward to welcoming you. Booked times are disabled so you can choose an available table.</p>
              <p className="availability-note">Restaurant hours: 10:00–22:00</p>
              <p className="availability-note">Maximum party size: 10 guests</p>
            </aside>
          </div>
        </section>
      </main>

      <footer><p>Little Lemon · Chicago · Open daily 10:00–22:00</p></footer>
    </div>
  );
}
