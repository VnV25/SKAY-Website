# Backend Setup - Create Missing Database Tables

## Issue
The backend database connection is failing because the `contacts` table hasn't been created in Supabase yet.

## Solution

### Step 1: Create the Contacts Table in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Open your project: **pqdfqgzungrximqwwnkc**
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the SQL from `backend/migrations/create-contacts-table.sql`
6. Click **Run** button (or press Ctrl+Enter)

### Step 2: Verify Table Creation

After running the SQL, you should see:
- ✅ Table `contacts` created
- ✅ Indexes created
- ✅ RLS policies enabled

### Step 3: Restart Backend Server

The backend server will automatically recognize the new table. If you have it running, just restart it:

```bash
# Kill the current process (if running in terminal)
# Then run:
cd backend
node server.js
```

### Step 4: Test the Connection

```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "SKAY backend running",
  "database": "connected",
  "timestamp": "2026-04-07T08:37:03.690Z"
}
```

---

## What was fixed:

1. ✅ **Added `backend/migrations/create-contacts-table.sql`** - SQL script to create the missing contacts table
2. ✅ **Fixed `backend/lib/db.js`** - Updated `createContact()` function to properly insert all fields (name, email, phone, message, status)

## Notes

- The contacts table is used by:
  - Contact form submissions (`POST /api/contact`)
  - Quote requests (`POST /api/contact/quote`)
  - Admin dashboard to view submissions

- The table includes the following columns:
  - `id` (UUID, auto-generated)
  - `name` (Text, required)
  - `email` (Text, required)
  - `phone` (Text, optional)
  - `message` (Text, required)
  - `status` (Text, defaults to 'new')
  - `created_at` (Timestamp, auto-generated)
  - `updated_at` (Timestamp, auto-updated)
