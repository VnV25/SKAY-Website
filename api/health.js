const { supabaseAdmin } = require('../lib/supabase');
const { sendJson, handleApiError, methodNotAllowed } = require('../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    const envOk = Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_ANON_KEY,
    );

    let dbStatus = 'unknown';
    try {
      const { error } = await supabaseAdmin.from('profiles').select('id', { head: true, count: 'exact' }).limit(1);
      dbStatus = error ? 'error' : 'connected';
    } catch (err) {
      dbStatus = 'error';
      console.error('[Health] DB check threw:', err);
    }

    return sendJson(res, 200, {
      status: 'OK',
      envOk,
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return handleApiError(res, err, 'Health check failed');
  }
};

