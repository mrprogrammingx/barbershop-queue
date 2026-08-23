# Barbershop Queue

A simple barbershop queue management system: customers check in online, get a daily queue
position, and get emailed when they're next / when it's their turn. Staff manage the queue
from a lightweight dashboard.

## Stack

- **FastAPI** — backend/API
- **SQLAlchemy** — ORM, SQLite for dev, Postgres-ready (just change `DATABASE_URL`)
- **Jinja2** — minimal server-rendered check-in page and staff dashboard
- **Resend / SendGrid** — email notifications (pick one via `EMAIL_PROVIDER`)
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
    email.py            send notification via Resend/SendGrid
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
uvicorn app.main:app --reload
```

- Check-in page: http://localhost:8000/
- Staff dashboard: http://localhost:8000/dashboard
- Health check: http://localhost:8000/health
- API docs: http://localhost:8000/docs

## Email notifications

Set `EMAIL_PROVIDER` to `resend` or `sendgrid` and supply the matching API key
(`RESEND_API_KEY` / `SENDGRID_API_KEY`) plus `EMAIL_FROM`. With `EMAIL_DRY_RUN=true`
(the default), emails are logged instead of sent — handy for local development.

## Core features

1. **Customer check-in** — name, email, optional phone, joins today's queue.
2. **Queue position tracking** — auto-incrementing position, reset daily.
3. **Staff dashboard** — view current queue, call next, mark done/no-show.
4. **Email notifications** — sent when a customer becomes "next" and when it's "their turn".
5. **Admin controls** — toggle shop open/closed, reset today's queue.

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
