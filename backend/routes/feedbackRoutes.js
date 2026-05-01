const express = require('express');
const { supabase, isSupabaseConfigured } = require('../lib/supabase');

const router = express.Router();

function buildErrorResponse(res, status, message, error = null) {
  const payload = {
    success: false,
    message: message || 'An error occurred',
  };
  if (error) {
    payload.error = typeof error === 'string' ? { message: error } : error;
  }
  return res.status(status).json(payload);
}

router.post('/feedback', async (req, res) => {
  if (!isSupabaseConfigured || !supabase) {
    console.error('[Feedback] Supabase client not available');
    return buildErrorResponse(res, 500, 'Supabase is not configured', {
      code: 'SUPABASE_NOT_CONFIGURED',
    });
  }

  if (!req.body || typeof req.body !== 'object') {
    return buildErrorResponse(res, 400, 'Invalid request body');
  }

  const { name, email, rating, message } = req.body;
  const trimmedName = String(name || '').trim();
  const trimmedEmail = String(email || '').trim().toLowerCase();
  const trimmedMessage = String(message || '').trim();
  const normalizedRating = Number(rating);

  if (!trimmedName) {
    return buildErrorResponse(res, 400, 'Name is required');
  }

  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return buildErrorResponse(res, 400, 'Valid email is required');
  }

  if (!trimmedMessage) {
    return buildErrorResponse(res, 400, 'Message is required');
  }

  if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
    return buildErrorResponse(res, 400, 'Rating must be an integer between 1 and 5');
  }

  const payload = {
    name: trimmedName,
    email: trimmedEmail,
    rating: normalizedRating,
    message: trimmedMessage,
  };

  try {
    const { data, error } = await supabase.from('feedback').insert([payload]).select();
    console.log('[Feedback] Supabase insert result', { data, error });

    if (error) {
      console.error('[Feedback] Insert error', error);
      if (error.code === 'PGRST301' || String(error.message).toLowerCase().includes('permission denied')) {
        return buildErrorResponse(res, 403, error.message || 'Permission denied for feedback insert', {
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }

      return buildErrorResponse(res, 500, error.message || 'Supabase insert failed', {
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: Array.isArray(data) ? data[0] : data,
    });
  } catch (err) {
    console.error('[Feedback] Route error', err);
    return buildErrorResponse(res, 500, err.message || 'Unexpected server error', {
      name: err.name,
      message: err.message,
    });
  }
});

module.exports = router;