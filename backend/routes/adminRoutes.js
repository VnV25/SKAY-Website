const express = require('express');
const { supabase, isSupabaseConfigured } = require('../lib/supabase');

const router = express.Router();

router.use((req, res, next) => {
  if (!isSupabaseConfigured) {
    return res.status(500).json({ message: 'Supabase environment variables are missing on the server' });
  }
  return next();
});

router.get('/dashboard', async (req, res) => {
  try {
    const { data: orders, error } = await supabase.from('orders').select('*');

    if (error) throw error;

    const safeOrders = Array.isArray(orders) ? orders : [];
    const totalOrders = safeOrders.length;
    const pendingOrders = safeOrders.filter((o) => o.status === 'pending').length;
    const completedOrders = safeOrders.filter((o) => o.status === 'completed' || o.status === 'paid').length;
    const cancelledOrders = safeOrders.filter((o) => o.status === 'cancelled').length;
    const totalRevenue = safeOrders.reduce(
      (sum, o) => sum + Number(o.total_amount || o.total || o.amount || 0),
      0
    );

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: totalContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    return res.json({
      success: true,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      totalContacts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Dashboard fetch failed' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) return res.status(400).json({ message: error.message });
    return res.json({ success: true, users: data || [] });
  } catch (error) {
    console.error('Admin users fetch failed:', error);
    return res.status(500).json({ message: 'Failed to load users' });
  }
});

router.get('/contacts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ message: error.message });
    return res.json({ success: true, contacts: data || [] });
  } catch (error) {
    console.error('Admin contacts fetch failed:', error);
    return res.status(500).json({ message: 'Failed to load contacts' });
  }
});

router.put('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (typeof req.body.status === 'string' && req.body.status.trim()) {
      updates.status = req.body.status.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid contact updates provided' });
    }

    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });
    return res.json({ success: true, contact: data });
  } catch (error) {
    console.error('Contact update failed:', error);
    return res.status(500).json({ message: 'Failed to update contact' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ message: error.message });
    return res.json({ success: true, orders: data || [] });
  } catch (error) {
    console.error('Admin orders fetch failed:', error);
    return res.status(500).json({ message: 'Failed to load orders' });
  }
});

router.get('/feedback', async (req, res) => {
  try {
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ message: error.message });
    return res.json({ success: true, feedback: data || [] });
  } catch (error) {
    console.error('Admin feedback fetch failed:', error);
    return res.status(500).json({ message: 'Failed to load feedback' });
  }
});

module.exports = router;
