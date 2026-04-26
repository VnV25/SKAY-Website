const db = require('../../lib/db');
const { requireAdmin } = require('../../lib/auth');
const { sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { category, featured, trending, search, page = 1, limit = 50 } = req.query || {};
      const pageNumber = parseInt(page, 10) || 1;
      const limitNumber = parseInt(limit, 10) || 50;
      const offset = (pageNumber - 1) * limitNumber;

      const { products, total } = await db.getAllProducts({
        category,
        featured: featured === 'true',
        trending: trending === 'true',
        search,
        limit: limitNumber,
        offset,
      });

      return sendJson(res, 200, {
        products,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil((total || 0) / limitNumber),
          totalProducts: total,
          hasNext: pageNumber * limitNumber < (total || 0),
          hasPrev: pageNumber > 1,
        },
      });
    }

    if (req.method === 'POST') {
      await requireAdmin(req);
      const product = await db.createProduct(req.body || {});
      return sendJson(res, 201, { product });
    }

    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (err) {
    console.error('[Products] error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

