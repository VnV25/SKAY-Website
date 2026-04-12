# 🧪 INTEGRATION TESTING & VALIDATION GUIDE

## Purpose
This guide helps you verify that ALL backend and frontend features are working correctly with Supabase before deploying to production.

---

## TEST SUITE 1: BACKEND SERVICES (5 minutes)

### Test 1.1: Health Check ✅
```bash
curl -X GET http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "SKAY backend running",
  "database": "connected",
  "timestamp": "2026-04-06T10:30:00.000Z"
}
```

**Result:** ✅ PASS / ❌ FAIL

---

### Test 1.2: Customer Signup ✅
```bash
curl -X POST http://localhost:5000/api/auth/customer/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testcustomer@example.com",
    "password": "password123",
    "full_name": "Test Customer"
  }'
```

Expected response:
```json
{
  "user": {
    "id": "uuid-here",
    "email": "testcustomer@example.com",
    "full_name": "Test Customer"
  },
  "message": "Account created successfully. Please verify your email."
}
```

**Result:** ✅ PASS / ❌ FAIL

---

### Test 1.3: Customer Login ✅
```bash
curl -X POST http://localhost:5000/api/auth/customer/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testcustomer@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-here",
    "email": "testcustomer@example.com",
    "full_name": "Test Customer"
  },
  "message": "Login successful"
}
```

**Save the token** for next tests

**Result:** ✅ PASS / ❌ FAIL

---

### Test 1.4: Submit Quote (Contact Form) ✅
```bash
curl -X POST http://localhost:5000/api/contact/quote \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "productType": "T-Shirt",
    "quantity": "100",
    "description": "Custom design with logo"
  }'
```

Expected response:
```json
{
  "message": "Quote request received. We will respond within 24 hours.",
  "id": "uuid-here"
}
```

**Result:** ✅ PASS / ❌ FAIL

---

### Test 1.5: Submit Generic Contact ✅
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "9876543211",
    "message": "Need more information about your services"
  }'
```

Expected response:
```json
{
  "message": "Message received. We will reply within 24 hours.",
  "id": "uuid-here"
}
```

**Result:** ✅ PASS / ❌ FAIL

---

### Test 1.6: Admin Login ✅
First, you need to create an admin in Supabase. Then:

```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@skay.com",
    "password": "admin123456"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": "uuid-here",
    "email": "admin@skay.com",
    "role": "admin"
  },
  "message": "Admin login successful"
}
```

**Save the token** for admin tests

**Result:** ✅ PASS / ❌ FAIL

---

### Test 1.7: Get All Contacts (Admin) ✅
Replace `ADMIN_TOKEN` with token from Test 1.6:

```bash
curl -X GET http://localhost:5000/api/admin/contacts \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Expected response (should include quotes from Test 1.4 & 1.5):
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Product: T-Shirt\nQuantity: 100\nDescription: Custom design with logo",
    "status": "new",
    "created_at": "2026-04-06T10:35:00.000Z"
  },
  {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "message": "Need more information about your services",
    "status": "new",
    "created_at": "2026-04-06T10:36:00.000Z"
  }
]
```

**Result:** ✅ PASS / ❌ FAIL

---

### Test 1.8: Update Contact Status (Admin) ✅
Replace `CONTACT_ID` with an id from Test 1.7, and `ADMIN_TOKEN` from Test 1.6:

```bash
curl -X PUT http://localhost:5000/api/admin/contact/CONTACT_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "notes": "Quote sent to customer"
  }'
