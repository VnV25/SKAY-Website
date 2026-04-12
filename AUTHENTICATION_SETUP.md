# SKAY Authentication System - Complete Setup Guide

## Overview

The authentication system has been completely refactored to separate admin and customer authentication:

- **Admin Authentication**: Unique username/password (stored in separate `Admin` model)
- **Customer Authentication**: Email/password OR Google OAuth (stored in `User` model with tracking)

## Backend Changes

### 1. New Models

#### Admin Model (`backend/models/Admin.js`)
- `username`: Unique identifier for admin login
- `email`: Admin email address
- `password`: Hashed password
- `name`: Admin name
- `role`: 'admin' or 'super-admin'
- `permissions`: Array of permissions
- `status`: 'active' or 'inactive'
- `lastLogin`: Timestamp of last login
- `loginAttempts`: Failed login attempts counter
- `lockedUntil`: Account lockout timestamp (15 min after 5 failed attempts)

#### User Model Updates
- Changed `supabaseId` → `googleId` for Google OAuth
- Added `lastLogin`: Timestamp of user's last login
- Added `loginCount`: Number of times user has logged in
- Added `status`: 'active' or 'inactive'

### 2. Updated Auth Routes

All routes now follow a consistent pattern:

**Customer Routes:**
- `POST /api/auth/customer/register` - Register new customer
- `POST /api/auth/customer/login` - Customer email/password login
- `POST /api/auth/customer/google-sync` - Google OAuth sign-in

**Admin Routes:**
- `POST /api/auth/admin/login` - Admin username/password login

**Common:**
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout (client-side token removal)

### 3. Updated Middleware (`backend/middleware/auth.js`)

```javascript
// Checks for any valid token (customer or admin)
requireAuth(req, res, next)

// Checks for admin-specific token (adminId field present)
requireAdmin(req, res, next)
```

### 4. Admin Routes Updates (`backend/routes/admin.js`)

New endpoint for customer management:
- `GET /api/admin/customers` - List all customers with login stats
- `GET /api/admin/customers/:id` - Get customer details with order history

**Customer data returned includes:**
- Login count
- Last login timestamp
- Account creation date
- Status (active/inactive)

## Frontend Changes

### 1. New Customer Login/Signup Page (`frontend/login.html`)

Features:
- Email/password login
- Email/password signup
- Google OAuth integration (for both login and signup)
- Tab switching between login and signup
- Form validation
- Error handling

**To enable Google OAuth:**
1. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google Client ID
2. Set up OAuth credentials in Google Cloud Console
3. Add frontend URL to authorized redirect URIs

### 2. Updated Admin Login Page (`frontend/admin/login.html`)

- Changed from email to **username** login
- Removed Supabase Google sign-in
- Uses unique username/password combination
- Default credentials: `admin` / `AdminSKAY@2024`

### 3. Updated Admin Dashboard (`frontend/admin/dashboard.html`)

New "Customers" tab showing:
- Total registered customers count
- Active today count  
- Customer list with:
  - Name, Email, Phone
  - Login count
  - Last login date
  - Join date
  - Status

### 4. Updated JavaScript Files

**api.js** - New endpoints:
```javascript
auth.register(name, email, password)
auth.login(email, password)
auth.googleSync(googleData)
adminAuth.login(username, password)
admin.customers()
admin.getCustomer(id)
```

**admin.js** - Updated:
```javascript
loadCustomers() // Now fetches from /api/admin/customers
renderCustomers() // Displays login statistics
```

## Setup Instructions

### Step 1: Backend Setup

1. Create the Admin model:
   ```bash
   # Already done - file created at backend/models/Admin.js
   ```

2. Update your `backend/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/skay
   JWT_SECRET=your-secret-key
   PORT=5000
   NODE_ENV=development
   ```

3. Seed the default admin:
   ```bash
   cd backend
   npm run seed:admin
   ```
   
   This creates:
   - Username: `admin`
   - Password: `AdminSKAY@2024`
   - Email: `admin@skay.com`

   **Important:** Change this password in production!

### Step 2: Frontend Setup

1. Update `frontend/login.html` with your Google Client ID:
   ```javascript
   // Line ~200 in login.html
   google.accounts.id.initialize({
     client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
     callback: handleGoogleSignIn,
   });
   ```

