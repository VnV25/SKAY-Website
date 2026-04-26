const { supabaseAuth } = require('../../lib/supabase');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const body = getBody(req);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    console.log('[Auth/AdminLogin] request:', { email: email || null });

    if (!email || !password) throw new HttpError(400, 'email and password are required');

    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

    if (error) {
      console.log('[Auth/AdminLogin] Supabase signInWithPassword error:', {
        message: error.message,
        status: error.status,
        code: error.code,
      });
      return sendJson(res, 401, { message: 'Invalid email or password' });
    }

    if (!data?.user || !data?.session) {
      console.log('[Auth/AdminLogin] Missing user/session in response:', {
        hasUser: Boolean(data?.user),
        hasSession: Boolean(data?.session),
      });
      return sendJson(res, 500, { message: 'Authentication error' });
    }

    return sendJson(res, 200, { user: data.user, session: data.session });
  } catch (err) {
    return handleApiError(res, err, 'Login failed');
  }
};

