# 🔧 TROUBLESHOOTING GUIDE

Quick fixes for common issues. If you don't find your problem here, check the detailed guides.

---

## STARTUP ISSUES

### ❌ Backend won't start / Port already in use

**Symptom:** 
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Fix:**
```bash
# Windows: Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux: Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

Or change port in `backend/.env`:
```
PORT=5001
```

---

### ❌ "Cannot find module" errors

**Symptom:**
```
Error: Cannot find module '@supabase/supabase-js'
```

**Fix:**
```bash
cd backend
npm install
```

or

```bash
cd frontend
npm install
```

---

### ❌ VITE_API_URL not recognized

**Symptom:**
- Backend says connected but frontend can't reach it
- Console shows "Cannot reach http://localhost:5000"

**Fix:**

1. Create `frontend/.env.local` file (if doesn't exist)
2. Add:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
3. **Stop frontend** (Ctrl+C)
4. **Restart frontend**: `npm run dev`
5. Hard refresh browser: **Ctrl+Shift+R**

---

## AUTHENTICATION ISSUES

### ❌ Health check shows "disconnected"

**Symptom:**
```
curl http://localhost:5000/api/health
→ { "status": "OK", "database": "disconnected" }
```

**Fix - Check 1: Environment variables**
```bash
# Open backend/.env and verify these are filled (not empty):
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...xxx
SUPABASE_SERVICE_ROLE_KEY=eyJ...xxx
```

**Fix - Check 2: Supabase URL format**
- Must be: `https://your-project-name.supabase.co`
- NOT: `https://your-project-name.supabase.co/` (no trailing slash)

**Fix - Check 3: Restart backend**
```bash
# Stop backend (Ctrl+C)
# Restart:
npm run dev
```

---

### ❌ Signup fails - "User already exists"

**Symptom:**
- Form shows: "User already exists"
- But you haven't created that user yet

**Fix:**
- This means someone already registered with that email
- Use a different email address
- Or delete the user from Supabase:
  1. Go to Supabase > Authentication > Users
  2. Find the user
  3. Click menu (•••) > Delete user
  4. Try signup again

---

### ❌ Login fails - "Invalid credentials"

**Symptom:**
- Email and password are correct but login fails

**Possible causes & fixes:**

**Fix 1: Password is wrong**
- Reset in Supabase > Authentication > Users
- Click user > Reset Password
- Confirm email and set new password

**Fix 2: Email doesn't exist**
- Create new account with signup form

**Fix 3: CORS blocking**
- Check browser console (F12) for CORS errors
- Ensure `FRONTEND_ORIGIN` in `backend/.env` is correct:
  ```
  FRONTEND_ORIGIN=http://localhost:5173
  ```

---

### ❌ Admin login not working

**Symptom:**
- Admin credentials correct but login fails

**Fix:**
1. **Verify admin user exists:**
   - Supabase > Authentication > Users
   - Look for admin email
   - If missing, create: Click "New user" button

2. **Verify admin role is set:**
   - Supabase > Table Editor > profiles table
   - Find the admin user row
   - Change `role` column from "customer" to "admin"
   - Click "Save"

3. **Try login again**

---

## FORM & DATA ISSUES

### ❌ Quote not appearing in admin dashboard

**Symptom:**
- Form shows "Quote request received" ✅
- But admin dashboard shows 0 inquiries

**Fix - Check 1: Data is in database**
1. Go to Supabase > Table Editor > contacts table
2. Look for your quote submission
3. If not there, database connection failed

**Fix - Check 2: Admin viewing correct data**
1. Login to admin as user with `role = 'admin'`
2. Check "role" in profiles table is exactly "admin" (lowercase, no spaces)

**Fix - Check 3: Hard refresh admin page**
```
Ctrl+Shift+R  (Windows)
Cmd+Shift+R   (Mac)
```

---

### ❌ Form doesn't submit - stuck loading

**Symptom:**
- Click submit
- Button shows loading spinner
- No success or error message

**Fix - Check 1: Backend running?**
- Open terminal where backend is running
- Look for any errors
- If no terminal or not running: `cd backend && npm run dev`

**Fix - Check 2: API URL correct?**
- Open browser console (F12)
- Go to Network tab
- Try form submission
- Look for failed network request
- Check URL is: `http://localhost:5000/api/contact/quote`

**Fix - Check 3: CORS error?**
- Browser console (F12) may show CORS error
- Check `backend/.env`:
  ```
  FRONTEND_ORIGIN=http://localhost:5173
  ```

---

### ❌ "500 Internal Server Error" on form submit

**Symptom:**
- Form shows: "500 Error: Internal Server Error"

**Fix:**
1. Look at **backend terminal** (where server is running)
2. Find the error message (will be red)
3. Common causes:
   - Database connection failed → Check `SUPABASE_SERVICE_ROLE_KEY` in .env
   - Required field missing → Check all form fields are filled
   - SQL syntax error → Check database schema was executed

