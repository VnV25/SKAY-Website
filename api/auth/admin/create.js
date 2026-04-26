const db = require('../../../lib/db');
const { requireAdmin } = require('../../../lib/auth');
const { supabaseAdmin } = require('../../../lib/supabase');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    await requireAdmin(req);

    const body = getBody(req);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const full_name = typeof body.full_name === 'string' ? body.full_name.trim() : '';

    if (!email) throw new HttpError(400, 'email is required');
    if (!password) throw new HttpError(400, 'password is required');
    if (!full_name || full_name.length < 2) throw new HttpError(400, 'full_name is required');

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError) throw new HttpError(400, authError.message, { code: authError.code, status: authError.status });
    if (!authData?.user?.id) throw new HttpError(500, 'Failed to create user');

    await db.createAdmin(authData.user.id, { email, full_name });

    return sendJson(res, 201, {
      admin: { id: authData.user.id, email: authData.user.email, full_name, role: 'admin' },
      message: 'Admin user created successfully',
    });
  } catch (err) {
    console.error('[Auth/Admin] create admin error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

