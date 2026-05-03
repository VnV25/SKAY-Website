const jwt = require('jsonwebtoken');
const { supabase, supabaseAuth, isSupabaseConfigured } = require('../lib/supabase');

const createToken = (user, role = 'customer') =>
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const hasJwtSecret = () => Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.trim());

const safeCreateToken = (user, role = 'customer') => {
  if (!hasJwtSecret()) {
    const error = new Error('JWT_SECRET is missing on the server');
    error.status = 500;
    throw error;
  }

  return createToken(user, role);
};

const ensureSupabase = (res) => {
  if (!isSupabaseConfigured) {
    res.status(500).json({ message: 'Supabase environment variables are missing on the server' });
    return false;
  }
  return true;
};

const registerCustomer = async (req, res) => {
  try {
    if (!ensureSupabase(res)) return;

    const { email, password, name, full_name } = req.body;
    const finalName = full_name || name;

    if (!email || !password || !finalName) {
      return res.status(400).json({
        message: 'Email, password, and name are required',
      });
    }

    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: { full_name: finalName },
      },
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    if (!authData?.user?.id) {
      return res.status(500).json({ message: 'Registration completed without a valid user record' });
    }

    // Supabase silently returns a user with an empty identities array when the
    // email is already registered (instead of returning an error). Detect this
    // and return a clear 400 so the frontend can show "email already in use".
    if (Array.isArray(authData.user.identities) && authData.user.identities.length === 0) {
      return res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
    }

    // Auto-confirm the email using the service-role admin API so the user
    // can log in immediately after registration without email verification.
    try {
      await supabase.auth.admin.updateUser(authData.user.id, {
        email_confirm: true,
      });
    } catch (confirmErr) {
      // Non-fatal — log but continue. The user may need to confirm via email.
      console.warn('[Auth] registerCustomer: email auto-confirm failed:', confirmErr?.message);
    }

    await supabase.from('profiles').upsert([
      {
        id:        authData.user.id,
        email:     email.toLowerCase(),
        full_name: finalName,
        role:      'customer',
        login_count: 0,
      },
    ]);

    const token = safeCreateToken(authData.user, 'customer');

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: finalName,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

const loginCustomer = async (req, res) => {
  try {
    if (!ensureSupabase(res)) return;

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      // If email is not confirmed, attempt to auto-confirm via admin API and retry
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        try {
          // Find the user by email using admin API
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existingUser = listData?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
          );
          if (existingUser?.id) {
            await supabase.auth.admin.updateUser(existingUser.id, { email_confirm: true });
            // Retry sign-in after confirming
            const { data: retryData, error: retryError } = await supabaseAuth.auth.signInWithPassword({
              email: email.toLowerCase(),
              password,
            });
            if (!retryError && retryData?.user) {
              // Success on retry — continue with retryData
              return await _finishLogin(retryData, res);
            }
          }
        } catch (autoConfirmErr) {
          console.warn('[Auth] loginCustomer: auto-confirm retry failed:', autoConfirmErr?.message);
        }
        return res.status(401).json({
          message: 'Please verify your email before logging in, or contact support.',
        });
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!data?.user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return await _finishLogin(data, res);
  } catch (err) {
    console.error('Login error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

async function _finishLogin(data, res) {
  // Use await + destructuring — supabase-js v2 returns a PromiseLike builder,
  // not a native Promise, so .catch() is not available on it directly.
  await supabase.rpc('increment_login_count', { user_id: data.user.id });

  await supabase
    .from('profiles')
    .upsert({
      id:        data.user.id,
      email:     data.user.email,
      full_name: data.user.user_metadata?.full_name || data.user.email,
      role:      'customer',
    });

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const token = safeCreateToken(data.user, 'customer');

  return res.json({
    success: true,
    token,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: profile?.full_name || data.user.email,
    },
  });
}

const googleLogin = async (req, res) => {
  try {
    if (!ensureSupabase(res)) return;

    // Guard: JWT_SECRET must be set or we cannot issue a token
    if (!hasJwtSecret()) {
      console.error('[Auth] googleLogin: JWT_SECRET is not set');
      return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET missing' });
    }

    const { token } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({ message: 'Token missing' });
    }

    // Verify the Supabase access_token
    const { data, error } = await supabaseAuth.auth.getUser(token.trim());

    if (error || !data?.user?.id || !data?.user?.email) {
      console.error('[Auth] googleLogin: Supabase token verification failed:', error?.message ?? 'no user returned');
      return res.status(401).json({ message: 'Invalid or expired Google session. Please sign in again.' });
    }

    const authUser = data.user;
    const displayName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email;

    // Upsert profile — non-fatal if it fails
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id:        authUser.id,
        email:     authUser.email.toLowerCase(),
        full_name: displayName,
        role:      'customer',
      });

    if (upsertError) {
      console.warn('[Auth] googleLogin: profile upsert warning:', upsertError.message);
      // Continue — a missing profile row is not fatal for token issuance
    }

    const user = {
      id:        authUser.id,
      email:     authUser.email,
      name:      displayName,
      avatarUrl: authUser.user_metadata?.avatar_url ?? null,
      provider:  authUser.app_metadata?.provider ?? 'google',
    };

    // Sign a backend JWT — this is what authMiddleware.js validates
    const appToken = safeCreateToken(user, 'customer');

    console.log(`[Auth] googleLogin: issued JWT for ${user.email}`);

    return res.json({
      success: true,
      token:   appToken,   // backend-signed JWT (not the Supabase token)
      user,
    });
  } catch (err) {
    console.error('[Auth] googleLogin unexpected error:', err);
    return res.status(err.status || 500).json({
      message: err.status ? err.message : 'Google login failed. Please try again.',
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    if (!ensureSupabase(res)) return;

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error || !data?.user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .eq('role', 'admin')
      .single();

    if (!profile) {
      return res.status(401).json({ message: 'Not an admin user' });
    }

    const token = safeCreateToken(profile, 'admin');

    return res.json({
      success: true,
      token,
      admin: profile,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getCurrentCustomer = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.full_name || profile.email,
        role: profile.role || 'customer',
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const { data: usersData } = await supabase.auth.admin.listUsers();

    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: totalContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return res.json({
      success: true,
      totalUsers: usersData?.users?.length || 0,
      totalProducts: totalProducts || 0,
      totalContacts: totalContacts || 0,
      pendingOrders: pendingOrders || 0,
      loggedInUsers: 0,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ message: 'Failed to load stats' });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;

    return res.json({ success: true, users: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load users' });
  }
};

const getAdminContacts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, contacts: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load contacts' });
  }
};

const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: 'Contact updated successfully',
      contact: data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update contact' });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  googleLogin,
  getAdminStats,
  getAdminUsers,
  getAdminContacts,
  updateContact,
  getCurrentCustomer,
};
