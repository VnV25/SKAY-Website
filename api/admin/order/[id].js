const { supabaseAdmin } = require('../../../lib/supabase');
const { requireAdmin } = require('../../../lib/auth');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return methodNotAllowed(res, ['PUT']);

  try {
    await requireAdmin(req);

    const id = req?.query?.id;
    if (!id) throw new HttpError(400, 'Order id is required');

    const body = getBody(req);
    const status = body.status;
    if (!status) throw new HttpError(400, 'Status is required');

    const updates = { status, updated_at: new Date().toISOString() };
    console.log(`[Admin] Updating order ${id} to status: ${status}`);

    const { data, error } = await supabaseAdmin.from('orders').update(updates).eq('id', id).select();
    if (error) throw new HttpError(400, 'Failed to update order', { supabase: error.message });
    if (!data || data.length === 0) throw new HttpError(404, 'Order not found');

    console.log(`[Admin] Updated order ${id} to ${status}`);
    return sendJson(res, 200, { success: true, order: data[0] });
  } catch (err) {
    console.error('[Admin] update order error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

