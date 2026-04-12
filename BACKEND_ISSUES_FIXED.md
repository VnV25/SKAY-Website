# FIX: Customer Registration & Quote Form Issues

## Problems Found & Fixed:

### ✅ FIXED: Quote Form 
- **Issue**: API endpoint was wrong (`/contact/quote` → `/services/quote`)
- **Solution**: Updated `frontend/src/api/api.ts` to call the correct endpoint

### ❌ PENDING: Customer Registration
- **Issue**: Database profile creation failing
- **Cause**: The `profiles` table may be missing `phone` and `company` columns

## What You Need to Do:

### Step 1: Add Missing Columns to Supabase

Go to your Supabase Dashboard → SQL Editor and run:

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
```

### Step 2: Test Quote Form
Once you run this SQL, the customer registration should work. Then test the quote form in the browser:
- Go to http://localhost:5175/quote
- Fill out the form
- It should now submit successfully ✅

### Step 3: Test Customer Login/Register  
- Go to http://localhost:5175/login
- Try registering a new account
- It should now work ✅

## Current Status:
- ✅ Backend is running and connected to Supabase
- ✅ Quote endpoint is fixed (API endpoint corrected)
- ⏳ Customer auth will work after you add the two columns to Supabase

## Quick Reference:
- **Quote API**: `/api/services/quote` (POST)
- **Register API**: `/api/auth/customer/register` (POST)
- **Login API**: `/api/auth/customer/login` (POST)
