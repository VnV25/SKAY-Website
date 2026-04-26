const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');

// ================= HELPER: CREATE JWT =================
const createToken = (user, role = 'customer') => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ================= REGISTER CUSTOMER =================
const registerCustomer = async (req, res) => {
  try {
    const { email, password, name, full_name } = req.body;
    const finalName = full_name || name;

    if (!email || !password || !finalName) {
      return res.status(400).json({
        message: 'Email, password, and name are required',
      });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: { full_name: finalName },
      },
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    await supabase.from('profiles').insert([
      {
        id: authData.user.id,
        email: email.toLowerCase(),
        full_name: finalName,
        role: 'customer',
        login_count: 0,
        is_logged_in: true,
      },
    ]);

    const token = createToken(authData.user, 'customer');

    res.status(201).json({
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
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= LOGIN CUSTOMER =================
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await supabase.rpc('increment_login_count', { user_id: data.user.id }).catch(() => {});

    await supabase
      .from('profiles')
      .update({ is_logged_in: true })
      .eq('id', data.user.id);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const token = createToken(data.user, 'customer');

    res.json({
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.full_name || data.user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= 🔥 GOOGLE LOGIN (NEW FIX FOR YOUR SYSTEM) =================
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // Supabase access_token

    if (!token) {
      return res.status(400).json({ message: 'Token missing' });
    }

    // decode supabase token (safe extraction)
    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid Google session' });
    }

    const user = {
      id: decoded.sub,
      email: decoded.email,
    };

    const appToken = createToken(user, 'customer');

    res.json({
      success: true,
      token: appToken, // 🔥 THIS IS YOUR skay-token
      user,
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ message: 'Google login failed' });
  }
};

// ================= LOGIN ADMIN =================
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
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

    const token = createToken(profile, 'admin');

    res.json({
      token,
      admin: profile,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= ADMIN STATS =================
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
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: loggedInUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_logged_in', true);

    res.json({
      totalUsers: usersData?.users?.length || 0,
      totalProducts: totalProducts || 0,
      totalContacts: totalContacts || 0,
      pendingOrders: pendingOrders || 0,
      loggedInUsers: loggedInUsers || 0,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Failed to load stats' });
  }
};

// ================= USERS =================
const getAdminUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;

    res.json({ users: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load users' });
  }
};

// ================= CONTACTS =================
const getAdminContacts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ contacts: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load contacts' });
  }
};

// ================= UPDATE CONTACT =================
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

    res.json({
      message: 'Contact updated successfully',
      contact: data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update contact' });
  }
};

// ================= EXPORTS =================
module.exports = {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  googleLogin, // 🔥 IMPORTANT ADDITION
  getAdminStats,
  getAdminUsers,
  getAdminContacts,
  updateContact,
};