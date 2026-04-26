const db = require('../../../lib/db');
const { requireAdmin } = require('../../../lib/auth');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return methodNotAllowed(res, ['PUT']);

  try {
    await requireAdmin(req);

    const id = req?.query?.id;
    if (!id) throw new HttpError(400, 'Contact id is required');

    const body = getBody(req);
    const status = typeof body.status === 'string' ? body.status.trim() : '';
    if (!['new', 'pending', 'in-progress', 'completed', 'resolved'].includes(status)) {
      throw new HttpError(400, 'Invalid status');
    }

    const contact = await db.updateContact(id, { status });
    if (!contact) throw new HttpError(404, 'Contact not found');
    return sendJson(res, 200, contact);
  } catch (err) {
    console.error('[Contact] update status error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

