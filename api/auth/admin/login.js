const db = require('../../../lib/db');
const { supabaseAuth } = require('../../../lib/supabase');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../../lib/http');

function redactAuthBody(body) {
  if (!body || typeof body !== 'object') return body;
  const redacted = { ...body };
  if (redacted.password) redacted.password = '[redacted]';
  return redacted;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const body = getBody(req);
    console.log('[Auth/Admin] login body:', redactAuthBody(body));

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('[Auth/Admin] Supabase auth config missing:', {
        SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
        SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
      });
      throw new HttpError(500, 'Server configuration error');
    }

    let email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (username === 'admin' || email === 'admin') {
      email = 'admin@skay.in';
    } else if (!email && username) {
      email = username.toLowerCase();
    }

    if (!email) throw new HttpError(400, 'Email or username is required');
    if (!password) throw new HttpError(400, 'Password is required');

    console.log(`[Auth/Admin] Attempting login for: ${email}`);

    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (error) {
      console.warn(`[Auth/Admin] Login failed for ${email}: ${error.message}`);
      return sendJson(res, 401, { message: 'Invalid username or password' });
    }

    if (!data?.user) {
      console.error('[Auth/Admin] Login succeeded but no user data returned');
      throw new HttpError(500, 'Authentication error');
    }

    if (!data?.session?.access_token) {
      console.error('[Auth/Admin] Login succeeded but no session/token returned');
      return sendJson(res, 401, { message: 'Invalid username or password' });
    }

    let admin;
    try {
      admin = await db.getAdminById(data.user.id);
    } catch (dbError) {
      console.error('[Auth/Admin] Database error checking admin status:', dbError);
      return sendJson(res, 401, { message: 'Authentication failed' });
    }
    if (!admin) {
      console.warn(`[Auth/Admin] Access denied for ${email} - User is not an admin.`);
      return sendJson(res, 401, { message: 'Admin not found' });
    }

    try {
      await db.incrementLoginCount(data.user.id);
    } catch (dbError) {
      console.error('[Auth/Admin] Error incrementing login count:', dbError);
    }

    let profile;
    try {
      profile = await db.getProfileById(data.user.id);
    } catch (dbError) {
      console.error('[Auth/Admin] Database error fetching profile:', dbError);
      return sendJson(res, 401, { message: 'Authentication failed' });
    }
    if (!profile) {
      console.warn(`[Auth/Admin] Admin profile not found for ${email} (${data.user.id})`);
      return sendJson(res, 401, { message: 'Invalid username or password' });
    }

    return sendJson(res, 200, {
      token: data.session.access_token,
      admin: {
        id: data.user.id,
        email: data.user.email,
        ...profile,
      },
      message: 'Admin login successful',
    });
  } catch (err) {
    return handleApiError(res, err, 'Login failed');
  }
};

