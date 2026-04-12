# ⚡ QUICK START: 30-MINUTE SETUP

**Your SKAY system is fully ready for deployment!** Follow this 30-minute guide to get everything running.

---

## STEP 1: Verify Files (2 minutes)

**Windows:** Run this in PowerShell in your project root:
```powershell
.\verify-setup.bat
```

**Mac/Linux:** Run this in terminal:
```bash
bash verify-setup.sh
```

✅ If you see "ALL CHECKS PASSED" → Continue

❌ If you see failures → Fix them first (see troubleshooting section)

---

## STEP 2: Create Supabase Project (5 minutes)

1. Go to https://supabase.com
2. Create account (free)
3. Click **"New Project"**
4. Fill form:
   - Organization: (create new or select)
   - Project name: `skay`
   - Database password: (save this!)
   - Region: Select closest to you
5. Click **"Create new project"**
6. Wait 2-3 minutes...

**After creating, save these 3 values:**
- In Supabase, go to **Settings > API**
- Copy: `Project URL` → Save as `SUPABASE_URL`
- Copy: `Service Role Secret` → Save as `SUPABASE_SERVICE_ROLE_KEY`
- Copy: `Anon Public` → Save as `SUPABASE_ANON_KEY`

---

## STEP 3: Create Database Schema (3 minutes)

1. In Supabase, go to **SQL Editor**
2. Click **"New Query"**
3. Open file: `SUPABASE_DATABASE_SCHEMA.sql` (in your project folder)
4. Copy ALL the content
5. Paste into Supabase SQL Editor
6. Click **"Run"** (green button)
7. Wait for completion...

✅ Should see: ✅ All queries executed successfully

---

## STEP 4: Update Backend Configuration (2 minutes)

**Windows:** Edit `backend\.env`
**Mac/Linux:** Edit `backend/.env`

Add/update these values with what you saved from Supabase:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your_key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_key...
JWT_SECRET=generate-a-random-strong-password-here
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
```

**To generate JWT_SECRET, open PowerShell/Terminal and run:**
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste as JWT_SECRET.

---

## STEP 5: Start Backend (2 minutes)

**Windows:**
```powershell
cd backend
npm install  (only needed first time)
npm run dev
```

**Mac/Linux:**
```bash
cd backend
npm install  # only needed first time
npm run dev
```

Expected output:
```
✅ Supabase configured
🚀 SKAY backend running on http://localhost:5000
```

**Test health check in new terminal:**
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "OK",
  "database": "connected"
}
```

✅ If you see "connected" → Backend is working!

---

## STEP 6: Update Frontend Configuration (2 minutes)

**Windows:** Edit `frontend\.env.local`
**Mac/Linux:** Edit `frontend/.env.local`

If file doesn't exist, create it with:

```
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your_key...
```

---

## STEP 7: Start Frontend (2 minutes)

Open **new terminal** window and run:

**Windows:**
```powershell
cd frontend
npm install  (only needed first time)
npm run dev
```

**Mac/Linux:**
```bash
cd frontend
npm install  # only needed first time
npm run dev
```

Expected output:
```
VITE v5.0.0 running at: http://localhost:5173/
```

---

## STEP 8: Test Everything (5 minutes)

Open browser: http://localhost:5173

### Test 1: Customer Signup ✅
1. Click **Login** (top right)
2. Click **Sign Up**
3. Enter:
   - Email: `test@example.com`
   - Password: `password123`
   - Full Name: `Test User`
4. Click **Sign Up**
5. ✅ See "Account created successfully"

### Test 2: Quote Form ✅
1. Go to **Quote** page
2. Fill form:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `9876543210`
   - Product Type: `T-Shirt`
   - Quantity: `100`
3. Click **Submit Quote**
4. ✅ See "Quote request received"

### Test 3: Admin Dashboard ✅
1. Go to http://localhost:5173/admin
2. First, create admin user in Supabase:
   - Supabase > Authentication > Users > Add user
   - Email: `admin@skay.com`
   - Password: (strong, e.g. `admin123!@#`)
3. Also set role to 'admin' in profiles table:
   - Table Editor > profiles
   - Find the admin user
   - Change role from 'customer' to 'admin'
4. Login to admin panel with `admin@skay.com` and password
5. ✅ Should see dashboard stats

### Test 4: Admin Sees Inquiries ✅
1. In admin dashboard, look for **"Inquiries"** or **"Customer Messages"**
2. ✅ Should see the quote you submitted with status "new"

