const { supabaseAdmin } = require('../../../lib/supabase');
const { requireAdmin } = require('../../../lib/auth');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../../lib/http');

module.exports = async function handler(req, res) {
  try {
    const { userContext } = await requireAdmin(req);

    if (req.method === 'GET') {
      const { type, category, page = 1, limit = 50 } = req.query || {};
      const pageNumber = parseInt(page, 10) || 1;
      const limitNumber = parseInt(limit, 10) || 50;
      const offset = (pageNumber - 1) * limitNumber;

      let query = supabaseAdmin
        .from('assets')
        .select('*', { count: 'exact' })
        .range(offset, offset + limitNumber - 1)
        .order('created_at', { ascending: false });

      if (type) query = query.eq('type', type);
      if (category) query = query.eq('category', category);

      const { data: assets, count, error } = await query;
      if (error) throw new HttpError(400, 'Failed to fetch assets', { supabase: error.message });

      return sendJson(res, 200, {
        assets: assets || [],
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total: count || 0,
          pages: Math.ceil((count || 0) / limitNumber),
        },
      });
    }

    if (req.method === 'POST') {
      const body = getBody(req);
      const { name, type, category, file_url, file_path, file_size, mime_type } = body;

      if (!name || !type || !file_url || !file_path) {
        throw new HttpError(400, 'Missing required fields: name, type, file_url, file_path');
      }

      const { data, error } = await supabaseAdmin
        .from('assets')
        .insert([
          {
            name,
            type,
            category: category || null,
            file_url,
            file_path,
            file_size: file_size || null,
            mime_type: mime_type || null,
            uploaded_by: userContext.id,
          },
        ])
        .select();

      if (error) throw new HttpError(400, 'Failed to create asset', { supabase: error.message });
      return sendJson(res, 200, { success: true, asset: data[0] });
    }

    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (err) {
    console.error('[Admin] assets error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

