const { requireAuth } = require('../../lib/auth');
const { sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    const { userContext } = await requireAuth(req);
    return sendJson(res, 200, { user: userContext });
  } catch (err) {
    console.error('[Auth] get me error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

