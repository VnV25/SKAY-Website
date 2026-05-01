# Supabase Backend Issues - Complete Fix Guide

## Issues Fixed

### 1. ❌ "permission denied for table feedback"
**Root Cause:** RLS (Row Level Security) policies not configured for the feedback table.

**Solution:** Run this SQL in Supabase SQL Editor:
```sql
-- Enable RLS on feedback table
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow public INSERT
DROP POLICY IF EXISTS "Allow public INSERT to feedback" ON feedback;
CREATE POLICY "Allow public INSERT to feedback" ON feedback
  FOR INSERT
  WITH CHECK (true);

-- Allow admins to READ
DROP POLICY IF EXISTS "Allow admins to read feedback" ON feedback;
CREATE POLICY "Allow admins to read feedback" ON feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

**File to use:** `SUPABASE_FEEDBACK_RLS_POLICY.sql` (already created)

---

### 2. ❌ "ENOTFOUND supabase.co"
**Root Cause:** Invalid Supabase URL or environment variables not loaded correctly.

**Solution:** 
- ✓ Your `.env` has correct URL: `https://pqdfqgzungrximqwwnkc.supabase.co`
- ✓ Fixed `lib/supabase.js` to validate URL format
- ✓ Removed fallback to 'invalid.localhost'
- ✓ Added proper error logging

**What was changed:**
1. **Before:** Used fallback client with 'https://invalid.localhost' → caused ENOTFOUND error
2. **After:** Returns null if URL is invalid, with clear error messages

---

### 3. ✓ Supabase Client Initialization
**Fixed in:** `backend/lib/supabase.js`

**Improvements:**
```javascript
// BEFORE - Creates fallback client even when URL is invalid
const supabase = createFallbackClient(supabaseServiceKey);

// AFTER - Validates URL and only creates client if valid
if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {...});
    console.log('[Supabase] ✓ Clients initialized successfully');
  } catch (err) {
    console.error('[Supabase] ✗ Failed to initialize clients:', err.message);
    supabase = null;
  }
}
```

---

## Files Updated

### 1. `backend/lib/supabase.js` (Core Fix)
- ✓ Added URL format validation
- ✓ Better error handling and logging
- ✓ Removed invalid.localhost fallback
- ✓ Null checks before creating clients
- ✓ Clear startup diagnostics

### 2. `backend/routes/feedbackRoutes.js` (Error Handling)
- ✓ Added `supabase` null check
- ✓ Specific handling for RLS permission errors (code PGRST301)
- ✓ Detailed error logging with error codes
- ✓ Better client initialization validation

### 3. `backend/routes/productRoutes.js` (Error Handling)
- ✓ Added Supabase configuration checks
- ✓ Removed `.single()` call (can fail on multiple results)
- ✓ Better error context in logs
- ✓ Proper 404 handling for missing products

### 4. `backend/verify-supabase-config.js` (New - Testing Tool)
- ✓ Validates environment variables
- ✓ Tests connection with both keys
- ✓ Tests feedback table insert
- ✓ Auto-cleanup of test records

### 5. `SUPABASE_FEEDBACK_RLS_POLICY.sql` (New - RLS Setup)
- ✓ Complete RLS policy configuration
- ✓ Includes table creation (if needed)
- ✓ Verification queries
- ✓ Troubleshooting guide

---

## How to Fix

### Step 1: Update Backend Code ✓ (Already Done)
The following files have been fixed:
- `backend/lib/supabase.js`
- `backend/routes/feedbackRoutes.js`
- `backend/routes/productRoutes.js`

### Step 2: Verify Environment Variables
```bash
# Check your .env file in backend/
cat backend/.env

# Should contain:
SUPABASE_URL=https://pqdfqgzungrximqwwnkc.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Expected format:**
```
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Run Verification Script
```bash
cd backend
node verify-supabase-config.js
```

