const db = require('../../lib/db');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const body = getBody(req);
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const productType = typeof body.productType === 'string' ? body.productType.trim() : '';
    const quantity = body.quantity;
    const description = typeof body.description === 'string' ? body.description.trim() : '';

    if (!name || !email || !productType) throw new HttpError(400, 'name, email and productType are required');

    const messageLines = [
      `Product: ${productType}`,
      `Quantity: ${quantity || 'Not specified'}`,
      phone ? `Phone: ${phone}` : null,
      description ? `Details: ${description}` : null,
    ].filter(Boolean);

    const contact = await db.createContact({ name, email, message: messageLines.join('\n') });

    console.log(`[Quote] New quote request from: ${name} <${email}> for ${productType}`);
    return sendJson(res, 200, { message: 'Quote request received. We will respond within 24 hours.', id: contact.id });
  } catch (err) {
    console.error('[Contact/Quote] error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

