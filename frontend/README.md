# Parsa Barber — Frontend

Animated marketing + booking site for the barbershop, built with React, Tailwind CSS, and
Framer Motion. It's a separate app from the FastAPI backend in `../app` — it talks to that API
over HTTP for real availability and bookings.

## Stack

- **React 18 + Vite**
- **Tailwind CSS 4** (config lives in `src/index.css` via `@theme`)
- **Framer Motion** — scroll reveals, page transitions, hover micro-interactions
- **React Router** — Home, Services, Barbers, Gallery, Booking, Contact
- **Lenis** — smooth scrolling
- **lucide-react** — icon set (brand icons like Instagram/Facebook are hand-rolled in
  `src/components/icons.jsx` since lucide dropped them)

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # optional, defaults work for local dev
npm run dev
```

Runs at http://localhost:5173. In dev, Vite proxies `/queue/*` requests to
`http://localhost:8002` (see `vite.config.js`), so start the backend too:

```bash
# from the repo root, in another terminal
source venv/bin/activate
uvicorn app.main:app --reload --port 8002
```

The Booking page (and the booking widget on Home) call the real
`/queue/available-times`, `/queue/checkin`, and `/queue/my-bookings` endpoints — bookings made
here show up in the staff dashboard at http://localhost:8002/dashboard.

## Environment variables

See `.env.example`:

- `VITE_API_BASE_URL` — leave unset in dev (uses the Vite proxy). Set to the deployed API
  origin in production.
- `VITE_INSTAGRAM_EMBED_URL` — optional SnapWidget/Elfsight embed `src` for a live Instagram
  feed. Without it, the Instagram section shows a themed placeholder grid linking out to the
  profile instead.

## Content

All shop copy, pricing, team bios, gallery images, and testimonials live in
`src/lib/content.js` — edit there rather than in the components. Photos are hotlinked stock
placeholders (Unsplash); swap in real shop photography by replacing the URLs.

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```
