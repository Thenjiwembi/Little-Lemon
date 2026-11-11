# Little Lemon Restaurant Booking Application

A restaurant table-booking application with a **React frontend**, **Django REST Framework API**, and **PostgreSQL database** (configured for Supabase). The frontend includes a responsive booking form, live availability checks, accessible labels and feedback, and React unit tests.

## Features

- Responsive Little Lemon restaurant landing and booking experience.
- React controlled form using `useState` and `useEffect`.
- Booking fields: first name, date, time, number of guests, and occasion.
- Available time slots update when the selected date changes.
- Client-side HTML validation and server-side Django REST Framework validation.
- Duplicate date/time bookings prevented by both application validation and a database unique constraint.
- Maximum party size of 10 guests.
- Public availability endpoint returns only date and time, not customer names.
- CSRF-protected booking creation.
- Django backend tests and React/Vitest frontend tests.
- Django admin for staff to manage booking records.

## Technology

- React 18, Vite, JavaScript, CSS
- Django 5, Django REST Framework
- PostgreSQL (Supabase supported)
- Vitest and React Testing Library
- Pipenv for Python dependencies

## Requirements

- Python 3.12+
- Pipenv
- Node.js 20+ and npm
- A PostgreSQL database. A Supabase PostgreSQL project is supported.

## 1. Configure the Django backend

From the project root:

```bash
pip install pipenv
pipenv install
```

Create your local environment file:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS/Linux**
```bash
cp .env.example .env
```

Update `.env` with your own values:

```env
DJANGO_SECRET_KEY=replace-with-a-long-random-secret
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
DATABASE_SSL_REQUIRE=True
```

Get the database connection string from your Supabase project's **Project Settings → Database**. Do not commit `.env` or share your database password.

Apply database migrations and start Django:

```bash
pipenv run python manage.py check
pipenv run python manage.py migrate
pipenv run python manage.py runserver
```

The backend API is available at `http://127.0.0.1:8000/bookings`.

## 2. Configure the React frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`. Vite proxies `/bookings` and `/csrf` requests to the Django backend at port 8000.

## 3. Run tests

Backend tests (from the project root; configured PostgreSQL database must be reachable):

```bash
pipenv run python manage.py test
```

Frontend tests (from the `frontend` folder):

```bash
npm test
```

Create a production frontend build:

```bash
cd frontend
npm run build
```

## API

### Check availability

`GET /bookings?date=YYYY-MM-DD`

Returns only the reservation date and time for public availability checking.

### Create a booking

`POST /bookings`

JSON body:

```json
{
  "first_name": "Maya",
  "reservation_date": "2027-05-20",
  "reservation_slot": "18:00",
  "number_of_guests": 3,
  "occasion": "Birthday"
}
```

A valid request returns HTTP `201`. Invalid data returns HTTP `400`; a slot taken concurrently returns HTTP `409`.

## GitHub submission

1. Create a GitHub repository for the project.
2. Ensure `.env` is not tracked and no database credentials are committed.
3. Commit the project, including both the `frontend` and Django backend folders.
4. Push your changes to GitHub.
5. Paste the repository URL into the Coursera **My submission** section.

## Important submission note

The Coursera brief specifically asks for a React application. Submit the React frontend in the `frontend` folder together with the Django backend. The original Django templates are retained as a fallback/reference implementation; the React app is the frontend entry point for the capstone.
