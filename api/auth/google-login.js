const db = require('../../lib/db');
const { supabaseAuth } = require('../../lib/supabase');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const body = getBody(req);
    const token = typeof body.token === 'string' ? body.token.trim() : '';

    if (!token) throw new HttpError(400, 'Token missing');

    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data?.user?.id || !data?.user?.email) {
      throw new HttpError(401, 'Invalid Google session', { supabase: error?.message });
    }

    const user = data.user;
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email;

    const profile = await db.createProfile(user.id, {
      email: user.email.toLowerCase(),
      full_name: fullName,
      avatar_url: user.user_metadata?.avatar_url || null,
    });

    await db.incrementLoginCount(user.id).catch(() => null);

    return sendJson(res, 200, {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: profile?.full_name || fullName,
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url,
        provider: user.app_metadata?.provider || 'google',
      },
    });
  } catch (err) {
    console.error('[Auth] google login error:', err);
    return handleApiError(res, err, 'Google login failed');
  }
};
