const { supabaseAdmin } = require('../../lib/supabase');
const { requireAdmin } = require('../../lib/auth');
const { sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    await requireAdmin(req);

    console.log('\n🔍 [Admin Stats] Starting stats collection...');

    const { count: totalCustomers } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer');

    const { count: profilesWithLogins } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer')
      .gt('login_count', 0);

    const { count: totalProducts } = await supabaseAdmin.from('products').select('id', { count: 'exact', head: true });
    const { count: totalOrders } = await supabaseAdmin.from('orders').select('id', { count: 'exact', head: true });
    const { count: pendingOrders } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'new']);

    const { count: totalContacts } = await supabaseAdmin.from('contacts').select('id', { count: 'exact', head: true });
    const { count: newContacts } = await supabaseAdmin
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .in('status', ['new', 'pending']);

    const { data: allOrders } = await supabaseAdmin.from('orders').select('total');
    const totalRevenue = (allOrders || []).reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

    console.log('\n📋 [Admin Stats Final] Complete\n');

    return sendJson(res, 200, {
      totalUsers: totalCustomers || 0,
      customersWithLogins: profilesWithLogins || 0,
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      totalContacts: totalContacts || 0,
      newContacts: newContacts || 0,
      totalRevenue,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Admin] stats error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

