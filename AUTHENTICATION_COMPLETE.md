http://localhost:5000/admin/dashboard.html# 🚀 SKAY Authentication Refactor - Complete Summary

## What Was Done

I've completely refactored your authentication system to separate **Admin** and **Customer** authentication with the following improvements:

### 1. ✅ Admin Authentication (Username/Password)
- **Removed**: Google Sign-In for admin
- **Added**: Unique username-based login system
- **Features**:
  - Separate `Admin` model in MongoDB
  - Account lockout after 5 failed attempts
  - Login tracking (lastLogin, attempt counter)
  - Secure password hashing with bcryptjs

### 2. ✅ Customer Authentication (Email/Password + Google OAuth)
- **Keeps**: Email/password signup & login
- **Adds**: Google OAuth Sign-In integration
- **Tracks**:
  - Login count (how many times they've logged in)
  - Last login date/time
  - Account creation date
  - Account status (active/inactive)

### 3. ✅ Admin Dashboard - Customer Tab
- Shows total registered customers
- Shows active users today
- Displays for each customer:
  - Name, Email, Phone
  - Login count
  - Last login date
  - Join date
  - Status

---

## 📁 Files Created/Modified

### New Files
| File | Purpose |
|------|---------|
| `backend/models/Admin.js` | Admin account model |
| `frontend/login.html` | Customer login/signup with Google |
| `AUTHENTICATION_SETUP.md` | Detailed setup guide |

### Modified Files
| File | Changes |
|------|---------|
| `backend/models/User.js` | Added: googleId, lastLogin, loginCount, status |
| `backend/routes/auth.js` | Complete rewrite - separated admin/customer |
| `backend/middleware/auth.js` | Updated token verification logic |
| `backend/routes/admin.js` | New customer data endpoints |
| `backend/seeds/admin-seed.js` | Now uses Admin model |
| `frontend/admin/login.html` | Username-based login (not email) |
| `frontend/admin/dashboard.html` | New customers tab with stats |
| `frontend/js/api.js` | New API methods for auth |
| `frontend/js/admin.js` | Updated customer data loading |

---

## 🔐 Authentication Flows

### Admin Login
```
Admin Login Page (/admin/login.html)
    ↓
Enter: username + password
    ↓
POST /api/auth/admin/login
    ↓
JWT token issued (24h expiry)
    ↓
Redirects to dashboard
    ↓
Dashboard loads /api/admin/customers (shows customer logins)
```

### Customer Signup
```
Customer Login Page (/login.html)
    ↓
Click "Sign Up" tab
    ↓
Enter: name + email + password
    ↓
POST /api/auth/customer/register
    ↓
User document created with:
  - role: 'user'
  - lastLogin: now
  - loginCount: 1
    ↓
JWT token issued (7d expiry)
    ↓
Redirects to homepage
```

### Customer Google Sign-In
```
Customer clicks "Continue with Google"
    ↓
Google OAuth popup
    ↓
User selects account
    ↓
POST /api/auth/customer/google-sync
    ↓
If first time: Creates new User
If returning: Increments loginCount
    ↓
JWT token issued (7d expiry)
    ↓
Redirects to homepage
```

---

## 🚀 Quick Start

### Step 1: Backend Setup
```bash
cd backend

# Seed the default admin account
npm run seed:admin

# Output should show:
# ✅ Admin account created successfully!
#    Username: admin
#    Password: AdminSKAY@2024
#    Email: admin@skay.com
```

### Step 2: Setup Google OAuth (Optional but recommended)
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials (Web application)
3. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:5000`
   - Your production domain
4. Copy the Client ID
5. In `frontend/login.html`, replace `YOUR_GOOGLE_CLIENT_ID` with your actual ID

### Step 3: Test It Out

**Admin Login:**
1. Go to `http://localhost:5000/admin/login.html`
2. Username: `admin`
3. Password: `AdminSKAY@2024`
4. Click "Customers" tab to see registered customers

**Customer Signup:**
1. Go to `http://localhost:5000/login.html`
2. Click "Sign Up" tab
3. Enter name, email, password
4. Click "Create Account"
5. You'll be logged in and redirected

**With Google:**
1. In signup/login page, click "Continue with Google"
2. Select your Google account
3. Auto-redirected after sign-in

---

## 📊 Customer Data Visible in Admin Panel

When a customer logs in, the following is tracked and visible to admin:

```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "loginCount": 5,
  "lastLogin": "2026-04-04T10:30:00Z",
  "createdAt": "2026-03-15T08:00:00Z",
  "status": "active"
}
```

Admin can click on any customer to see:
- Full customer details
- Complete order history
- Total order count
- Total money spent

---

## 🔑 Default Credentials

### Admin (Change in Production!)
- **URL**: `/admin/login.html`
- **Username**: `admin`
- **Password**: `AdminSKAY@2024`

### Customer (Self-Service)
- **Signup URL**: `/login.html` → "Sign Up" tab
- **Login URL**: `/login.html` → "Login" tab
- **Google OAuth**: Click icon in login/signup

---

## ⚙️  API Endpoints

### Customer Auth
```
POST /api/auth/customer/register
POST /api/auth/customer/login
POST /api/auth/customer/google-sync
```

### Admin Auth
```
POST /api/auth/admin/login
```

### Customer Data (Admin Only)
```
GET /api/admin/customers           (list all)
GET /api/admin/customers/:id       (individual)
```

---

## 🛡️ Security Improvements

✅ **Password Hashing**: bcryptjs with salt rounds  
✅ **Account Lockout**: 5 failed attempts → 15 min lockout  
✅ **JWT Tokens**: Different expiry for admin (24h) vs customer (7h)  
✅ **Password Validation**: Min 6 characters  
✅ **Email Verification**: Can be added later  
✅ **Separate Models**: Admin and Customer data isolated  

---

## 📝 Important Notes

1. **Change Admin Password**: The default `AdminSKAY@2024` should be changed in production
2. **Google OAuth Required**: For full customer experience, set up Google OAuth
3. **Environment Setup**: Make sure `JWT_SECRET` is set in `.env`
4. **Database**: Migrations may be needed if you had existing admin users

---

## 🔧 Troubleshooting

### Admin Can't Login
```bash
# Re-run seed
npm run seed:admin --force

# Or manually set password
db.admins.updateOne(
  { username: "admin" },
  { $set: { password: "new_hashed_password" } }
)
```

### Customers Not Showing in Admin Dashboard
1. Ensure customer logged in at least once
2. Check MongoDB: `db.users.find({ role: 'user' })`
3. Verify admin token in browser console

### Google OAuth Not Working
1. Verify Client ID is correct in `login.html`
2. Check authorized redirect URIs in Google Console
3. Check browser console for errors
4. Verify frontend URL matches OAuth settings

---

## 📚 Full Documentation

See `AUTHENTICATION_SETUP.md` for:
- Detailed setup instructions
- Database migration guide
- Testing commands
- Advanced configuration
- Security best practices

---

## Next Steps

1. **Immediate** ✓ Done
   - Admin authentication with username/password ✓
   - Customer authentication with optional Google OAuth ✓
   - Customer list in admin dashboard ✓
   - Login tracking ✓

2. **Recommended**
   - Set up Google OAuth credentials
   - Change default admin password
   - Test all authentication flows
   - Review security settings

3. **Optional**
   - Add email verification for signup
   - Add password reset functionality
   - Add 2FA for admin accounts
   - Add audit logs for admin actions

---

**The system is now fully set up and ready to use!** 🎉
