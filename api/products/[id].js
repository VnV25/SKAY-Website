const db = require('../../lib/db');
const { requireAdmin } = require('../../lib/auth');
const { HttpError, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  try {
    const id = req?.query?.id;
    if (!id) throw new HttpError(400, 'Product id is required');

    if (req.method === 'GET') {
      const product = await db.getProductById(id);
      if (!product) throw new HttpError(404, 'Product not found');
      return sendJson(res, 200, { product });
    }

    if (req.method === 'PUT') {
      await requireAdmin(req);
      const product = await db.updateProduct(id, req.body || {});
      if (!product) throw new HttpError(404, 'Product not found');
      return sendJson(res, 200, { product });
    }

    if (req.method === 'DELETE') {
      await requireAdmin(req);
      await db.deleteProduct(id);
      return sendJson(res, 200, { message: 'Product deleted successfully' });
    }

    return methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
  } catch (err) {
    console.error('[Products] id error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

