const { supabaseAdmin } = require('../../lib/supabase');
const { requireAdmin } = require('../../lib/auth');
const { sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    await requireAdmin(req);

    const { page = 1, limit = 50 } = req.query || {};
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 50;
    const offset = (pageNumber - 1) * limitNumber;

    const { data: users, count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'customer')
      .range(offset, offset + limitNumber - 1)
      .order('created_at', { ascending: false });

    return sendJson(res, 200, {
      users: users || [],
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: count,
        pages: Math.ceil((count || 0) / limitNumber),
      },
    });
  } catch (err) {
    console.error('[Admin] get users error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

