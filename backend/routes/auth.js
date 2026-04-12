const express = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User     = require('../models/User');
const Admin    = require('../models/Admin');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'skay-dev-secret';

// ════════════════════════════════════════════════════════
// 🔐 CUSTOMER AUTHENTICATION
// ════════════════════════════════════════════════════════

// ── Customer Register ──────────────────────────────────────
router.post('/customer/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    console.log('req.body:', req.body);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await new User({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      lastLogin: new Date(),
      loginCount: 1,
    }).save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin,
      },
      message: 'Account created successfully',
    });
  } catch (err) {
    console.error('Register save error:', err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// ── Customer Login ─────────────────────────────────────────
router.post('/customer/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists().withMessage('Password required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'user' });

    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Update login information
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin,
      },
      message: 'Login successful',
    });
  } catch (err) {
    console.error('[Auth] customer login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Google OAuth Sync (Customer) ───────────────────────────
router.post('/customer/google-sync', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;
    if (!googleId || !email) {
      return res.status(400).json({ message: 'googleId and email are required' });
    }

    let user = await User.findOne({ googleId, role: 'user' });
    
    if (!user) {
      // Check if email exists
      user = await User.findOne({ email, role: 'user' });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        if (picture) user.avatar = picture;
      } else {
        // Create new user from Google
        user = new User({
          googleId,
          email,
          name: name || email.split('@')[0],
          avatar: picture || '',
          role: 'user',
          lastLogin: new Date(),
          loginCount: 1,
        });
      }
    } else {
      // Update existing user login info
      user.lastLogin = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
    }

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      message: 'Google sign-in successful',
    });
  } catch (err) {
    console.error('[Auth] google sync error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// 👑 ADMIN AUTHENTICATION
// ════════════════════════════════════════════════════════

// ── Admin Login (with unique username and password) ────────
router.post('/admin/login', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').exists().withMessage('Password required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({ message: 'Admin account is inactive' });
    }

    // Check if account is locked
    if (admin.lockedUntil && new Date() < admin.lockedUntil) {
      return res.status(403).json({ message: 'Account temporarily locked. Try again later.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      // Increment failed attempts
      admin.loginAttempts = (admin.loginAttempts || 0) + 1;
      if (admin.loginAttempts >= 5) {
        admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
      }
      await admin.save();
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Reset failed attempts and update login info
    admin.loginAttempts = 0;
    admin.lockedUntil = undefined;
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, role: admin.role, username: admin.username, email: admin.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      message: 'Admin login successful',
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── Get Profile (for both customers and admins) ─────────────
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);

    let user;
    if (decoded.adminId) {
      user = await Admin.findById(decoded.adminId).select('-password');
    } else if (decoded.userId) {
      user = await User.findById(decoded.userId).select('-password');
    }

    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ user, role: decoded.role });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// ── Logout ─────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  // Token is typically managed on client side
  // This endpoint can be used for logging purposes
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;