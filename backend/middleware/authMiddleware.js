const jwt = require('jsonwebtoken');

/**
 * Express middleware that validates the backend-signed JWT.
 *
 * Flow:
 *   1. Frontend stores the JWT returned by /api/auth/google-login (or
 *      /api/auth/customer/login) as `skay-token` in localStorage.
 *   2. api.ts sends it as `Authorization: Bearer <token>` on every
 *      protected request (authMode: 'customer').
 *   3. This middleware verifies the signature with JWT_SECRET and
 *      attaches the decoded payload to req.user.
 *
 * Common mistake: sending the raw Supabase access_token instead of the
 * backend JWT.  That will fail here because Supabase tokens are signed
 * with Supabase's own key, not JWT_SECRET.
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization ?? '';

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing. Please log in.',
        code:    'NO_AUTH_HEADER',
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid Authorization format. Expected: Bearer <token>',
        code:    'BAD_AUTH_FORMAT',
      });
    }

    const token = parts[1];

    if (!process.env.JWT_SECRET) {
      console.error('[authMiddleware] JWT_SECRET is not set');
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration: JWT_SECRET missing',
        code:    'SERVER_CONFIG_ERROR',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Normalise: older tokens use `userId`, newer ones use `id`
    req.user = {
      ...decoded,
      id: decoded.userId ?? decoded.id,
    };

    next();
  } catch (err) {
    console.error('[authMiddleware] token error:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
        code:    'TOKEN_EXPIRED',
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        // Hint: if the user just did Google login, the Supabase token may
        // have been stored instead of the backend JWT.
        message: 'Invalid session token. Please log in again.',
        code:    'TOKEN_INVALID',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please log in again.',
      code:    'AUTH_FAILED',
    });
  }
};

module.exports = authMiddleware;
