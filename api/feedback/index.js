const { supabase } = require('../../lib/supabase');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const body = getBody(req);

    const name    = typeof body.name    === 'string' ? body.name.trim()    : '';
    const email   = typeof body.email   === 'string' ? body.email.trim().toLowerCase() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const rating  = Number(body.rating);

    if (!name)                              throw new HttpError(400, 'name is required');
    if (!email || !email.includes('@'))     throw new HttpError(400, 'valid email is required');
    if (!message)                           throw new HttpError(400, 'message is required');
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new HttpError(400, 'rating must be an integer between 1 and 5');
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert([{ name, email, rating, message }])
      .select()
      .single();

    if (error) {
      // Table might not exist yet — return a graceful error
      if (error.code === '42P01') {
        console.error('[Feedback] feedback table does not exist. Run create-feedback-table.sql in Supabase.');
        throw new HttpError(503, 'Feedback service is not configured yet. Please contact support.');
      }
      throw error;
    }

    console.log(`[Feedback] New feedback from: ${name} <${email}> — ${rating}★`);
    return sendJson(res, 200, { success: true, message: 'Thank you for your feedback!', id: data.id });
  } catch (err) {
    console.error('[Feedback] error:', err);
    return handleApiError(res, err, 'Failed to submit feedback');
  }
};