```

Expected response:
```json
{
  "id": "CONTACT_ID",
  "status": "in-progress",
  "notes": "Quote sent to customer",
  "updated_at": "2026-04-06T10:40:00.000Z"
}
```

**Result:** ✅ PASS / ❌ FAIL

---

### Test 1.9: Admin Stats ✅
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Expected response:
```json
{
  "totalUsers": 1,
  "customersWithLogins": 1,
  "totalProducts": 0,
  "totalOrders": 0,
  "pendingOrders": 0,
  "totalContacts": 2,
  "newContacts": 1,
  "totalRevenue": 0,
  "lastUpdated": "2026-04-06T10:45:00.000Z"
}
```

Should show:
- totalContacts: 2 (from Tests 1.4 & 1.5)
- newContacts: 1 (the one we didn't update)

**Result:** ✅ PASS / ❌ FAIL

---

## TEST SUITE 2: FRONTEND UI (10 minutes)

### Test 2.1: Frontend Loads ✅
1. Open http://localhost:5173
2. Should see homepage with header, products, services
3. Check browser console for errors

**Result:** ✅ PASS / ❌ FAIL

---

### Test 2.2: Customer Signup Flow ✅
1. Click **Login** (top right)
2. Click **Sign Up**  
3. Fill form:
   - Email: `frontend@example.com`
   - Password: `password123`
   - Full Name: `Frontend Tester`
4. Click **Sign Up**
5. Should see success message

**Result:** ✅ PASS / ❌ FAIL

---

### Test 2.3: Customer Login Flow ✅
1. Click **Login**
2. Fill form:
   - Email: `frontend@example.com`
   - Password: `password123`
3. Click **Login**
4. Should be logged in (name appears in header)

**Result:** ✅ PASS / ❌ FAIL

---

### Test 2.4: Quote Form Submission ✅
1. Go to **Quote** page (from header)
2. Fill form:
   - Name: `Form Tester`
   - Email: `form@example.com`
   - Phone: `9999999999`
   - Product Type: `Hoodie`
   - Quantity: `50`
   - Description: `Test submission from frontend`
3. Click **Submit Quote**
4. Should see: "Quote request received"

**Result:** ✅ PASS / ❌ FAIL

---

### Test 2.5: Contact Form Submission ✅
1. Go to **Contact** page (from header)
2. Scroll to contact form
3. Fill form:
   - Name: `Contact Tester`
   - Email: `contact@example.com`
   - Phone: `8888888888`
   - Message: `This is a test message from the contact form`
4. Click **Submit**
5. Should see: "Message received"

**Result:** ✅ PASS / ❌ FAIL

---

### Test 2.6: Admin Dashboard Access ✅
1. Go to http://localhost:5173/admin
2. Should see admin login form
3. Enter credentials created in Supabase
4. Click **Login**
5. Should see admin dashboard with stats

**Result:** ✅ PASS / ❌ FAIL

---

### Test 2.7: Admin Sees Customer Inquiries ✅
1. In admin dashboard, look for **Inquiries** or **Customer Messages** tab
2. Click on it
3. Should see entries from Tests 2.4 & 2.5:
   - "Form Tester" - Quote for Hoodie
   - "Contact Tester" - Contact message
4. Should show status as "new"

**Result:** ✅ PASS / ❌ FAIL

---

### Test 2.8: Admin Updates Inquiry Status ✅
1. In admin inquiries list
2. Click on one of the inquiries
3. Change status from "new" to "in-progress" or "completed"
4. Click **Save** or **Update**
5. Should see status change in list

**Result:** ✅ PASS / ❌ FAIL

---

## TEST SUITE 3: DATABASE VERIFICATION (5 minutes)

### Test 3.1: Verify Profiles Table in Supabase ✅
1. Go to Supabase Dashboard > Table Editor > **profiles**
2. Should see entries:
   - testcustomer@example.com (from Test 1.2)
   - frontend@example.com (from Test 2.2)
3. Verify `login_count` is > 0 for logged-in users
4. Verify `role` is "customer" for all

**Result:** ✅ PASS / ❌ FAIL

---

### Test 3.2: Verify Contacts Table in Supabase ✅
1. Go to Supabase Dashboard > Table Editor > **contacts**
2. Should see entries:
   - John Doe (quote for T-Shirt)
   - Jane Smith (generic contact)
   - Form Tester (quote for Hoodie)
   - Contact Tester (contact message)
3. Verify statuses match (one should be "in-progress" if you updated it)

**Result:** ✅ PASS / ❌ FAIL

---

### Test 3.3: Verify Orders Table (Empty) ✅
1. Go to Supabase Dashboard > Table Editor > **orders**
2. Should be empty (no orders placed yet)
3. This is expected at this stage

**Result:** ✅ PASS / ❌ FAIL

---

### Test 3.4: Verify Carts & Wishlists Tables ✅
1. Check **carts** and **wishlists** tables
2. Should be empty or only have entries if customer added items

**Result:** ✅ PASS / ❌ FAIL

---

## FINAL CHECKLIST ✅

Before deploying, verify:

- [ ] All Test Suite 1 tests PASS (backend services)
- [ ] All Test Suite 2 tests PASS (frontend UI)
- [ ] All Test Suite 3 tests PASS (database)
- [ ] No red errors in browser console (F12)
- [ ] No red errors in backend terminal
- [ ] Admin can see all customer inquiries
- [ ] Admin can update inquiry status
- [ ] Customer signup/login works
- [ ] Quote and contact forms store data properly
- [ ] Data appears immediately in admin panel
- [ ] All environment variables are set correctly
- [ ] Supabase backup is enabled
- [ ] SSL/HTTPS will be enabled on deployment platform

---

## TROUBLESHOOTING TEST FAILURES

### Backend Tests Fail

**Problem:** `Cannot reach http://localhost:5000`
```
Solution:
1. Check if backend is running: cd backend && npm run dev
2. Check for errors in backend terminal
3. Verify SUPABASE_URL and keys are correct in backend/.env
```

