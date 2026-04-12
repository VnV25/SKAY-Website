# Route Migration Guide: MongoDB to Supabase

This guide shows how to update backend routes to use the new Supabase database functions.

## Template: Converting a Route

### Before (MongoDB with Mongoose)
```javascript
const User = require('../models/User');

router.post('/create', async (req, res) => {
  try {
    const user = await new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    }).save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

### After (Supabase)
```javascript
const db = require('../lib/db');

router.post('/create', async (req, res) => {
  try {
    // For Supabase Auth users
    const profile = await db.createProfile(userId, {
      email: req.body.email,
      full_name: req.body.name,
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

## Common Route Patterns

### Get User by ID
```javascript
// Before
const user = await User.findById(req.params.id);

// After
const profile = await db.getProfileById(req.params.id);
```

### Get User by Email
```javascript
// Before
const user = await User.findOne({ email });

// After
const profile = await db.getProfileByEmail(email);
```

### Update User
```javascript
// Before
user.name = req.body.name;
await user.save();

// After
const updated = await db.updateProfile(userId, {
  full_name: req.body.name,
});
```

### Create Order
```javascript
// Before
const order = await new Order({
  userId: req.user.id,
  items: req.body.items,
  total: req.body.total,
}).save();

// After
const order = await db.createOrder(req.user.userId, {
  items: req.body.items,
  total: req.body.total,
  status: 'pending',
});
```

### Get User Orders
```javascript
// Before
const orders = await Order.find({ userId: req.user.id });

// After
const orders = await db.getOrdersByUserId(req.user.userId);
```

## Available Database Functions

See `backend/lib/db.js` for the complete list. Here are the main ones:

### Profiles
- `createProfile(userId, data)` - Create a user profile
- `getProfileById(userId)` - Get profile by ID
- `getProfileByEmail(email)` - Get profile by email
- `updateProfile(userId, updates)` - Update profile
- `incrementLoginCount(userId)` - Update login stats

### Orders
- `createOrder(userId, data)` - Create an order
- `getOrdersByUserId(userId)` - Get user's orders
- `getOrderById(orderId)` - Get specific order
- `updateOrder(orderId, updates)` - Update order status/details
- `getAllOrders()` - Get all orders (admin)

### Carts
- `getOrCreateCart(userId)` - Get or create user cart
- `updateCart(userId, {items, total})` - Update cart contents

### Wishlists
- `getOrCreateWishlist(userId)` - Get or create wishlist
- `updateWishlist(userId, items)` - Update wishlist items

### Contacts
- `createContact({name, email, phone, message})` - Create contact form submission
- `getAllContacts()` - Get all contacts (admin)
- `updateContact(contactId, updates)` - Update contact status

### Admins
- `isAdmin(userId)` - Check if user is admin
- `getAdminById(userId)` - Get admin profile

## Routes That Need Updates

### Priority 1 (Core Functionality)
- ✅ `routes/auth.js` → Create a new version or use `auth-supabase.js`
- `routes/orders.js` - Use `db.createOrder`, `db.getOrdersByUserId`
- `routes/cart.js` - Use `db.getOrCreateCart`, `db.updateCart`
- `routes/wishlist.js` - Use `db.getOrCreateWishlist`, `db.updateWishlist`
- `routes/contact.js` - Use `db.createContact`, `db.getAllContacts`

### Priority 2 (Admin)
- `routes/admin.js` - Use `db.getAllOrders`, `db.isAdmin`

### Priority 3 (Static Data)
- `routes/products.js` - Products are likely static; check if you need DB queries
- `routes/services.js` - Services are likely static; check if you need DB queries

## Example: Converting Contact Route

### Before
```javascript
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
  try {
    const contact = await new Contact({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      message: req.body.message,
    }).save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

### After
```javascript
const db = require('../lib/db');

router.post('/', async (req, res) => {
  try {
    const contact = await db.createContact({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      message: req.body.message,
    });
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

## User ID Extraction

In middleware, user ID is available as:
- `req.user.userId` (from Supabase auth)
- `req.user.id` (from JWT auth, fallback)

Always use: `req.user.userId || req.user.id` for compatibility

## Handling Relationships

### Old (MongoDB References)
```javascript
const user = await User.findById(userId).populate('wishlist');
```

### New (Supabase JSONB)
```javascript
const wishlist = await db.getOrCreateWishlist(userId);
// wishlist.items is a JSONB array
```

Products/Services in cart and wishlist are stored as JSONB arrays with product details (name, price, image, etc.)

## Testing Database Functions

Test the Supabase connection:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "SKAY backend running",
  "database": "connected",
  "timestamp": "2026-04-06T..."
}
```

## Common Issues

### Issue: "No table columns found"
- Solution: Make sure you ran all SQL commands from `SUPABASE_DATABASE_SCHEMA.sql`

### Issue: "RLS policy violation"
- Solution: Check RLS policies in Supabase; ensure service role key is being used

### Issue: "SUPABASE_URL not set"
- Solution: Add environment variables to `backend/.env`

## Next Steps

1. ✅ Backup your data if migrating from existing MongoDB
2. ✅ Run SQL schema in Supabase
3. ✅ Set environment variables
4. ✅ Update critical routes (auth, orders, cart)
5. ✅ Test each route with real requests
6. ✅ Deploy to production
7. Remove Mongoose dependency: `npm remove mongoose`
