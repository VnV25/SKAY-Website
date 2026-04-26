const { supabaseAdmin } = require('../../../lib/supabase');
const { requireAdmin } = require('../../../lib/auth');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../../lib/http');

module.exports = async function handler(req, res) {
  try {
    await requireAdmin(req);

    const id = req?.query?.id;
    if (!id) throw new HttpError(400, 'Asset id is required');

    if (req.method === 'DELETE') {
      const { data: asset, error: fetchError } = await supabaseAdmin
        .from('assets')
        .select('file_path')
        .eq('id', id)
        .single();

      if (fetchError || !asset) throw new HttpError(404, 'Asset not found');

      const { error: storageError } = await supabaseAdmin.storage.from('assets').remove([asset.file_path]);
      if (storageError) console.error('[Admin] delete from storage error:', storageError);

      const { error: deleteError } = await supabaseAdmin.from('assets').delete().eq('id', id);
      if (deleteError) throw new HttpError(400, 'Failed to delete asset', { supabase: deleteError.message });

      return sendJson(res, 200, { success: true, message: 'Asset deleted successfully' });
    }

    if (req.method === 'PUT') {
      const body = getBody(req);
      const updates = {};
      if (body.name) updates.name = body.name;
      if (body.category) updates.category = body.category;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin.from('assets').update(updates).eq('id', id).select();
      if (error) throw new HttpError(400, 'Failed to update asset', { supabase: error.message });
      if (!data || data.length === 0) throw new HttpError(404, 'Asset not found');

      return sendJson(res, 200, { success: true, asset: data[0] });
    }

    return methodNotAllowed(res, ['PUT', 'DELETE']);
  } catch (err) {
    console.error('[Admin] asset id error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

