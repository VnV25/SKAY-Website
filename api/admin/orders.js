const { supabaseAdmin } = require('../../lib/supabase');
const { requireAdmin } = require('../../lib/auth');
const { sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    await requireAdmin(req);

    const { page = 1, limit = 50, status } = req.query || {};
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 50;
    const offset = (pageNumber - 1) * limitNumber;

    let query = supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' })
      .range(offset, offset + limitNumber - 1)
      .order('order_date', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: orders, count, error } = await query;
    if (error) throw error;

    return sendJson(res, 200, {
      orders: orders || [],
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: count,
        pages: Math.ceil((count || 0) / limitNumber),
      },
    });
  } catch (err) {
    console.error('[Admin] get orders error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

