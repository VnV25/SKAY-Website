# Database Schema Reference

## Admin Collection (NEW)

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (enum: ['admin', 'super-admin'], default: 'admin'),
  permissions: [String] (array of permission strings),
  status: String (enum: ['active', 'inactive'], default: 'active'),
  lastLogin: Date (nullable),
  loginAttempts: Number (default: 0),
  lockedUntil: Date (nullable),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Example Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "admin",
  "email": "admin@skay.com",
  "password": "$2a$10$...",
  "name": "SKAY Admin",
  "role": "admin",
  "permissions": [
    "manage-products",
    "manage-orders",
    "manage-users",
    "view-analytics"
  ],
  "status": "active",
  "lastLogin": ISODate("2026-04-04T10:30:00Z"),
  "loginAttempts": 0,
  "lockedUntil": null,
  "createdAt": ISODate("2026-01-15T08:00:00Z"),
  "updatedAt": ISODate("2026-04-04T10:30:00Z")
}
```

---

## User Collection (UPDATED)

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, required),
  password: String (hashed, nullable - if using Google auth),
  googleId: String (unique, sparse, nullable),
  role: String (enum: ['user', 'admin'], default: 'user'),
  avatar: String (default: ''),
  wishlist: [ObjectId] (references to Product),
  phone: String (nullable),
  company: String (nullable),
  lastLogin: Date (nullable) ← NEW,
  loginCount: Number (default: 0) ← NEW,
  status: String (enum: ['active', 'inactive'], default: 'active') ← NEW,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Example Customer (Email/Password):**
```json
{
  "_id": ObjectId("507f191e810c19729de860ea"),
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...",
  "googleId": null,
  "role": "user",
  "avatar": "",
  "wishlist": [],
  "phone": "+1234567890",
  "company": null,
  "lastLogin": ISODate("2026-04-04T09:15:00Z"),
  "loginCount": 5,
  "status": "active",
  "createdAt": ISODate("2026-03-15T08:00:00Z"),
  "updatedAt": ISODate("2026-04-04T09:15:00Z")
}
```

**Example Customer (Google OAuth):**
```json
{
  "_id": ObjectId("507f195e810c19729de860eb"),
  "name": "Jane Smith",
  "email": "jane@gmail.com",
  "password": null,
  "googleId": "110123456789123456789",
  "role": "user",
  "avatar": "https://lh3.googleusercontent.com/...",
  "wishlist": [],
  "phone": null,
  "company": null,
  "lastLogin": ISODate("2026-04-04T14:22:00Z"),
  "loginCount": 3,
  "status": "active",
  "createdAt": ISODate("2026-03-20T10:30:00Z"),
  "updatedAt": ISODate("2026-04-04T14:22:00Z")
}
```

---

## Migration from Old System

### If you had admin users in User collection:

```javascript
// Step 1: Copy admin users to Admin collection
db.users.aggregate([
  { $match: { role: 'admin' } },
  {
    $project: {
      username: { $substr: ['$email', 0, { $indexOfBytes: ['$email', '@'] }] },
      email: 1,
      password: 1,
      name: 1,
      status: 'active',
      role: 'admin',
      permissions: [
        'manage-products',
        'manage-orders',
        'manage-users',
        'view-analytics'
      ],
      createdAt: 1,
      updatedAt: 1
    }
  }
]).forEach(doc => {
  const username = doc.username || doc.email.split('@')[0];
  db.admins.insertOne({
    username: username,
    email: doc.email,
    password: doc.password,
    name: doc.name,
    status: 'active',
    role: 'admin',
    permissions: [
      'manage-products',
      'manage-orders',
      'manage-users',
      'view-analytics'
    ],
    lastLogin: doc.updatedAt,
    loginAttempts: 0,
    lockedUntil: null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  });
});

// Step 2: Remove admin users from User collection
db.users.deleteMany({ role: 'admin' });

// Step 3: Add new fields to existing users
db.users.updateMany(
  { role: 'user' },
  [{
    $set: {
      lastLogin: null,
      loginCount: 0,
      status: 'active',
      googleId: null,
      supabaseId: null  // Remove if present
    }
  }]
);
```

---

## Quick Lookup

### User Roles
| Role | Purpose | Login Via | Collection |
|------|---------|----------|-----------|
| `admin` | System administrator | Username in Admin | `admins` |
| `super-admin` | Full system access | Username in Admin | `admins` |
| `user` | Regular customer | Email or Google | `users` |

### Account Status
| Status | Meaning | Available Actions |
|--------|---------|------------------|
| `active` | Normal user | Can login, browse |
| `inactive` | Suspended | Cannot login |

### Admin Permissions
```
'manage-products'    - Can add/edit/delete products
'manage-orders'      - Can view/update orders
'manage-users'       - Can view/manage users
'manage-admins'      - Can manage admin accounts
'view-analytics'     - Can view reports/stats
```

### Authentication Fields

**Admin Account Lockout:**
- After 5 failed login attempts
- Account locked for 15 minutes
- After successful login, `loginAttempts` resets to 0

**Customer Login Tracking:**
- `loginCount` incremented each login
- `lastLogin` updated to current timestamp
- Used for analytics in admin dashboard

---

## API JWT Structure

### Admin Token
```json
{
  "adminId": "507f1f77bcf86cd799439011",
  "role": "admin",
  "username": "admin",
  "email": "admin@skay.com",
  "iat": 1712234567,
  "exp": 1712320967
}
```

### Customer Token
```json
{
  "userId": "507f191e810c19729de860ea",
  "role": "user",
  "email": "john@example.com",
  "iat": 1712234567,
  "exp": 1712839367
}
```

---

## Common MongoDB Queries

### Find all admins
```javascript
db.admins.find()
```

### Find all active customers
```javascript
db.users.find({ role: 'user', status: 'active' })
```

### Find customers who logged in today
```javascript
db.users.find({
  role: 'user',
  lastLogin: {
    $gte: new Date(new Date().setHours(0, 0, 0, 0))
  }
})
```

### Get customer with most logins
```javascript
db.users.find({ role: 'user' })
  .sort({ loginCount: -1 })
  .limit(1)
```

### Find locked admin accounts
```javascript
db.admins.find({
  lockedUntil: { $gt: new Date() }
})
```

### Reset failed login attempts
```javascript
db.admins.updateOne(
  { username: 'admin' },
  { $set: { loginAttempts: 0, lockedUntil: null } }
)
```

### Update customer status
```javascript
db.users.updateOne(
  { _id: ObjectId('507f191e810c19729de860ea') },
  { $set: { status: 'inactive' } }
)
```

---

## Indexes for Performance

Recommended indexes to create:

```javascript
// Admin collection
db.admins.createIndex({ username: 1 }, { unique: true })
db.admins.createIndex({ email: 1 }, { unique: true })
db.admins.createIndex({ status: 1 })

// User collection  
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ googleId: 1 }, { unique: true, sparse: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ lastLogin: 1 })
db.users.createIndex({ loginCount: -1 })
db.users.createIndex({ status: 1 })
```

---

## Backup and Recovery

### Backup admin accounts
```bash
mongodump --uri "mongodb://localhost:27017/skay" --collection admins --out ./backup
```

### Backup user accounts with login data
```bash
mongodump --uri "mongodb://localhost:27017/skay" --collection users --out ./backup
```

### Restore
```bash
mongorestore --uri "mongodb://localhost:27017/skay" ./backup/skay
```
