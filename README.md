# Barbershop Queue

A simple barbershop queue management system: customers pick an available appointment time and
check in online with name and phone, and the admin gets emailed whenever someone joins. Staff
manage the queue and appointment slot settings from a lightweight dashboard.

## Stack

- **FastAPI** — backend/API
- **SQLAlchemy** — ORM, SQLite for dev, Postgres-ready (just change `DATABASE_URL`)
- **Jinja2** — minimal server-rendered check-in page and staff dashboard
- **Resend / SendGrid** — admin email notifications (pick one via `EMAIL_PROVIDER`)
- **Pydantic** — request/response schemas

## Project structure

```
app/
  main.py            FastAPI app entrypoint
  models.py           SQLAlchemy models: Customer, QueueEntry, ShopStatus
  schemas.py           Pydantic schemas
  database.py          DB session/engine setup
  routers/
    queue.py           check-in, position, call-next, done, no-show
    admin.py            open/close, reset queue
  services/
    email.py            notify admin via Resend/SendGrid when a customer checks in
  templates/            Jinja2 check-in page + staff dashboard
tests/
```

## Setup

Create and activate a virtual environment, then install dependencies:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Copy the env file and fill in your values (SQLite/dry-run email works out of the box with no changes):

```bash
cp .env.example .env
```

## Run

```bash
uvicorn app.main:app --reload --port 8002
```

- Check-in page: http://localhost:8002/
- Staff dashboard: http://localhost:8002/dashboard
- Health check: http://localhost:8002/health
- API docs: http://localhost:8002/docs

## Email notifications

Set `ADMIN_EMAIL` to the address that should be notified when a customer checks in. Set
`EMAIL_PROVIDER` to `resend` or `sendgrid` and supply the matching API key
(`RESEND_API_KEY` / `SENDGRID_API_KEY`) plus `EMAIL_FROM`. With `EMAIL_DRY_RUN=true`
(the default), emails are logged instead of sent — handy for local development. Customers
are not emailed; only the admin address is notified.

## Core features

1. **Appointment slots** — admin sets open/close time, slot length, and capacity per slot;
   customers see live availability and pick an open time at check-in.
2. **Customer check-in** — name and phone (both required), joins today's queue at the chosen slot.
3. **Queue position tracking** — auto-incrementing position, ordered by appointment time.
4. **Staff dashboard** — view current queue, call next, mark done/no-show, edit slot settings.
5. **Admin email notification** — sent to `ADMIN_EMAIL` whenever a customer checks in.
6. **Admin controls** — toggle shop open/closed, set shop hours text, reset today's queue.
7. **Queue history** — browse past days' queue entries by date.
8. **Customers page** — every customer who's ever checked in, with visit counts.

## Tests

```bash
pytest
```

## Switching to Postgres

Set `DATABASE_URL` in `.env`, e.g.:

```
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/barbershop
```

You'll also need to add `psycopg2-binary` to `requirements.txt`.
