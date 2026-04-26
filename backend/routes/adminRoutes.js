const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

router.get('/dashboard', async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*');

    if (error) throw error;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'paid').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;

    const totalRevenue = orders.reduce(
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

    res.json({
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
    res.status(500).json({ message: 'Dashboard fetch failed' });
  }
});

router.get('/users', async (req, res) => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) return res.status(400).json({ message: error.message });
  res.json({ users: data });
});

router.get('/contacts', async (req, res) => {
  const { data, error } = await supabase.from('contacts').select('*');
  if (error) return res.status(400).json({ message: error.message });
  res.json({ contacts: data });
});

router.get('/orders', async (req, res) => {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) return res.status(400).json({ message: error.message });
  res.json({ orders: data });
});

router.put('/contacts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('contacts')
      .update(req.body)
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
});

module.exports = router;
