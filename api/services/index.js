const { sendJson, methodNotAllowed } = require('../../lib/http');

const services = [
  {
    id: 's1',
    name: 'Custom T-Shirts',
    slug: 't-shirts',
    description: 'Oversized & Normal fit with screen print, DTF, or sublimation. MOQ 10 pieces.',
    icon: '👕',
    minQty: 10,
  },
  {
    id: 's2',
    name: 'Custom Hoodies',
    slug: 'hoodies',
    description: 'Premium fleece hoodies with embroidery or DTF print. MOQ 20 pieces.',
    icon: '🧥',
    minQty: 20,
  },
  {
    id: 's3',
    name: 'Embroidered Caps',
    slug: 'caps',
    description: '6-panel structured caps with custom embroidery. MOQ 12 pieces.',
    icon: '🧢',
    minQty: 12,
  },
  {
    id: 's4',
    name: 'Custom Mugs',
    slug: 'mugs',
    description: 'Ceramic & Magic colour-changing mugs with sublimation print. MOQ 12 pieces.',
    icon: '☕',
    minQty: 12,
  },
  {
    id: 's5',
    name: 'Vinyl Stickers',
    slug: 'stickers',
    description: 'Waterproof vinyl stickers in any shape. MOQ 50 pieces.',
    icon: '🏷️',
    minQty: 50,
  },
  {
    id: 's6',
    name: 'Corporate Gifts',
    slug: 'corporate',
    description: 'Premium gift kits for companies — mugs, notebooks, pens, apparel.',
    icon: '🎁',
    minQty: 5,
  },
];

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  return sendJson(res, 200, { services });
};