---

## DATABASE ISSUES

### ❌ "Relation 'contacts' does not exist"

**Symptom:**
- Submit form
- Error: `relation "contacts" does not exist`

**Fix:**
1. Database schema not executed
2. Go to Supabase > SQL Editor
3. Open file: `SUPABASE_DATABASE_SCHEMA.sql`
4. Copy all content
5. Create new query
6. Paste content
7. Click "Run"
8. Wait for completion
9. Try form again

---

### ❌ Can't see tables in Supabase

**Symptom:**
- Supabase > Table Editor is empty

**Fix:**
1. Check you're in correct project
2. Execute database schema (see above)
3. Refresh page

---

## VERIFICATION SCRIPT ISSUES

### ❌ verify-setup.bat fails on Windows

**Symptom:**
```
'verify-setup.bat' is not recognized...
```

**Fix:**
```powershell
# Navigate to project folder first
cd C:\Users\YourName\OneDrive\Desktop\Veena\SKAY\ (Copy)

# Then run:
.\verify-setup.bat
```

---

### ❌ verify-setup.sh fails on Mac/Linux

**Symptom:**
```
Permission denied: ./verify-setup.sh
```

**Fix:**
```bash
chmod +x verify-setup.sh
./verify-setup.sh
```

---

## PERFORMANCE/DISPLAY ISSUES

### ❌ Quotes/contacts loading slowly

**Symptom:**
- Admin dashboard takes 5+ seconds to load

**Possible cause:** Large dataset
**Fix:** 
- Pagination is implemented
- Should load within 2-3 seconds with <1000 records
- If slower, check backend terminal for database query errors

---

### ❌ Quote form page is blank

**Symptom:**
- Navigate to Quote page
- Nothing displays

**Fix:**
1. Browser console (F12) for errors
2. Check frontend is running: http://localhost:5173 should work
3. Hard refresh: Ctrl+Shift+R
4. Check network tab for failed requests

---

## DEPLOYMENT ISSUES

### ❌ Works locally but breaks after deployment

**Symptom:**
- Local: Everything works ✅
- Deployed: Forms fail / login fails

**Likely cause:** Environment variables not set

**Fix for Vercel (Frontend):**
1. Go to Vercel > Project Settings > Environment Variables
2. Add:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...your_key
   ```
3. Redeploy

**Fix for Backend (Railway/Render):**
1. Go to platform environment settings
2. Add all variables from `backend/.env`:
   ```
   SUPABASE_URL=https://...
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   JWT_SECRET=xxx
   FRONTEND_ORIGIN=https://your-frontend-url.com
   ```
3. Redeploy

---

## LAST RESORT DEBUGGING

### Enable debug logging

**Backend:**
Add to `backend/.env`:
```
DEBUG=*
NODE_ENV=debug
```

**Frontend:**
Add to `frontend/.env.local`:
```
VITE_DEBUG=true
```

### Check all environment files are correct

```bash
# Backend
cat backend/.env

# Frontend
cat frontend/.env.local
```

Compare with `.env.example` files

### Test API endpoints directly

```bash
# Health check
curl http://localhost:5000/api/health

# Signup
curl -X POST http://localhost:5000/api/auth/customer/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Quote
curl -X POST http://localhost:5000/api/contact/quote \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","phone":"1234567890","productType":"T-Shirt","quantity":"100","description":"Test"}'
```

---

## WHEN STUCK

1. **Check the relevant guide:**
   - Authentication issue → See auth section above
   - Deployment → Read `COMPLETE_DEPLOYMENT_GUIDE.md`
   - Testing → Read `INTEGRATION_TESTING_GUIDE.md`

2. **Check error message carefully:**
   - Read console errors (F12 in browser)
   - Read terminal errors (where backend is running)
   - Google the exact error message

3. **Verify basics:**
   - Backend running? Check terminal
   - Frontend running? Check terminal
   - Correct URLs? Check .env files
   - Supabase connected? Run health check

4. **Restart everything:**
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Restart backend: `npm run dev`
   - Restart frontend: `npm run dev`
   - Hard refresh browser: Ctrl+Shift+R

---

## Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| EADDRINUSE | Port already in use | Kill process or change port |
| Module not found | Dependencies not installed | `npm install` |
| 500 error | Database error | Check connection & schema |
| CORS error | Frontend/Backend mismatch | Check FRONTEND_ORIGIN |
| "disconnected" | Can't reach Supabase | Check URL & keys |
| No data in admin | Schema not executed | Run SUPABASE_DATABASE_SCHEMA.sql |
| Role mismatch | Admin role not set | Set role='admin' in profiles |
| User exists | Email already registered | Use different email |

---

**Last Updated:** April 6, 2026  
**Questions?** Check the detailed guides included in the project!
