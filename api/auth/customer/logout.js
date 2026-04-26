const { requireAuth } = require('../../../lib/auth');
const { sendJson, methodNotAllowed, handleApiError } = require('../../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    // Stateless on the server: client should discard its token.
    await requireAuth(req);
    return sendJson(res, 200, { message: 'Logout successful' });
  } catch (err) {
    console.error('[Auth] logout error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

