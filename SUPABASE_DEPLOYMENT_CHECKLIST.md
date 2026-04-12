# Supabase Backend Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Create Supabase Project
- [ ] Go to https://supabase.com
- [ ] Create a new project (free tier)
- [ ] Wait for provisioning (2-3 minutes)
- [ ] Note the project name and URL

### 2. Get API Keys
- [ ] In Supabase dashboard, go to **Settings > API**
- [ ] Copy **Project URL** → Save as `SUPABASE_URL`
- [ ] Copy **Service Role Secret** (click "Reveal" button) → Save as `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Copy **Anon Public** key → Save as `SUPABASE_ANON_KEY` (for frontend)

### 3. Create Database Schema
- [ ] Open `SUPABASE_DATABASE_SCHEMA.sql` in project root
- [ ] In Supabase dashboard, go to **SQL Editor**
- [ ] Click "New Query"
- [ ] Paste the entire SQL file
- [ ] Review the commands (should create 5 tables: profiles, orders, carts, wishlists, contacts)
- [ ] Click "Run" to execute
- [ ] Verify tables appear in **Table Editor**

### 4. Configure Backend Environment
- [ ] `cd backend`
- [ ] Copy `.env.example` to `.env`
- [ ] Update values:
  ```
  SUPABASE_URL=<your-project-url>
  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
  SUPABASE_ANON_KEY=<your-anon-key>
  JWT_SECRET=<generate-a-random-string>
  ```
- [ ] Do NOT commit `.env` to git (it has secrets!)

### 5. Test Local Development
- [ ] `npm install` (if not already done)
- [ ] `npm run dev` to start backend
- [ ] Test health check: `curl http://localhost:5000/api/health`
- [ ] Should respond with `"database": "connected"`

### 6. Configure Frontend (if using Supabase Auth)
- [ ] Open `frontend/.env`
- [ ] Add:
  ```
  VITE_SUPABASE_URL=<your-supabase-url>
  VITE_SUPABASE_ANON_KEY=<your-anon-key>
  ```
- [ ] Update Supabase client in `frontend/src/lib/supabase.ts`:
  ```typescript
  import { createClient } from '@supabase/supabase-js'
  
  export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )
  ```

---

## 🚀 Deployment: Local Testing

### Backend Health Check
```bash
cd backend
npm run dev
```
Response should be:
```json
{
  "status": "OK",
  "message": "SKAY backend running",
  "database": "connected"
}
```

### Test Authentication (Optional)
```bash
# Customer Register
curl -X POST http://localhost:5000/api/auth/customer/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
  }'

# Customer Login
curl -X POST http://localhost:5000/api/auth/customer/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

---

## 🌐 Production Deployment Options

### Option 1: Vercel (Recommended for Node.js)
- [ ] Push code to GitHub
- [ ] Go to https://vercel.com
- [ ] Click "New Project"
- [ ] Select your GitHub repository
- [ ] In "Environment Variables", add:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `JWT_SECRET`
  - `FRONTEND_ORIGIN=https://your-frontend-domain.com`
- [ ] Deploy!
- [ ] Test: `https://your-project.vercel.app/api/health`

### Option 2: Railway
- [ ] Go to https://railway.app
- [ ] Create new project
- [ ] Connect GitHub repo
- [ ] Add environment variables in "Variables"
- [ ] Deploy automatically on push

### Option 3: Heroku
- [ ] Install Heroku CLI
- [ ] Run: `heroku create your-app-name`
- [ ] Set environment variables:
  ```bash
  heroku config:set SUPABASE_URL=your_url
  heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_key
  heroku config:set JWT_SECRET=your_secret
  ```
- [ ] Deploy: `git push heroku main`

### Option 4: Self-hosted (AWS, DigitalOcean, etc.)
- [ ] Rent a server (recommended: Node.js hosting)
- [ ] Install Node.js 18+
- [ ] Clone repository
- [ ] Create `.env` with production values
- [ ] Install PM2: `npm install -g pm2`
- [ ] Start: `pm2 start backend/server.js`
- [ ] Setup reverse proxy (Nginx)

---

## 🔒 Production Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_ORIGIN` to your actual frontend domain
- [ ] Enable HTTPS (most platforms do this automatically)
- [ ] Set up Supabase backup: `Settings > Backups`
- [ ] Enable database encryption (Supabase default)
- [ ] Review Row Level Security (RLS) policies
- [ ] Monitor backend logs for errors
- [ ] Set up error tracking (Sentry, LogRocket, etc.)

---

## 🆘 Troubleshooting

### Backend won't start
```
Error: Cannot find module '@supabase/supabase-js'
```
**Solution:** `cd backend && npm install`

### Health check fails
```
Error: Supabase credentials not configured
```
**Solution:** Check `.env` file has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### Authentication fails
```
Error: Invalid token
```
**Solution:** Ensure user exists in Supabase Auth (check in `Authentication > Users`)

### Can't connect to Supabase
```
Error: 404 Not Found
```
**Solution:** Check `SUPABASE_URL` is correct (no trailing slash)

### RLS policy violation
```
Error: new row violates row-level security policy
```
**Solution:** Ensure service role key is used for admin operations, anon key for user operations

---

## 📊 Monitoring & Maintenance

### Check Database Status
- Supabase Dashboard > Database > Replication Status

### View Backend Logs
- Vercel: Deployments > Logs
- Railway: Deployments > Logs
- Heroku: `heroku logs -t`

### Monitor API Health
Set up a monitoring service (UptimeRobot, StatusPage, etc.) to regularly check:
```
GET https://your-backend.com/api/health
```

### Backup Database
Supabase automatically creates backups. You can:
- Download backups: Settings > Backups
- Schedule daily backups
- Restore from backup if needed

---

## ✨ Next Steps

1. ✅ All backend users migrated from MongoDB to Supabase
2. ✅ Authentication ready with Supabase Auth
3. ✅ Database schema created and tested
4. [ ] Update all routes to use database functions (see `ROUTE_MIGRATION_GUIDE.md`)
5. [ ] Test all API endpoints
6. [ ] Deploy to production
7. [ ] Monitor and maintain

---

## 📚 Resources

- Supabase Documentation: https://supabase.com/docs
- Express Deployment: https://expressjs.com/en/advanced/best-practice-performance.html
- Vercel Deployment: https://vercel.com/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/

---

**Migration completed: MongoDB → Supabase ✅**
Deployment is now much easier and more scalable!
