class HttpError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function getBody(req) {
  const body = req?.body;
  if (body == null) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  sendJson(res, 405, { message: 'Method Not Allowed' });
}

function handleApiError(res, err, fallbackMessage = 'Server error') {
  if (err instanceof HttpError) {
    const payload = { message: err.message };
    if (err.details) payload.details = err.details;
    return sendJson(res, err.statusCode, payload);
  }

  console.error('[API] Unhandled error:', err);
  return sendJson(res, 500, { message: fallbackMessage });
}

module.exports = {
  HttpError,
  sendJson,
  getBody,
  methodNotAllowed,
  handleApiError,
};

