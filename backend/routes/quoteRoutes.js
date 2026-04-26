const express = require('express');
const { submitQuote } = require('../controllers/quoteController');

const router = express.Router();

// POST /api/services/quote
router.post('/quote', submitQuote);

module.exports = router;