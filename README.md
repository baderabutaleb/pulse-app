# Pulse

10 curated news cards every morning. Mobile-first PWA — installable on iPhone via Safari "Add to Home Screen".

---

## Architecture

```
pulse-app/
├── frontend/   React + Vite PWA (port 5173)
└── backend/    FastAPI + APScheduler (port 8000)
```

---

## Prerequisites

- Node.js 18+
- Python 3.10+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

---

## Database setup

Run these SQL statements once in the Supabase SQL editor:

```sql
-- Daily cards
create table daily_cards (
  id           uuid primary key default gen_random_uuid(),
  date         date unique not null,
  cards        jsonb not null,
  generated_at timestamptz not null default now()
);

-- User streaks
create table user_streaks (
  id              uuid primary key default gen_random_uuid(),
  device_id       text unique not null,
  streak_count    int not null default 1,
  last_seen_date  date not null,
  first_seen_date date not null,
  created_at      timestamptz not null default now()
);
```

---

## Environment variables

### Backend — `backend/.env`

Copy `backend/.env.example`:

```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
CLAUDE_MODEL=claude-sonnet-4-20250514
CORS_ORIGINS=http://localhost:5173
```

### Frontend — `frontend/.env`

```
VITE_API_URL=
```

Leave blank to use the Vite dev proxy (routes `/api/*` → `localhost:8000`).
In production set `VITE_API_URL=https://your-backend.onrender.com`.

---

## Run locally

```bash
# Terminal 1 — backend
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # fill in your keys
uvicorn main:app --reload

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Seed the database (first run)

The cron job runs at 04:00 UTC. To generate cards right now:

```bash
curl -X POST http://localhost:8000/api/admin/generate
# specific date:
curl -X POST "http://localhost:8000/api/admin/generate?target_date=2026-05-11"
```

---

## API reference

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/cards/today` | Today's cards (falls back to yesterday if not yet generated) |
| `GET`  | `/api/cards/date/{YYYY-MM-DD}` | Cards for a specific date |
| `POST` | `/api/streak/ping` | Update/create streak for a device |
| `POST` | `/api/admin/generate` | Manually trigger card generation |
| `GET`  | `/health` | Health check |

`POST /api/streak/ping` body: `{ "device_id": "uuid-string" }`

---

## Deploy to Render

### Backend (Web Service)

1. New **Web Service** → root dir `backend`
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Set all env vars from `.env.example`; set `CORS_ORIGINS` to your frontend URL

### Frontend (Static Site)

1. New **Static Site** → root dir `frontend`
2. Build command: `npm install && npm run build`
3. Publish dir: `dist`
4. Env var: `VITE_API_URL=https://your-backend.onrender.com`

---

## PWA — Install on iPhone

1. Open the app in Safari
2. Tap Share → "Add to Home Screen"
3. App opens fullscreen with no browser chrome
