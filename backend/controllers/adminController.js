const supabase = require('../config/supabaseClient');

// ================= STATS =================
const getAdminStats = async (req, res) => {
  try {
    // USERS
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const totalUsers = usersData?.users?.length || 0;

    // CONTACTS (INQUIRIES)
    const { data: contacts } = await supabase
      .from('contacts')
      .select('*');

    const totalContacts = contacts?.length || 0;

    // ORDERS
    const { data: orders } = await supabase
      .from('orders')
      .select('*');

    const totalOrders = orders?.length || 0;

    // ✅ PENDING ORDERS
    const pendingOrders =
      orders?.filter(o => o.status === 'pending').length || 0;

    // ✅ LOGGED IN USERS (if column exists)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*');

    const customersWithLogins =
      profiles?.filter(p => p.login_count > 0).length || 0;

    res.json({
      totalUsers,
      totalContacts,
      totalOrders,
      pendingOrders,
      customersWithLogins,
      totalProducts: 0, // update later if needed
    });

  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Stats error' });
  }
};

// ================= USERS =================
const getAdminUsers = async (req, res) => {
  try {
    const { data } = await supabase.auth.admin.listUsers();
    res.json({ users: data?.users || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Users error' });
  }
};

// ================= CONTACTS =================
const getAdminContacts = async (req, res) => {
  try {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    res.json({ contacts: data || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Contacts error' });
  }
};

// ================= UPDATE CONTACT =================
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
};

// ================= ORDERS =================
const getAdminOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ orders: data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// ✅ EXPORT EVERYTHING
module.exports = {
  getAdminStats,
  getAdminUsers,
  getAdminContacts,
  updateContactStatus,
  getAdminOrders,
};