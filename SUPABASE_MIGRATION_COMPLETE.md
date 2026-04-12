# Backend Migration: MongoDB to Supabase

## Overview
The backend has been migrated from MongoDB to Supabase (PostgreSQL). This makes deployment significantly easier since Supabase provides managed PostgreSQL hosting with authentication included.

## Key Changes

### 1. **Database Layer**
- Removed: Mongoose ODM
- Added: Supabase PostgreSQL with direct queries via `@supabase/supabase-js`
- Location: `backend/lib/db.js` - Contains all database query functions

### 2. **Authentication**
- Changed: JWT-only authentication
- Now: Supabase Auth + JWT fallback (for backward compatibility)
- Middleware updated: `backend/middleware/auth.js`
- New routes: `backend/routes/auth-supabase.js` (recommended)

### 3. **Database Schema**
- Already defined in: `SUPABASE_DATABASE_SCHEMA.sql`
- Tables created:
  - `profiles` (users with Supabase Auth integration)
  - `orders`
  - `carts`
  - `wishlists`
  - `contacts`
  - Row Level Security (RLS) policies for data protection

## Setup Instructions

### Step 1: Set Up Supabase Project
1. Go to https://supabase.com
2. Create a new project (free tier available)
3. Wait for the project to initialize
4. Go to **Project Settings > API** and note:
   - `Project URL` → `SUPABASE_URL`
   - `Service Role Key` (hidden, click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Create Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Open `SUPABASE_DATABASE_SCHEMA.sql`
3. Copy all SQL commands and paste into the SQL Editor
4. Execute all queries

### Step 3: Configure Environment Variables
In `backend/.env`:
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
FRONTEND_ORIGIN=http://localhost:5173
PORT=5000
JWT_SECRET=your-jwt-secret-key
NODE_ENV=development
```

### Step 4: Install Dependencies
```bash
cd backend
npm install
```

**Note:** Mongoose is still listed but no longer used. You can remove it later:
```bash
npm remove mongoose
```

### Step 5: Run Backend
```bash
npm run dev
```

Test health check:
```bash
curl http://localhost:5000/api/health
```

## Migration Path

### Option A: Use New Supabase Auth Routes (Recommended)
Replace the import in `server.js`:
```javascript
// Change from:
const authRoutes = require('./routes/auth');
// To:
const authRoutes = require('./routes/auth-supabase');
```

### Option B: Gradual Migration
The old MongoDB routes still work with JWT tokens for backward compatibility. The middleware will accept both Supabase tokens and JWT tokens.

## Database Query Functions

All database operations are in `backend/lib/db.js`:

### Profiles (Users)
```javascript
const { createProfile, getProfileById, updateProfile } = require('./lib/db');
```

### Orders
```javascript
const { createOrder, getOrdersByUserId, getAllOrders } = require('./lib/db');
```

### Cart & Wishlist
```javascript
const { getOrCreateCart, updateCart } = require('./lib/db');
const { getOrCreateWishlist, updateWishlist } = require('./lib/db');
```

## Deployment

### Deploy with Vercel (Recommended)
1. Push code to GitHub
2. Connect Vercel to the repository
3. Set environment variables in Vercel dashboard
4. Deploy

### Deploy with Heroku
1. Create Heroku account
2. Install Heroku CLI
3. `heroku create your-app-name`
4. Set environment variables: `heroku config:set SUPABASE_URL=...`
5. `git push heroku main`

### Deploy with Railway
1. Connect GitHub repo to Railway
2. Add environment variables in project settings
3. Railway auto-deploys on push

## Key Advantages

✅ **Easier Deployment**: No MongoDB instance to manage
✅ **Built-in Auth**: Supabase auth with email verification
✅ **Better Security**: Row Level Security (RLS) policies
✅ **Free Tier**: Generous free tier for development
✅ **Real-time Features**: Supabase supports real-time subscriptions
✅ **Scalability**: Professional PostgreSQL database

## Backward Compatibility

The middleware still accepts JWT tokens from the old system, allowing gradual migration.

## What's Next

1. Update other routes to use `db` functions instead of Mongoose models
2. Test all endpoints with Supabase
3. Remove Mongoose dependency
4. Set up automated backups in Supabase dashboard
5. Configure Supabase logging and monitoring
