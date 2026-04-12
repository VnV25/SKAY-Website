const express = require('express');
const { supabase } = require('../lib/supabase');
const db = require('../lib/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin token
router.use(requireAdmin);

// ── GET /api/admin/stats ──────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    console.log('\n🔍 [Admin Stats] Starting stats collection...');
    
    // Get total registered users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    
    console.log(`📊 Total registered profiles - Count: ${totalUsers}`);

    // Get profiles with logins
    const { data: profilesWithLogins } = await supabase
      .from('profiles')
      .select('id')
      .gt('login_count', 0);
    
    console.log(`👥 Profiles with logins - Count: ${profilesWithLogins?.length || 0}`);

    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });
    
    console.log(`📦 Total products - Count: ${totalProducts}`);

    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true });
    
    console.log(`🛒 Total orders - Count: ${totalOrders}`);

    // Get pending orders
    const { data: pendingOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'pending');
    
    console.log(`⏳ Pending orders - Count: ${pendingOrders?.length || 0}`);

    // Get total contacts/quotes
    const { count: totalContacts } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true });
    
    console.log(`📧 Total contacts/quotes - Count: ${totalContacts}`);

    // Get new contacts
    const { data: newContacts } = await supabase
      .from('contacts')
      .select('id')
      .eq('status', 'new');
    
    console.log(`🆕 New contacts - Count: ${newContacts?.length || 0}`);

    // Get total revenue (sum of order totals)
    const { data: allOrders } = await supabase
      .from('orders')
      .select('total');
    
    const totalRevenue = (allOrders || []).reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    console.log(`💰 Total revenue - Amount: ₹${totalRevenue}`);

    console.log('\n📋 [Admin Stats Final] Complete\n');

    res.json({ 
      totalUsers,
      customersWithLogins: profilesWithLogins?.length || 0,
      totalProducts: totalProducts || 0,
      totalOrders,
      pendingOrders: pendingOrders?.length || 0,
      totalContacts: totalContacts || 0,
      newContacts: newContacts?.length || 0,
      totalRevenue,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Admin] stats error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/admin/users ──────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data: users, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'customer')
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    res.json({
      users: users || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('[Admin] get users error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/admin/orders ─────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .range(offset, offset + parseInt(limit) - 1)
      .order('order_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, count } = await query;

    res.json({
      orders: orders || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('[Admin] get orders error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/admin/contacts ───────────────────────────────
router.get('/contacts', async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: contacts, count } = await query;

    res.json({
      contacts: contacts || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('[Admin] get contacts error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/admin/customers ──────────────────────────────
router.get('/customers', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get customer profiles with login info
    const { data: customers, count } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, login_count, last_login, created_at, updated_at', { count: 'exact' })
      .eq('role', 'customer')
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    // Count active users (logged in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString();

    const { data: activeToday } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'customer')
      .gte('last_login', todayString);

    // Transform data for display
    const transformedCustomers = (customers || []).map(c => ({
      id: c.id,
      name: c.full_name || 'Unknown',
      email: c.email,
      phone: c.phone || '—',
      loginCount: c.login_count || 0,
      lastLogin: c.last_login,
      createdAt: c.created_at,
      status: c.last_login && new Date(c.last_login) > new Date(Date.now() - 30*24*60*60*1000) ? 'active' : 'inactive',
    }));

    res.json({
      customers: transformedCustomers,
      total: count || 0,
      activeToday: activeToday?.length || 0,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('[Admin] get customers error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── PUT /api/admin/contact/:id ──────────────────────────────
router.put('/contact/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const updates = {};
    if (status) updates.status = status;

    const contact = await db.updateContact(req.params.id, updates);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    
    res.json(contact);
  } catch (err) {
    console.error('[Admin] update contact error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/admin/dashboard ──────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    // Get stats
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    const { count: totalOrders } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true });

    const { count: totalContacts } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true });

    // Get recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('order_date', { ascending: false })
      .limit(5);

    // Get recent contacts
    const { data: recentContacts } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get pending items
    const { data: pendingOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'pending');

    const { data: newContacts } = await supabase
      .from('contacts')
      .select('id')
      .eq('status', 'new');

    res.json({
      stats: {
        totalUsers,
        totalOrders,
        totalContacts,
        pendingOrders: pendingOrders?.length || 0,
        newContacts: newContacts?.length || 0,
      },
      recent: {
        orders: recentOrders || [],
        contacts: recentContacts || [],
      },
    });
  } catch (err) {
    console.error('[Admin] dashboard error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;