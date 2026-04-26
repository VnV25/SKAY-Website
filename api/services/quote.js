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

    console.log(`[Quote] New quote from: ${name} <${email}> | Product: ${productType} | Qty: ${quantity}`);

    return sendJson(res, 201, {
      message: 'Quote request received. We will contact you within 24 hours.',
      ref: `SKAY-Q-${String(contact.id).substring(0, 8).toUpperCase()}`,
      id: contact.id,
    });
  } catch (err) {
    console.error('[Quote] error:', err);
    return handleApiError(res, err, 'Failed to submit quote request. Please try again later.');
  }
};

