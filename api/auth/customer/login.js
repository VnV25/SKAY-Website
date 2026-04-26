const db = require('../../../lib/db');
const { supabaseAuth } = require('../../../lib/supabase');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const body = getBody(req);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email) throw new HttpError(400, 'Valid email required');
    if (!password) throw new HttpError(400, 'Password required');

    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (error) return sendJson(res, 401, { message: 'Invalid email or password' });

    await db.incrementLoginCount(data.user.id).catch((err) => console.error('[Auth] incrementLoginCount error:', err));

    let profile = await db.getProfileById(data.user.id);
    if (!profile) {
      profile = await db.createProfile(data.user.id, {
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email,
      });
    }

    return sendJson(res, 200, {
      token: data.session.access_token,
      user: { id: data.user.id, email: data.user.email, ...profile },
      message: 'Login successful',
    });
  } catch (err) {
    console.error('[Auth] customer login error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

