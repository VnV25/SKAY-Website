const db = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');
const { getBody, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return methodNotAllowed(res, ['PUT']);

  try {
    const { userContext } = await requireAuth(req);
    const body = getBody(req);

    const updated = await db.updateProfile(userContext.id, {
      full_name: body.full_name || userContext.full_name,
      phone: body.phone || userContext.phone,
      company: body.company || userContext.company,
      avatar_url: body.avatar_url || userContext.avatar_url,
    });

    return sendJson(res, 200, { user: updated, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('[Auth] update profile error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

