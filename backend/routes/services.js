const express = require('express');
const db      = require('../lib/db');
const router  = express.Router();

const services = [
  { id: 's1', name: 'Custom T-Shirts', slug: 't-shirts', description: 'Oversized & Normal fit with screen print, DTF, or sublimation. MOQ 10 pieces.', icon: '👕', minQty: 10 },
  { id: 's2', name: 'Custom Hoodies',  slug: 'hoodies',  description: 'Premium fleece hoodies with embroidery or DTF print. MOQ 20 pieces.', icon: '🧥', minQty: 20 },
  { id: 's3', name: 'Embroidered Caps', slug: 'caps',    description: '6-panel structured caps with custom embroidery. MOQ 12 pieces.', icon: '🧢', minQty: 12 },
  { id: 's4', name: 'Custom Mugs',     slug: 'mugs',     description: 'Ceramic & Magic colour-changing mugs with sublimation print. MOQ 12 pieces.', icon: '☕', minQty: 12 },
  { id: 's5', name: 'Vinyl Stickers',  slug: 'stickers', description: 'Waterproof vinyl stickers in any shape. MOQ 50 pieces.', icon: '🏷', minQty: 50 },
  { id: 's6', name: 'Corporate Gifts', slug: 'corporate', description: 'Premium gift kits for companies — mugs, notebooks, pens, apparel.', icon: '🎁', minQty: 5 },
];

// ── GET /api/services ─────────────────────────────────────
router.get('/', (req, res) => {
  res.json({ services });
});

// ── POST /api/services/quote ──────────────────────────────
router.post('/quote', async (req, res) => {
  try {
    const { name, email, phone, productType, quantity, description } = req.body;
    
    // Validate required fields
    if (!name || !email || !productType) {
      console.warn('[Quote] Missing required fields:', { name: !!name, email: !!email, productType: !!productType });
      return res.status(400).json({ message: 'name, email and productType are required' });
    }

    // Create message with all available info
    const messageLines = [
      `Product: ${productType}`,
      `Quantity: ${quantity || 'Not specified'}`,
      phone ? `Phone: ${phone}` : null,
      description ? `Details: ${description}` : null,
    ].filter(Boolean);

    // Create contact record via Supabase
    const contact = await db.createContact({
      name,
      email,
      message: messageLines.join('\n'),
    });

    console.log(`[Quote] New quote from: ${name} <${email}> | Product: ${productType} | Qty: ${quantity}`);
    
    res.status(201).json({ 
      message: 'Quote request received. We will contact you within 24 hours.',
      ref: `SKAY-Q-${contact.id.substring(0, 8).toUpperCase()}`,
      id: contact.id 
    });
  } catch (err) {
    console.error('[Quote] Error saving quote to Supabase:', err.message);
    res.status(500).json({ message: 'Failed to submit quote request. Please try again later.' });
  }
});

module.exports = router;
