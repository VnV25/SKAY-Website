const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');
const db = require('../lib/db');

// ── Verify Supabase token ────────────────────────────────
async function verifySupabaseToken(token) {
  const { data, error } = await supabase.auth.getUser(token);
  if (error) throw error;
  return data.user;
}

// ── Auth middleware (require any valid token) ─────────────
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Try Supabase auth first
    try {
      const user = await verifySupabaseToken(token);
      const profile = await db.getProfileById(user.id);
      req.user = { id: user.id, email: user.email, ...profile };
      return next();
    } catch (supabaseError) {
      // Fall back to JWT for backward compatibility
      try {
        const secret = process.env.JWT_SECRET || 'skay-dev-secret';
        const payload = jwt.verify(token, secret);
        req.user = { id: payload.id || payload.userId, ...payload };
        return next();
      } catch (jwtError) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized: ' + err.message });
  }
}

// ── Admin-only middleware ─────────────────────────────────
async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Try Supabase auth first
    try {
      const user = await verifySupabaseToken(token);
      const isAdmin = await db.isAdmin(user.id);
      if (!isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      const profile = await db.getProfileById(user.id);
      req.admin = { id: user.id, email: user.email, ...profile };
      return next();
    } catch (supabaseError) {
      // Fall back to JWT for backward compatibility
      try {
        const secret = process.env.JWT_SECRET || 'skay-dev-secret';
        const payload = jwt.verify(token, secret);

        // Check if it's an admin token (has adminId or userId field with admin role)
        if ((!payload.adminId && !payload.role) || payload.role !== 'admin') {
          return res.status(403).json({ message: 'Admin access required' });
        }

        req.admin = { id: payload.id || payload.userId || payload.adminId, ...payload };
        return next();
      } catch (jwtError) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }
  } catch (err) {
    res.status(403).json({ message: 'Forbidden: ' + err.message });
  }
}

module.exports = { requireAuth, requireAdmin };