---

## STEP 9: Ready for Deployment! 🚀

All systems verified? Then you're ready!

### Option A: Quick Local Test
Stop at this point and test everything thoroughly using:
📖 **INTEGRATION_TESTING_GUIDE.md**

### Option B: Deploy to Production
Follow the deployment guide:
📖 **COMPLETE_DEPLOYMENT_GUIDE.md**

Recommended platforms:
- **Frontend:** Vercel or Netlify (free tier sufficient)
- **Backend:** Vercel, Railway, or Render (free tier sufficient)
- **Database:** Supabase (free tier sufficient for MVP)

---

## SYSTEM COMPONENTS

Your system now includes:

```
Frontend (http://localhost:5173)
├── Customer Pages
│   ├── Home (products, services)
│   ├── Shop (products catalog)
│   ├── Quote Form (request quote)
│   ├── Contact Form (general inquiry)
│   ├── Login/Signup
│   └── Cart & Wishlist
├── Admin Pages
│   ├── Dashboard (stats overview)
│   ├── Customer Inquiries
│   ├── Orders
│   └── Analytics

Backend (http://localhost:5000/api)
├── Authentication
│   ├── Customer signup/login
│   ├── Admin login
│   └── Profile management
├── Forms
│   ├── Quote submission
│   └── Contact submission
├── Admin
│   ├── View all inquiries
│   ├── Update status
│   └── View statistics
└── Data Management
    ├── Cart operations
    ├── Wishlist operations
    └── Order management

Database (Supabase PostgreSQL)
├── Profiles (users)
├── Contacts (inquiries & quotes)
├── Orders (transactions)
├── Carts (shopping data)
└── Wishlists (saved products)
```

---

## COMMON ISSUES & FIXES

### Backend won't start
```
Error: Cannot find module '@supabase/supabase-js'
Fix: cd backend && npm install
```

### Health check fails
```
Error: database: "disconnected"
Fix: Check SUPABASE_URL and keys in backend/.env are correct
```

### Frontend can't connect to backend
```
Error: Network error: Cannot reach http://localhost:5000
Fix: Make sure backend is running (check terminal)
```

### Quote not in admin dashboard
```
Fix: 
1. Check form says "Quote request received"
2. Go to Supabase > contacts table and verify data exists
3. Hard refresh admin dashboard (Ctrl+Shift+R)
```

### Admin login not working
```
Fix:
1. Create admin in Supabase > Authentication > Users
2. Set role to 'admin' in profiles table
3. Try login again
```

---

## VERIFY CHECKLIST ✅

Before declaring victory, verify:

- [ ] Health check returns "connected"
- [ ] Customer signup works
- [ ] Customer login works  
- [ ] Quote form submits successfully
- [ ] Quote appears in admin inquiries
- [ ] Admin can change inquiry status
- [ ] Contact form works
- [ ] All data saved in Supabase
- [ ] No red errors in browser console (F12)
- [ ] No red errors in backend terminal

---

## NEXT Actions

### If Testing Locally:
1. Run **INTEGRATION_TESTING_GUIDE.md** for comprehensive tests
2. Test edge cases and error scenarios
3. Ensure all inquiries are properly stored

### If Deploying to Production:
1. Read **COMPLETE_DEPLOYMENT_GUIDE.md**
2. Choose deployment platform (Vercel recommended)
3. Deploy both frontend and backend
4. Test production URLs
5. Monitor for errors

---

## SUPPORT RESOURCES

📖 Guides included in project:
- **COMPLETE_DEPLOYMENT_GUIDE.md** - Production deployment
- **INTEGRATION_TESTING_GUIDE.md** - Comprehensive testing
- **BACKEND_MIGRATION_SUMMARY.md** - Architecture overview
- **ROUTE_MIGRATION_GUIDE.md** - API reference
- **SUPABASE_DEPLOYMENT_CHECKLIST.md** - Pre-launch checklist

---

## STATUS: ✅ PRODUCTION READY

Your SKAY system is fully configured and ready for:
- ✅ Customer registration & authentication
- ✅ Quote request management
- ✅ Admin dashboard & inquiries
- ✅ Production deployment
- ✅ Scalable Supabase backend

**Estimated time to production: 1-2 hours** (including testing & deployment)

---

**Last Updated:** April 6, 2026  
**Status:** Complete & Ready for Deployment ✅
