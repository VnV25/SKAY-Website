const { supabaseAdmin } = require('../../../lib/supabase');
const { requireAdmin } = require('../../../lib/auth');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../../lib/http');

const CONTACT_STATUSES = ['new', 'pending', 'in-progress', 'completed'];

function normalizeStatus(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return methodNotAllowed(res, ['PUT']);

  try {
    await requireAdmin(req);

    const id = req?.query?.id;
    if (!id) throw new HttpError(400, 'Contact id is required');

    const body = getBody(req);
    const normalizedStatus = normalizeStatus(body.status);
    const notes = body.notes;

    const updates = {};
    if (body.status !== undefined) {
      if (!CONTACT_STATUSES.includes(normalizedStatus)) {
        throw new HttpError(400, `Status must be one of: ${CONTACT_STATUSES.join(', ')}`);
      }
      updates.status = normalizedStatus;
    }
    if (notes !== undefined) updates.notes = notes;
    if (Object.keys(updates).length > 0) updates.updated_at = new Date().toISOString();

    console.log(`[Admin] Updating contact ${id} with:`, updates);

    const { data, error } = await supabaseAdmin.from('contacts').update(updates).eq('id', id).select();
    if (error) throw new HttpError(400, 'Failed to update contact', { supabase: error.message });
    if (!data || data.length === 0) throw new HttpError(404, 'Contact not found');

    console.log(`[Admin] Updated contact ${id}`);
    return sendJson(res, 200, { success: true, contact: data[0] });
  } catch (err) {
    console.error('[Admin] update contact error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

