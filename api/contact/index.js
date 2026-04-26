const db = require('../../lib/db');
const { requireAdmin } = require('../../lib/auth');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const body = getBody(req);
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
      const message = typeof body.message === 'string' ? body.message.trim() : '';
      const type = typeof body.type === 'string' ? body.type.trim() : '';

      if (!name || !email || !message) throw new HttpError(400, 'name, email and message are required');

      const fullMessage = phone ? `Phone: ${phone}\n${message}` : message;
      const contact = await db.createContact({ name, email, message: fullMessage });

      console.log(`[Contact] New ${type || 'contact'} from: ${name} <${email}>`);
      return sendJson(res, 200, { message: 'Message received. We will reply within 24 hours.', id: contact.id });
    }

    if (req.method === 'GET') {
      await requireAdmin(req);
      const contacts = await db.getAllContacts();
      return sendJson(res, 200, { contacts });
    }

    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (err) {
    console.error('[Contact] error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

