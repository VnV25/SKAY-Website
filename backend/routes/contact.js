const express = require('express');
const db = require('../lib/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/contact ─────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'name, email and message are required' });
    }

    const fullMessage = phone ? `Phone: ${phone}\n${message}` : message;

    const contact = await db.createContact({
      name,
      email,
      message: fullMessage,
    });

    console.log(`[Contact] New ${type || 'contact'} from: ${name} <${email}>`);
    res.json({ 
      message: 'Message received. We will reply within 24 hours.', 
      id: contact.id 
    });
  } catch (err) {
    console.error('[Contact] error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/contact/quote (Quote form submission) ────────
router.post('/quote', async (req, res) => {
  try {
    const { name, email, phone, productType, quantity, description } = req.body;
    if (!name || !email || !productType) {
      return res.status(400).json({ message: 'name, email and productType are required' });
    }

    const messageLines = [
      `Product: ${productType}`,
      `Quantity: ${quantity || 'Not specified'}`,
      phone ? `Phone: ${phone}` : null,
      description ? `Details: ${description}` : null,
    ].filter(Boolean);

    const contact = await db.createContact({
      name,
      email,
      message: messageLines.join('\n'),
    });

    console.log(`[Quote] New quote request from: ${name} <${email}> for ${productType}`);
    res.json({ 
      message: 'Quote request received. We will respond within 24 hours.', 
      id: contact.id 
    });
  } catch (err) {
    console.error('[Contact/Quote] error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/contact (admin only) ─────────────────────────
router.get('/', requireAdmin, async (req, res) => {
  try {
    const contacts = await db.getAllContacts();
    res.json(contacts);
  } catch (err) {
    console.error('[Contact] get all error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT /api/contact/:id/status (admin only) ──────────────
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'in-progress', 'completed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const contact = await db.updateContact(req.params.id, { status });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    console.error('[Contact] update status error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