**Expected output:**
```
✓ SUPABASE_URL: Set (https://pqdfqgzungrximqwwnkc.supabase.co)
✓ SUPABASE_ANON_KEY: Set (eyJhbGc...)
✓ SUPABASE_SERVICE_ROLE_KEY: Set (eyJhbGc...)
✓ Valid Supabase URL: pqdfqgzungrximqwwnkc.supabase.co
✓ Service role key connection successful
✓ Insert successful (ID: ...)
```

### Step 4: Fix RLS Policies in Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **pqdfqgzungrximqwwnkc**
3. Go to **SQL Editor**
4. Create new query
5. Copy & paste contents of `SUPABASE_FEEDBACK_RLS_POLICY.sql`
6. Click **Run**

**Or:** Use the Supabase CLI
```bash
supabase db push SUPABASE_FEEDBACK_RLS_POLICY.sql
```

### Step 5: Start Backend
```bash
cd backend
npm install  # if needed
npm start
```

**Expected startup logs:**
```
[Supabase] Initialization:
  URL: ✓ Set
  Service Key: ✓ Set
  Anon Key: ✓ Set
  Valid URL format: ✓ Yes
  Overall Status: ✓ READY
[Supabase] ✓ Clients initialized successfully
```

---

## Testing Feedback Submission

### From Frontend
```typescript
const response = await api.feedback.submit({
  name: 'Test User',
  email: 'test@example.com',
  rating: 5,
  message: 'Great service!'
});

// Expected: { success: true, message: '...', data: {...} }
```

### From cURL
```bash
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "rating": 5,
    "message": "Great service!"
  }'

# Expected: { "success": true, "message": "Feedback submitted successfully", "data": {...} }
```

### From Backend Test
```bash
cd backend
node verify-supabase-config.js
```

---

## Error Handling Guide

| Error | Cause | Fix |
|-------|-------|-----|
| `ENOTFOUND supabase.co` | Invalid URL or network issue | Check `SUPABASE_URL` format in .env |
| `permission denied for table feedback` | RLS policy missing | Run `SUPABASE_FEEDBACK_RLS_POLICY.sql` |
| `PGRST301` | RLS blocking operation | Add INSERT policy for public access |
| `Supabase client initialization failed` | Keys are invalid or URL is malformed | Run `verify-supabase-config.js` |
| `No data returned from insert` | Insert succeeded but no response | Check Supabase table columns match payload |

---

## Verification Checklist

- [ ] `.env` file has correct `SUPABASE_URL`
- [ ] `.env` file has valid `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `.env` file has valid `SUPABASE_ANON_KEY`
- [ ] Backend uses new `lib/supabase.js`
- [ ] `verify-supabase-config.js` runs without errors
- [ ] RLS policies are set in Supabase (ran SQL script)
- [ ] Backend starts without "[Supabase]" errors
- [ ] `/api/health` endpoint returns status OK
- [ ] `/api/feedback` POST returns 200 OK with test data
- [ ] Feedback data appears in Supabase dashboard

---

## Common Issues & Solutions

### Issue: "Supabase is not properly configured"
**Solution:**
1. Verify all three env vars are set
2. Run `verify-supabase-config.js`
3. Check that URL starts with `https://` and ends with `.supabase.co`

### Issue: "permission denied" on INSERT
**Solution:**
1. Go to Supabase SQL Editor
2. Run the RLS policy script
3. Verify the policy appears in "Policies" tab
4. Clear browser cache and retry

### Issue: Backend works but frontend gets 403/500
**Solution:**
1. Check backend logs for error code
2. If `PGRST301` - run RLS policy script
3. If `ENOTFOUND` - verify .env URL
4. If timeout - check network connectivity

---

## Next Steps

1. **Now:** Run `verify-supabase-config.js` to test configuration
2. **Then:** Run the RLS policy SQL in Supabase
3. **Finally:** Start backend and test feedback submission

All files are ready to use - no further code changes needed! 🎉