2. Update admin login link in your navbar/header if needed

### Step 3: Database Migration (if you had existing data)

If you had existing admin users in the User collection:

```javascript
// Run this in MongoDB console or create a migration script
db.users.find({ role: 'admin' }).forEach(user => {
  db.admins.insertOne({
    username: user.email.split('@')[0],
    email: user.email,
    password: user.password,
    name: user.name,
    role: 'admin',
    status: 'active',
    permissions: ['manage-products', 'manage-orders', 'manage-users', 'view-analytics'],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  })
});

// Then Remove admin users from users collection
db.users.deleteMany({ role: 'admin' });
```

## Usage

### Admin Login

1. Go to `/admin/login.html`
2. Enter username: `admin`
3. Enter password: `AdminSKAY@2024`
4. Dashboard shows customer list with login statistics

### Customer Login/Signup

1. Go to `/login.html`
2. Either:
   - **Login**: Enter email and password → redirects to homepage
   - **Signup**: Create new account with email/password → redirects to homepage  
   - **Google**: Click "Continue with Google" → OAuth flow → redirects to homepage

### Customer Information Tracking

When a customer logs in:
```
- lastLogin: Current timestamp
- loginCount: Incremented by 1
- status: Set to 'active'
```

Admin can view all this data in Admin Dashboard → Customers tab

## API Token Structure

### Customer Token
```javascript
{
  userId: "...",
  role: "user",
  email: "customer@example.com",
  iat: 1234567890,
  exp: 1234654290
}
```

### Admin Token  
```javascript
{
  adminId: "...",
  role: "admin",
  username: "admin",
  email: "admin@skay.com",
  iat: 1234567890,
  exp: 1234654290
}
```

## Security Features

### Admin Account Protection
- Account lockout after 5 failed login attempts
- 15-minute lockout period
- Failed attempt counter resets on successful login
- Password hashing with bcryptjs

### Token Management
- JWT tokens with expiration
- Customer tokens: 7 days
- Admin tokens: 24 hours
- Tokens stored in localStorage

## Troubleshooting

### Admin can't login
1. Check username/password is correct
2. Run seed again: `npm run seed:admin`
3. Check admin account status in DB: `db.admins.find()`

### Customer can't see their data in admin panel
1. Ensure customer has logged in at least once
2. Check customer status is 'active'
3. Verify Admin Customers endpoint: `GET /api/admin/customers`

### Google OAuth not working
1. Confirm Client ID is correct
2. Check frontend URL is in authorized URIs
3. Check browser console for errors
4. Verify `handleGoogleSignIn` function is defined

### Customers not showing in list
1. Verify customers have `role: 'user'` in database
2. Check `/api/admin/customers` returns data
3. Verify admin token is valid

## Testing

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"AdminSKAY@2024"}'
```

### Test Customer Registration
```bash
curl -X POST http://localhost:5000/api/auth/customer/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'
```

### Test Get Customers (with admin token)
```bash
curl -X GET http://localhost:5000/api/admin/customers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Files Modified/Created

### Created
- `backend/models/Admin.js` - Admin model
- `frontend/login.html` - Customer login/signup page

### Modified
- `backend/models/User.js` - Added googleId, lastLogin, loginCount, status
- `backend/routes/auth.js` - Completely rewritten for customer/admin separation
- `backend/middleware/auth.js` - Updated token verification
- `backend/routes/admin.js` - Added customer endpoints
- `backend/seeds/admin-seed.js` - Updated to use Admin model
- `frontend/admin/login.html` - Updated for username login
- `frontend/admin/dashboard.html` - Updated customers tab
- `frontend/js/api.js` - Added new endpoints
- `frontend/js/admin.js` - Updated customer loading

## Next Steps

1. **Production Setup**:
   - Change default admin password
   - Set up Google OAuth credentials
   - Configure environment variables
   - Test all authentication flows

2. **Email Integration** (Optional):
   - Add email verification for customer signup
   - Add password reset functionality
   - Add email notifications for failed logins

3. **Analytics** (Optional):
   - Add more detailed login analytics
   - Track page visits per customer
   - Monitor admin activity logs

4. **Enhanced Security** (Optional):
   - Add 2FA for admin accounts
   - Add IP whitelisting for admin
   - Add audit logs for admin actions
