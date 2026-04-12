# ✅ PRE-DEPLOYMENT CHECKLIST

**Use this checklist before deploying to production.** All items must be ✅ checked.

---

## PHASE 1: ENVIRONMENT & CONFIGURATION

### Backend Configuration
- [ ] `backend/.env` file exists (not `.env.example`)
- [ ] `SUPABASE_URL` is filled (format: `https://xxx.supabase.co`)
- [ ] `SUPABASE_ANON_KEY` is filled (starts with `eyJ`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is filled (starts with `eyJ`)
- [ ] `JWT_SECRET` is strong random string (32+ characters)
- [ ] `PORT=5000` (or chosen port is documented)
- [ ] `NODE_ENV=production` (for production deployment)
- [ ] `FRONTEND_ORIGIN` matches frontend URL (e.g., `http://localhost:5173` or production URL)

### Frontend Configuration
- [ ] `frontend/.env.local` file exists (or `.env.production` for production)
- [ ] `VITE_API_URL` matches backend URL (includes `/api` suffix)
- [ ] `VITE_SUPABASE_URL` filled with Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` filled with anon key

### Supabase Project
- [ ] Supabase project created at https://supabase.com
- [ ] Project URL verified and accessible
- [ ] Service Role Key copied (not used in frontend code)
- [ ] Anon Key copied (safe to use in frontend code)
- [ ] Project region selected appropriate to target users

---

## PHASE 2: DATABASE & SCHEMA

### Database Schema Execution
- [ ] `SUPABASE_DATABASE_SCHEMA.sql` file exists
- [ ] Schema executed in Supabase > SQL Editor (all queries successful)
- [ ] Tables created in Supabase:
  - [ ] `profiles` table exists
  - [ ] `contacts` table exists
  - [ ] `orders` table exists
  - [ ] `carts` table exists
  - [ ] `wishlists` table exists
- [ ] All table columns present (verify in Table Editor)
- [ ] Row Level Security (RLS) policies reviewed

### Database Verification
- [ ] Can connect to Supabase from backend: `npm run dev` shows "Supabase configured"
- [ ] Health check works: `curl http://localhost:5000/api/health` returns "connected"
- [ ] Can query tables from backend without errors

---

## PHASE 3: DEPENDENCIES

### Backend Dependencies
- [ ] `backend/package.json` exists and is updated
- [ ] `npm install` completed successfully in `backend/`
- [ ] `node_modules/` directory exists in `backend/`
- [ ] All required packages installed:
  - [ ] `express`
  - [ ] `@supabase/supabase-js`
  - [ ] `cors`
  - [ ] `dotenv`
  - [ ] `jsonwebtoken`

### Frontend Dependencies
- [ ] `frontend/package.json` exists and is updated
- [ ] `npm install` completed successfully in `frontend/`
- [ ] `node_modules/` directory exists in `frontend/`
- [ ] All required packages installed:
  - [ ] `react`
  - [ ] `react-router-dom`
  - [ ] `vite`
  - [ ] TypeScript dependencies

---

## PHASE 4: CODE VERIFICATION

### Backend Routes
- [ ] `backend/routes/auth-supabase.js` - Customer signup/login routes
  - [ ] POST `/auth/customer/register` endpoint exists
  - [ ] POST `/auth/customer/login` endpoint exists
  - [ ] POST `/auth/customer/logout` endpoint exists

- [ ] `backend/routes/contact.js` - Quote & contact forms
  - [ ] POST `/contact/quote` endpoint exists
  - [ ] POST `/contact` endpoint exists
  - [ ] GET `/contact` endpoint exists (admin)
  - [ ] PUT `/contact/:id/status` endpoint exists (admin)

- [ ] `backend/routes/admin.js` - Admin dashboard
  - [ ] GET `/admin/stats` endpoint exists
  - [ ] GET `/admin/contacts` endpoint exists
  - [ ] GET `/admin/dashboard` endpoint exists
  - [ ] PUT `/admin/contact/:id` endpoint exists
  - [ ] GET `/admin/users` endpoint exists (paginated)
  - [ ] GET `/admin/orders` endpoint exists (paginated)

- [ ] `backend/routes/cart.js` - Cart operations
  - [ ] Cart endpoints present and using Supabase

- [ ] `backend/routes/orders.js` - Order management
  - [ ] Order endpoints present and using Supabase

- [ ] `backend/routes/wishlist.js` - Wishlist operations
  - [ ] Wishlist endpoints present and using Supabase

### Frontend Pages
- [ ] `frontend/src/pages/` directory
  - [ ] `Home.tsx` or index page exists
  - [ ] `Shop.tsx` or products page exists
  - [ ] `Quote.tsx` page exists
  - [ ] `Contact.tsx` page exists
  - [ ] `Login.tsx` page exists
  - [ ] `AdminDashboard.tsx` page exists
  - [ ] `AdminLogin.tsx` page exists

- [ ] `frontend/src/api/api.ts` - API client
  - [ ] Contains `auth.register` method pointing to `/auth/customer/register`
  - [ ] Contains `auth.login` method pointing to `/auth/customer/login`
  - [ ] Contains `auth.adminLogin` method pointing to `/auth/admin/login`
  - [ ] Contains `services.submitQuote` method pointing to `/contact/quote`
  - [ ] Contains `contact.submit` method pointing to `/contact`
  - [ ] Contains `admin.contacts()` method pointing to `/admin/contacts`
  - [ ] Contains `admin.updateContact()` method for status updates

### Middleware & Configuration
- [ ] `backend/middleware/auth.js` - Authentication middleware
  - [ ] Supports Supabase tokens
  - [ ] Supports JWT fallback
  - [ ] Validates admin role

- [ ] `backend/lib/db.js` - Database abstraction
  - [ ] All CRUD functions present
  - [ ] Handles Supabase queries correctly
  - [ ] Error handling in place

---

## PHASE 5: LOCAL TESTING

### Startup Tests
- [ ] Backend starts without errors: `npm run dev` (from `backend/` folder)
- [ ] Frontend starts without errors: `npm run dev` (from `frontend/` folder)
- [ ] No port conflicts (ports 5000 and 5173 available)
- [ ] No missing dependency errors

### Feature Tests
- [ ] **Customer Signup:**
  - [ ] Navigate to login/signup page
  - [ ] Create new account with valid email
  - [ ] Get confirmation (email may go to console in dev)
  - [ ] ✅ Account created in Supabase profiles table

- [ ] **Customer Login:**
  - [ ] Login with created account credentials
  - [ ] ✅ See dashboard/home page after login
  - [ ] ✅ JWT token stored in browser

- [ ] **Quote Submission:**
  - [ ] Navigate to Quote page
  - [ ] Fill all form fields
  - [ ] Click Submit
  - [ ] ✅ See "Quote request received" message
  - [ ] ✅ Data appears in Supabase contacts table

- [ ] **Contact Form:**
  - [ ] Navigate to Contact page
  - [ ] Fill form
  - [ ] Click Submit
  - [ ] ✅ Message appears in Supabase contacts table

- [ ] **Admin Dashboard:**
  - [ ] Create admin user in Supabase (Authentication > Users)
  - [ ] Set role to 'admin' in profiles table
  - [ ] Login with admin credentials
  - [ ] ✅ See dashboard with stats
  - [ ] ✅ See customer inquiries/quotes list
  - [ ] ✅ Can click to view inquiry details
  - [ ] ✅ Can update inquiry status

- [ ] **Cart Operations:**
  - [ ] Add products to cart
  - [ ] ✅ Cart data saved in Supabase carts table

- [ ] **Wishlist Operations:**
  - [ ] Add products to wishlist
  - [ ] ✅ Wishlist data saved in Supabase wishlists table

### Browser Console
- [ ] No red console errors (F12 to check)
- [ ] No CORS errors
- [ ] No authentication errors
- [ ] No API 404 errors

### Network Connectivity
- [ ] Backend health check: `curl http://localhost:5000/api/health`
  - [ ] Returns: `"database": "connected"`
- [ ] Frontend can reach backend API
- [ ] No network timeout errors

---

## PHASE 6: ADMIN USER SETUP

### Create First Admin
- [ ] Go to Supabase > Authentication > Users
- [ ] Click "Add user" button
- [ ] Email: (choose your admin email)
- [ ] Password: (strong password, save it!)
- [ ] Confirm user created
- [ ] Go to Table Editor > profiles table
- [ ] Find the new user row
- [ ] Change `role` column from 'customer' to 'admin'
- [ ] Click "Save"
- [ ] ✅ Admin user ready to login

### Admin Login Test
- [ ] Navigate to `/admin` or admin login page
- [ ] Enter admin credentials
- [ ] ✅ Successfully login to admin dashboard
- [ ] ✅ See all admin features working

---

## PHASE 7: VERIFICATION SCRIPTS

### Windows Verification
- [ ] Run: `.\verify-setup.bat` from project root
- [ ] All checks should pass (show checkmarks)
- [ ] No error messages

### Mac/Linux Verification
- [ ] Run: `bash verify-setup.sh` from project root
- [ ] All checks should pass
- [ ] No error messages

---

## PHASE 8: DOCUMENTATION

### Guides Exist
- [ ] `README.md` exists and is updated
- [ ] `QUICK_START_30MIN.md` exists
- [ ] `COMPLETE_DEPLOYMENT_GUIDE.md` exists
- [ ] `INTEGRATION_TESTING_GUIDE.md` exists
- [ ] `TROUBLESHOOTING.md` exists
- [ ] `SUPABASE_DEPLOYMENT_CHECKLIST.md` exists

### Guides Are Complete
- [ ] All guides have clear instructions
- [ ] Code examples are correct
- [ ] File paths are accurate
- [ ] No placeholder text remaining

---

## PHASE 9: DATA & SECURITY

### Database Security
- [ ] Row Level Security (RLS) policies configured
- [ ] Service Role Key is NOT used in frontend code
- [ ] Anon Key has appropriate restrictions
- [ ] No secrets committed to git

### Sensitive Data
- [ ] `.env` files are in `.gitignore` (not committed)
- [ ] `JWT_SECRET` is strong and unique
- [ ] Database passwords not stored in code
- [ ] API keys properly managed

---

## PHASE 10: PRODUCTION READINESS

### Environment Configuration
- [ ] `NODE_ENV=production` in production backend `.env`
- [ ] `VITE_ENV=production` or removed from frontend
- [ ] All environment variables set in deployment platform
- [ ] No hardcoded URLs (use environment variables)

### Error Handling
- [ ] Backend handles errors gracefully (no 500 errors crashing)
- [ ] Frontend handles API errors well
- [ ] Database errors are logged
- [ ] Network timeouts handled

### Performance
- [ ] Backend startup time < 5 seconds
- [ ] API response times < 2 seconds (typical)
- [ ] Frontend build completes successfully
- [ ] Frontend loads < 3 seconds (typical)

### Logging & Monitoring
- [ ] Backend logs are useful (not spam)
- [ ] Errors are distinguishable from info logs
- [ ] Database queries are logged (optional, for debugging)
- [ ] Ready for monitoring tool integration

---

## DEPLOYMENT PLATFORM SPECIFIC

### For Vercel (Frontend)
- [ ] Project connected to Vercel
- [ ] Environment variables added to Vercel
- [ ] Build command correct: `npm run build`
- [ ] Deployment preview tested
- [ ] Domain configured (if custom domain)
- [ ] HTTPS enabled

### For Railway/Render (Backend)
- [ ] Project connected to Railway/Render
- [ ] Build command correct: `npm install`
- [ ] Start command correct: `npm start` or `node server.js`
- [ ] All environment variables added
- [ ] Port configuration correct (usually auto-detected)
- [ ] Database RLS policies allow connection from server IP

### For Supabase (Database)
- [ ] Project in free tier or paid tier as needed
- [ ] All tables and data backed up
- [ ] RLS policies reviewed and appropriate
- [ ] Backups enabled (automatic weekly in free tier)
- [ ] IP whitelist configured if needed (usually not for Supabase)

---

## FINAL SIGN-OFF

### Before Deploying Production

- [ ] **All above items checked ✅**
- [ ] **Tested all features locally ✅**
- [ ] **Admin dashboard confirmed working ✅**
- [ ] **Quote form confirmed saving to Supabase ✅**
- [ ] **Customer signup/login working ✅**
- [ ] **No console errors in browser ✅**
- [ ] **No terminal errors in backend ✅**
- [ ] **Verification scripts pass ✅**
- [ ] **Ready for production deployment ✅**

---

## DEPLOYMENT STEPS

Once all checkboxes above are complete:

1. **Deploy Backend** to Railway/Render/Heroku
   - Push code
   - Set environment variables
   - Verify health check: `https://your-backend.com/api/health`

2. **Deploy Frontend** to Vercel/Netlify
   - Push code
   - Set environment variables
   - Verify deployment: `https://your-frontend.com`

3. **Run Integration Tests** on production URLs
   - Update test URLs to production URLs
   - Follow INTEGRATION_TESTING_GUIDE.md
   - Verify all features work in production

4. **Monitor** production
   - Check error logs daily for first week
   - Monitor database usage
   - Verify customer signups are working
   - Test quote submissions regularly

---

**Status:** ✅ Ready for Deployment  
**Estimated Production Launch:** Within 1-2 hours of deployment  
**Support:** See TROUBLESHOOTING.md if issues arise  

---

**Checklist Completed Date:** ____________  
**Deployed By:** ____________  
**Production URL:** ____________  

---

Last Updated: April 6, 2026
