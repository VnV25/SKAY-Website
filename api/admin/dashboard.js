const { supabaseAdmin } = require('../../lib/supabase');
const { requireAdmin } = require('../../lib/auth');
const { sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    await requireAdmin(req);

    const { count: totalUsers } = await supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true });
    const { count: totalOrders } = await supabaseAdmin.from('orders').select('id', { count: 'exact', head: true });
    const { count: totalContacts } = await supabaseAdmin.from('contacts').select('id', { count: 'exact', head: true });

    const { data: recentOrders } = await supabaseAdmin.from('orders').select('*').order('order_date', { ascending: false }).limit(5);
    const { data: recentContacts } = await supabaseAdmin.from('contacts').select('*').order('created_at', { ascending: false }).limit(5);

    const { data: pendingOrders } = await supabaseAdmin.from('orders').select('id').eq('status', 'pending');
    const { data: newContacts } = await supabaseAdmin.from('contacts').select('id').eq('status', 'new');

    return sendJson(res, 200, {
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
    console.error('[Admin] dashboard error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