**Problem:** `database: "disconnected"` in health check
```
Solution:
1. Verify SUPABASE_URL is correct
2. Verify SUPABASE_SERVICE_ROLE_KEY is correct
3. Check Supabase project is not paused
4. Run SQL schema again if tables missing
```

**Problem:** `Email already registered` error
```
Solution:
1. Use a different email for next test
2. Or: Delete user from Supabase > Authentication > Users
```

---

### Frontend Tests Fail

**Problem:** Form submission doesn't work
```
Solution:
1. Open browser F12 > Console for errors
2. Check VITE_API_URL in frontend/.env.local
3. Verify backend is running and healthy
4. Check CORS is enabled in backend (should be by default)
```

**Problem:** Admin login fails
```
Solution:
1. Verify admin user exists in Supabase
2. Verify admin role is set correctly in profiles table
3. Try admin test in backend tests first
4. Check browser console for specific error
```

**Problem:** Quote/Contact not appearing in admin panel
```
Solution:
1. Check form was submitted successfully (should see success message)
2. Verify data in Supabase contacts table directly
3. Hard refresh admin dashboard (Ctrl+Shift+R)
4. Check browser console in admin panel for fetch errors
```

---

### Database Tests Fail

**Problem:** Tables missing from Supabase
```
Solution:
1. Open Supabase > SQL Editor > New Query
2. Paste SUPABASE_DATABASE_SCHEMA.sql
3. Click Run
4. Refresh Table Editor to see new tables
```

**Problem:** No data appearing in tables
```
Solution:
1. Run Test Suite 1 & 2 again to create data
2. Verify tables show in Table Editor
3. Check row count (right side of table name)
4. Hard refresh (Ctrl+Shift+R) Supabase dashboard
```

---

## SUCCESS CHECKLIST ✅

If all tests pass:

✅ Backend is properly connected to Supabase
✅ Frontend can communicate with backend
✅ Customer authentication works
✅ Admin authentication works
✅ Quote form works end-to-end
✅ Contact form works end-to-end
✅ Admin panel displays customer data
✅ Database storage is working properly
✅ System is ready for production deployment

---

## NEXT STEPS

1. ✅ Fix any failing tests
2. ✅ Re-run all tests until all pass
3. ✅ Deploy using COMPLETE_DEPLOYMENT_GUIDE.md
4. ✅ Run same tests on production URL
5. ✅ Monitor error logs in production

---

**Test Date:** ___________  
**All Tests Pass:** YES / NO  
**Ready for Deployment:** YES / NO  
**Notes:** _____________________________________________
