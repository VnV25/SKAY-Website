const db = require('./db');
const { supabaseAdmin } = require('./supabase');
const { HttpError } = require('./http');

function getBearerToken(req) {
  const authHeader = req?.headers?.authorization || '';
  if (!authHeader) return null;
  if (authHeader.toLowerCase().startsWith('bearer ')) return authHeader.slice(7).trim();
  return authHeader.trim();
}

async function getSupabaseUser(token) {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) throw new HttpError(401, 'Invalid token', { supabase: error.message });
  if (!data?.user) throw new HttpError(401, 'Invalid token');
  return data.user;
}

async function requireAuth(req) {
  const token = getBearerToken(req);
  if (!token) throw new HttpError(401, 'No token provided');

  const user = await getSupabaseUser(token);
  const profile = await db.getProfileById(user.id).catch(() => null);

  return {
    token,
    user,
    profile,
    userContext: {
      id: user.id,
      email: user.email,
      ...(profile || {}),
    },
  };
}

async function requireAdmin(req) {
  const ctx = await requireAuth(req);
  const isAdmin = await db.isAdmin(ctx.user.id);
  if (!isAdmin) throw new HttpError(403, 'Admin access required');

  return {
    ...ctx,
    adminContext: {
      id: ctx.user.id,
      email: ctx.user.email,
      ...(ctx.profile || {}),
    },
  };
}

module.exports = {
  getBearerToken,
  requireAuth,
  requireAdmin,
};

