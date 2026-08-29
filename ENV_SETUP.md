# Environment setup

How to give each part of the app its Supabase credentials — safely.

## The one rule

- **service_role / secret key → server only** (the Python `backend/`, Supabase
  Edge Functions). Full access, bypasses Row Level Security. Never in the
  browser, never in a `VITE_` variable, never committed to git.
- **publishable / anon key → the frontend.** Safe to expose in the client;
  Row Level Security protects the data.

Crossing them is the one real mistake to avoid: a service_role key in a `VITE_`
variable ships full database access to every visitor.

## Backend (`backend/.env`)

Copy `backend/.env.example` → `backend/.env` and fill in:

| Variable | What it is | Used by |
| --- | --- | --- |
| `SUPABASE_URL` | Project API URL | all scripts |
| `SUPABASE_SERVICE_KEY` | **service_role secret** | `sync_insiders_trades.py`, `generate_insider_avatars.py` (writes + storage) |
| `SUPABASE_KEY` | publishable / anon (read-only) | `fetch_cala.py` |
| `CALA_API_KEY` | Cala API key | Cala fetch / sync |

`backend/.env` is gitignored.

## Frontend (`frontend/.env.local`)

Copy `frontend/.env.example` → `frontend/.env.local` and fill in
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (anon key only).
`frontend/.env.local` is gitignored via `*.local`.

## Where to find the keys

Supabase Dashboard → **Project Settings → API**:

- **Project URL** and **anon / publishable key** → the frontend and `SUPABASE_KEY`.
- **service_role secret** → `SUPABASE_SERVICE_KEY` (backend only).

## Deploy

- **Netlify (frontend):** Site settings → Environment variables →
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Do **not** add the service key.
- **Backend host:** set `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_KEY`,
  and `CALA_API_KEY` as the host's env vars / secrets — not in a committed file.

## If a secret leaks

If the service_role key is ever committed or shared, rotate it immediately:
Dashboard → Project Settings → API → reset the service_role key.
