
# SKAY (Copy)

This is a full-stack SKAY project scaffold with:
- React + Vite frontend using existing design and UI components
- Express + MongoDB backend with product, auth, order, and admin APIs

## Setup

1. Copy environment files:
   - `cp .env.example .env`
   - `cp backend/.env.example backend/.env`

2. Install dependencies:
   - Frontend: `npm install`
   - Backend: `cd backend && npm install`

3. Seed initial product data (backend):
   - `cd backend && npm run seed`

4. Run in development:
   - In root: `npm run dev` (front+backend concurrently)
   - Alternative: `npm run dev:client` and `cd backend && npm run dev` in separate terminals.

## Backend

- Entry: `backend/server.js`
- APIs:
  - `GET /api/products`
  - `GET /api/products/:id`
  - `POST /api/products`
  - `PUT /api/products/:id`
  - `DELETE /api/products/:id`
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/orders`
  - `GET /api/admin/stats`

- Database: MongoDB (use `MONGODB_URI` in backend `.env`)

## Frontend

- Base URL set by `VITE_API_URL` in `.env`
- API helper: `src/api/api.ts`
- Admin and product data are now fetched from backend where available.

## Build & Deploy

1. Build frontend: `npm run build`
2. Build backend: no compilation needed.
3. Set `NODE_ENV=production` in backend and serve static from `dist/` with `node backend/server.js`.

## Notes

- If PowerShell blocks scripts (e.g., npm command), run with `npm.cmd` or enable script execution policy.
- Adjust CORS and proxy settings in `vite.config.ts` for production domains.

  