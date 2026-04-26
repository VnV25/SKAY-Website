# Deploy SKAY on Vercel (Serverless APIs + Supabase)

## 1) Required Environment Variables (Vercel → Project → Settings → Environment Variables)

Server-side (API routes):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

Client-side (Vite):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` = `/api`

Important:
- Never add `SUPABASE_SERVICE_ROLE_KEY` as a `VITE_*` variable.

## 2) Deploy Steps

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the repo into Vercel.
3. Set the environment variables above for `Production` (and optionally `Preview`).
4. Deploy.

Vercel will:
- Build the frontend to `frontend/dist` (configured in `vercel.json`)
- Serve serverless APIs from `/api/*`

## 3) Quick Smoke Tests (after deploy)

- `GET /api/health`
- `POST /api/auth/customer/login`
- `POST /api/auth/admin/login`

## 4) Local Development (optional)

Recommended (full stack):
- Install Vercel CLI: `npm i -g vercel`
- Run: `npm run dev:vercel`

Frontend-only (if needed):
- Run: `cd frontend && npm run dev`
- Ensure Vercel dev is running on `http://localhost:3005` for `/api` proxy (see `frontend/vite.config.ts`).
