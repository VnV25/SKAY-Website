const db = require('../../../lib/db');
const { supabaseAuth } = require('../../../lib/supabase');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../../lib/http');

function redactAuthBody(body) {
  if (!body || typeof body !== 'object') return body;
  const redacted = { ...body };
  if (redacted.password) redacted.password = '[redacted]';
  return redacted;
}

function isStrongPassword(value) {
  return (
    typeof value === 'string' &&
    value.length >= 8 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

function getStrongPasswordMessage() {
  return 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol.';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const body = getBody(req);
    console.log('[Auth] customer register body:', redactAuthBody(body));

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const full_name = typeof body.full_name === 'string' ? body.full_name.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const finalName = full_name || name;

    if (!email) throw new HttpError(400, 'Valid email required');
    if (!password) throw new HttpError(400, 'Password required');
    if (!isStrongPassword(password)) throw new HttpError(400, getStrongPasswordMessage(), { code: 'weak_password' });
    if (!finalName) throw new HttpError(400, 'Name is required');

    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: { data: { full_name: finalName } },
    });

    if (authError) {
      console.error('[Auth] customer register Supabase signUp error:', authError);
      const statusCode = authError.status || 400;
      return sendJson(res, statusCode, {
        message: authError.code === 'weak_password' ? getStrongPasswordMessage() : authError.message || 'Account creation failed',
        code: authError.code,
        status: authError.status,
      });
    }

    if (!authData?.user?.id) {
      console.error('[Auth] customer register missing authData.user after signUp:', authData);
      throw new HttpError(500, 'Account creation failed. Please try again.');
    }

    await db.createProfile(authData.user.id, { email, full_name: finalName });
    console.log('[Auth] Profile upserted for user:', authData.user.id);

    const { data: loginData, error: loginError } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (loginError) {
      console.warn('[Auth] customer register sign-in error:', loginError.message);
      return sendJson(res, 201, {
        user: { id: authData.user.id, email: authData.user.email, full_name: finalName },
        token: null,
        message: 'Account created. Please login to proceed.',
      });
    }

    return sendJson(res, 201, {
      user: { id: authData.user.id, email: authData.user.email, full_name: finalName },
      token: loginData?.session?.access_token || null,
      message: 'Account created successfully. You can now log in.',
    });
  } catch (err) {
    console.error('[Auth] customer register error:', err);
    return handleApiError(res, err, 'Registration failed');
  }
};

