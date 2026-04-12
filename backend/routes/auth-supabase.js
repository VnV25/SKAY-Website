const express = require('express');
const { supabase, supabaseAuth } = require('../lib/supabase');
const db = require('../lib/db');
const { body, validationResult } = require('express-validator');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ════════════════════════════════════════════════════════
// 🔐 CUSTOMER AUTHENTICATION
// ════════════════════════════════════════════════════════

// ── Customer Register ──────────────────────────────────────
router.post('/customer/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // Accept either 'name' or 'full_name'
  body(['name', 'full_name']).if(() => false).trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
], async (req, res) => {
  try {
    console.log('[Auth] customer register body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    // Support both 'name' and 'full_name' field names
    const { email, password, full_name, name } = req.body;
    const finalName = full_name || name;

    if (!finalName) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Create user in Supabase Auth using standard sign-up flow
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: finalName },
      },
    });

    if (authError) {
      console.error('[Auth] customer register Supabase signUp error:', authError);
      const statusCode = authError.status || 400;
      return res.status(statusCode).json({
        message: authError.message || 'Account creation failed',
        code: authError.code,
        status: authError.status,
      });
    }

    if (!authData || !authData.user || !authData.user.id) {
      console.error('[Auth] customer register missing authData.user after signUp:', authData);
      return res.status(500).json({ message: 'Account creation failed. Please try again.' });
    }

    // Create or update profile in database
    try {
      await db.createProfile(authData.user.id, {
        email,
        full_name: finalName,
      });
      console.log('[Auth] Profile created for user:', authData.user.id);
    } catch (profileError) {
      const profileErrorMessage = String(profileError?.message || profileError);
      console.error('[Auth] Profile creation error details:', profileError);
      if (profileErrorMessage.includes('duplicate key') || profileErrorMessage.includes('already exists')) {
        console.log('[Auth] Duplicate profile detected; updating existing profile for user:', authData.user.id);
        await db.updateProfile(authData.user.id, {
          email,
          full_name: finalName,
        });
      } else {
        throw profileError;
      }
    }

    // Sign in the user immediately and return a token for frontend
    const { data: loginData, error: loginError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.warn('[Auth] customer register sign-in error:', loginError.message);
      return res.status(201).json({
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: finalName,
        },
        token: null,
        message: 'Account created. Please login to proceed.',
      });
    }

    res.status(201).json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: finalName,
      },
      token: loginData?.session?.access_token || null,
      message: 'Account created successfully. You can now log in.',
    });
  } catch (err) {
    console.error('[Auth] customer register error:', err);
    console.error('[Auth] customer register error stack:', err.stack);
    res.status(500).json({ message: 'Database error creating new user', error: err.message });
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

    // Sign in with Supabase Auth using anon client
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update login info in profile
    await db.incrementLoginCount(data.user.id);

    // Get complete profile
    const profile = await db.getProfileById(data.user.id);

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        ...profile,
      },
      message: 'Login successful',
    });
  } catch (err) {
    console.error('[Auth] customer login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Get Current User ───────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    res.json({
      user: req.user,
    });
  } catch (err) {
    console.error('[Auth] get me error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Customer Logout ────────────────────────────────────────
router.post('/customer/logout', requireAuth, async (req, res) => {
  try {
    await supabase.auth.signOut();
    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error('[Auth] logout error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Update Profile ─────────────────────────────────────────
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { full_name, phone, company, avatar_url } = req.body;
    const userId = req.user.userId || req.user.id;

    const updated = await db.updateProfile(userId, {
      full_name: full_name || req.user.full_name,
      phone: phone || req.user.phone,
      company: company || req.user.company,
      avatar_url: avatar_url || req.user.avatar_url,
    });

    res.json({
      user: updated,
      message: 'Profile updated successfully',
    });
  } catch (err) {
    console.error('[Auth] update profile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// 🔐 ADMIN AUTHENTICATION
// ════════════════════════════════════════════════════════

// ── Admin Login ────────────────────────────────────────────
router.post('/admin/login', [
  body('password').exists().withMessage('Password required'),
], async (req, res) => {
  try {
    console.log('[Auth/Admin] login body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Verify required env vars
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('[Auth/Admin] Supabase auth config missing:', {
        SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
        SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
      });
      return res.status(500).json({ message: 'Server configuration error' });
    }

    let { email, username, password } = req.body;
    
    // Map username 'admin' to internal admin email
    if (username === 'admin' || email === 'admin') {
      email = 'admin@skay.in';
    } else if (!email && username) {
      email = username; // Use username as email if provided
    }

    if (!email) {
      return res.status(400).json({ message: 'Email or username is required' });
    }

    console.log(`[Auth/Admin] Attempting login for: ${email}`);

    // Sign in with Supabase Auth using anon client
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.warn(`[Auth/Admin] Login failed for ${email}: ${error.message}`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (!data || !data.user) {
      console.error('[Auth/Admin] Login succeeded but no user data returned');
      return res.status(500).json({ message: 'Authentication error' });
    }

    if (!data.session || !data.session.access_token) {
      console.error('[Auth/Admin] Login succeeded but no session/token returned');
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if user is admin
    let admin;
    try {
      admin = await db.getAdminById(data.user.id);
    } catch (dbError) {
      console.error('[Auth/Admin] Database error checking admin status:', dbError);
      return res.status(401).json({ message: 'Authentication failed' });
    }
    if (!admin) {
      console.warn(`[Auth/Admin] Access denied for ${email} - User is not an admin.`);
      return res.status(401).json({ message: 'Admin not found' });
    }

    // Increment login count for admin
    try {
      await db.incrementLoginCount(data.user.id);
    } catch (dbError) {
      console.error('[Auth/Admin] Error incrementing login count:', dbError);
      // Continue, not critical
    }

    // Get complete profile
    let profile;
    try {
      profile = await db.getProfileById(data.user.id);
    } catch (dbError) {
      console.error('[Auth/Admin] Database error fetching profile:', dbError);
      return res.status(401).json({ message: 'Authentication failed' });
    }
    if (!profile) {
      console.warn(`[Auth/Admin] Admin profile not found for ${email} (${data.user.id})`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.json({
      token: data.session.access_token,
      admin: {
        id: data.user.id,
        email: data.user.email,
        ...profile,
      },
      message: 'Admin login successful',
    });
  } catch (err) {
    console.error('[Auth/Admin] login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── Create Admin (super-admin only) ────────────────────────
router.post('/admin/create', requireAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').trim().isLength({ min: 2 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, full_name } = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    // Create admin profile
    await db.createAdmin(authData.user.id, { email, full_name });

    res.status(201).json({
      admin: {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        role: 'admin',
      },
      message: 'Admin user created successfully',
    });
  } catch (err) {
    console.error('[Auth] create admin error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
