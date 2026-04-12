# 🚀 COMPLETE DEPLOYMENT-READY SETUP GUIDE

## ✅ Status: Full Backend + Frontend Integration Ready

This guide walks you through complete setup for production deployment with:
- ✅ Supabase backend (PostgreSQL)
- ✅ Supabase authentication
- ✅ Customer signup/login  
- ✅ Admin panel with login
- ✅ Quote/Contact form with data storage
- ✅ Admin dashboard with customer inquiries
- ✅ Production-ready deployment

---

## PHASE 1: SUPABASE SETUP (10 minutes)

### Step 1a: Create Supabase Project
1. Go to https://supabase.com and create account (free)
2. Click "New Project"
3. Choose database password (save it!)
4. Select region closest to you
5. Wait 2-3 minutes for provisioning

### Step 1b: Get API Credentials
1. In Supabase dashboard, go to **Settings > API**
2. Save these values to a notepad:
   - **Project URL** (starts with `https://...supabase.co`) → `SUPABASE_URL`
   - **Service Role Secret** (click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`  
   - **Anon Public** → `SUPABASE_ANON_KEY`

Example:
```
SUPABASE_URL=https://pqdfqgzungrximqwwnkc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...very_long_key...
SUPABASE_ANON_KEY=eyJhbGc...another_long_key...
```

### Step 1c: Create Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open the file: `SUPABASE_DATABASE_SCHEMA.sql` in your project root
4. Copy **ALL** the SQL code (from line 1 to the end)
5. Paste into Supabase SQL Editor
6. Click **"Run"** (green button)
7. Watch as tables get created (profiles, orders, carts, wishlists, contacts)
8. Go to **Table Editor** and verify you see the 5 new tables

---

## PHASE 2: BACKEND SETUP (5 minutes)

### Step 2a: Configure Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and update with your Supabase credentials:
```
SUPABASE_URL=https://pqdfqgzungrximqwwnkc.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your_anon_key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_service_role_key...
JWT_SECRET=your-super-secret-key-12345-change-this
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
```

### Step 2b: Install & Test Backend
```bash
cd backend
npm install
npm run dev
```

Test health check:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "SKAY backend running",
  "database": "connected"
}
```

If you see "connected" ✅, backend is working!

---

## PHASE 3: FRONTEND SETUP (5 minutes)

### Step 3a: Configure Frontend Environment
```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://pqdfqgzungrximqwwnkc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key...
```

### Step 3b: Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend will start at: http://localhost:5173

---

## PHASE 4: TEST ALL FEATURES

### Test 1: Customer Signup ✅
1. Go to frontend: http://localhost:5173
2. Look for **"Login"** link (top right)
3. Click **"Sign Up"**
4. Create account:
   - Email: `test@example.com`
   - Password: `password123`
   - Full Name: `Test User`
5. Click **"Sign Up"**
6. You should get: "Account created successfully"

### Test 2: Customer Login ✅
1. Go to Login page
2. Enter:
   - Email: `test@example.com`
   - Password: `password123`
3. Click **"Login"**
4. You should be logged in

### Test 3: Quote Form Submission ✅
1. Go to **Quote** page (or **Contact**)
2. Fill form:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `9876543210`
   - Product Type: `T-Shirt`
   - Quantity: `100`
   - Description: `Custom design needed`
3. Click **"Submit Quote"**
4. You should see: "Quote request received"

### Test 4: Admin Login ✅
1. Create admin first (terminal):
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@skay.com",
    "password": "admin123456"
  }'
```

(Note: You'll need to manually create admin in Supabase first)

2. Then go to **Admin Dashboard**: http://localhost:5173/admin
3. Enter admin credentials and login
4. You should see dashboard with stats

### Test 5: Admin Inquiries ✅
1. After logging in as admin
2. Go to **"Inquiries"** or **"Customer Messages"** section
3. You should see the quote you submitted earlier:
   - Name: John Doe
   - Email: john@example.com
   - Status: "new"

To mark as responded:
1. Click on the inquiry
2. Change status to "in-progress" or "completed"
3. Click save

---

## PHASE 5: CREATE ADMIN USER (IMPORTANT!)

You need to manually create the first admin. Use Supabase dashboard:

### Method 1: Via Supabase Auth UI
1. In Supabase, go to **Authentication > Users**
2. Click **"Add user"**
3. Email: `admin@skay.com`
4. Password: `admin123456generate` (strong password)
5. Click **"Create user"**

Then in Supabase database:

### Method 2: Make User an Admin
1. Go to **Table Editor**
2. Click **"profiles"** table
3. Find the admin user row
4. Change **"role"** column from `'customer'` to `'admin'`
5. Save

---

## PHASE 6: DATABASE VERIFICATION

### Check Contacts Table
1. In Supabase, go to **Table Editor > contacts**
2. You should see your test quote submission:
   ```
   | id     | name       | email          | message    | status | created_at    |
   | ---    | ---        | ---            | ---        | ---    | ---           |
   | uuid   | John Doe   | john@ex...     | Product... | new    | 2026-04-06... |
   ```

### Check Profiles Table
1. Go to **profiles** table
2. You should see your test customer:
   ```
   | id     | email             | full_name    | role     | login_count | created_at |
   | ---    | ---               | ---          | ---      | ---         | ---        |
   | uuid   | test@example.com  | Test User    | customer | 1           | 2026-04....|
   ```

### Check Orders Table (empty initially, populated on checkout)
1. Go to **orders** table
2. Should be empty until customer places order

---

## PHASE 7: DEPLOYMENT 🚀

### Deploy to Vercel (Recommended - 5 minutes)

#### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. Click **"New Project"**
3. Select your GitHub repository
4. Click **"Import"**

#### Step 3: Set Environment Variables
In Vercel dashboard, go to **Settings > Environment Variables** and add:

For **Backend** (if deploying backend on Vercel):
```
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...
JWT_SECRET=generate-strong-secret
NODE_ENV=production
FRONTEND_ORIGIN=https://your-frontend.vercel.app
PORT=3000
```

For **Frontend**:
```
VITE_API_URL=https://your-backend.vercel.app/api
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

#### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your site goes live! 🎉

### Deploy Backend Separately (Optional)

You can deploy **backend** and **frontend** separately:

**Backend on Railway:**
```bash
# Login
railway link

# Deploy
railway up

# Set environment variables in Railway dashboard
```

**Frontend on Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## PHASE 8: PRODUCTION CHECKLIST ✅

Before going live, verify:

- [ ] Admin user created in Supabase
- [ ] All environment variables set (no placeholders)
- [ ] Backend health check: `/api/health` returns "connected"
- [ ] Customer signup works
- [ ] Customer login works
- [ ] Quote form submits successfully
- [ ] Admin can see inquiries
- [ ] Admin can update inquiry status
- [ ] CORS is configured correctly
- [ ] JWT_SECRET is strong (50+ characters)
- [ ] SSL/HTTPS enabled (auto on Vercel/Railway)
- [ ] Database backups enabled in Supabase
- [ ] Error monitoring set up (optional: Sentry)

---

## TROUBLESHOOTING

### Error: "Cannot connect to Supabase"
```
❌ Solution: Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
```

### Error: "RLS policy violation"
```
❌ Solution: Make sure you're using SERVICE_ROLE_KEY for admin operations
✅ Check: Supabase > Authentication > Row Level Security policies
```

### Error: "Quote not appearing in admin dashboard"
```
❌ Solution: Make sure quote submitted successfully (check browser console)
✅ Step 1: Check if contact endpoint is working:
         curl -X POST http://localhost:5000/api/contact/quote \
           -H "Content-Type: application/json" \
           -d '{"name":"Test","email":"test@ex.com","productType":"shirt","quantity":"50"}'
✅ Step 2: Check Supabase contacts table directly
```

### Error: "Admin login not working"
```
❌ Solution: Admin user must exist in Supabase
✅ Step 1: Create admin in Supabase > Authentication > Users
✅ Step 2: Change role to 'admin' in profiles table
✅ Step 3: Try login again
```

---

## API ENDPOINTS REFERENCE

### Authentication
```
POST   /api/auth/customer/register     - Customer signup
POST   /api/auth/customer/login        - Customer login
POST   /api/auth/customer/logout       - Customer logout
POST   /api/auth/admin/login           - Admin login
GET    /api/auth/me                    - Get current user
PUT    /api/auth/profile               - Update profile
```

### Contacts & Quotes
```
POST   /api/contact                    - Submit contact message
POST   /api/contact/quote              - Submit quote request
GET    /api/contact                    - Get all contacts (admin only)
PUT    /api/contact/:id/status         - Update contact status (admin only)
```

### Admin
```
GET    /api/admin/stats                - Dashboard stats
GET    /api/admin/users                - List users
GET    /api/admin/orders               - List orders
GET    /api/admin/contacts             - List contacts/inquiries
PUT    /api/admin/contact/:id          - Update inquiry
GET    /api/admin/dashboard            - Dashboard data
```

### Cart & Wishlist
```
GET    /api/cart                       - Get user's cart
POST   /api/cart/add                   - Add to cart
POST   /api/wishlist/add               - Add to wishlist
GET    /api/wishlist                   - Get wishlist
```

---

## NEXT STEPS

1. ✅ Complete Phase 1-7 above
2. ✅ Test all features locally
3. ✅ Deploy to production
4. ✅ Monitor for errors
5. ✅ Set up email notifications (optional)
6. ✅ Configure backup schedule in Supabase

---

## SUCCESS! 🎉

Your SKAY system is now:
- ✅ Fully integrated with Supabase
- ✅ Ready for production
- ✅ Scalable and secure
- ✅ Easy to maintain

**Need help?** Check the docs folders or contact support.

---

**Last Updated:** April 6, 2026  
**Status:** Production Ready ✅
