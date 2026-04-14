/* ============================================================
   api.js – Fetch wrapper for SKAY backend
   ============================================================ */

const API_BASE = window.location.origin.replace(/:\d+/, ':5001') + '/api';

function getAuthHeaders() {
  // Admin token takes priority over customer token
  const adminToken    = localStorage.getItem('skay-admin-token');
  const customerToken = localStorage.getItem('skay-token');
  const token         = adminToken || customerToken;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const url    = `${API_BASE}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(url, config);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ── Products ──────────────────────────────────────────────
const products = {
  list:   (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/products${q ? '?' + q : ''}`);
  },
  get:    (id)       => request(`/products/${id}`),
  create: (data)     => request('/products',      { method: 'POST', body: data }),
  update: (id, data) => request(`/products/${id}`, { method: 'PUT',  body: data }),
  delete: (id)       => request(`/products/${id}`, { method: 'DELETE' }),
};

// ── Auth (Customer) ───────────────────────────────────────
const auth = {
  login:     (email, password) => request('/auth/customer/login',
    { method: 'POST', body: { email, password } }),
  register:  (name, email, password) => request('/auth/customer/register',
    { method: 'POST', body: { full_name: name, email, password } }),
  googleSync: (googleData) => request('/auth/customer/google-sync',
    { method: 'POST', body: googleData }),
  logout:    () => request('/auth/customer/logout', { method: 'POST' }),
  me:        () => request('/auth/me'),
};

// ── Admin Auth ────────────────────────────────────────────
const adminAuth = {
  login: (username, password) =>
    request('/auth/admin/login', { method: 'POST', body: { username, password } }),
};

// ── Orders ────────────────────────────────────────────────
const orders = {
  list:         ()           => request('/orders'),
  get:          (id)         => request(`/orders/${id}`),
  create:       (data)       => request('/orders',      { method: 'POST', body: data }),
  updateStatus: (id, status) => request(`/orders/${id}`, { method: 'PUT',  body: { status } }),
};

// ── Admin ─────────────────────────────────────────────────
const admin = {
  stats:       ()                    => request('/admin/stats'),
  users:       ()                    => request('/admin/users'),
  orders:      (params = {})         => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/orders${q ? '?' + q : ''}`);
  },
  customers:   (params = {})         => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/customers${q ? '?' + q : ''}`);
  },
  contacts:    (params = {})         => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/contacts${q ? '?' + q : ''}`);
  },
  /** Update inquiry status (new | pending | in-progress | completed | resolved) */
  updateContactStatus: (id, status, notes) =>
    request(`/admin/contact/${id}`, { method: 'PUT', body: { status, notes } }),

  /** Update order status */
  updateOrderStatus: (id, status) =>
    request(`/admin/order/${id}`, { method: 'PUT', body: { status } }),
};

// ── Services ──────────────────────────────────────────────
const services = {
  list:        () => request('/services'),
  submitQuote: (data) => request('/services/quote', { method: 'POST', body: data }),
};

// ── Contact (public form) ─────────────────────────────────
const contact = {
  send:         (data)         => request('/contact', { method: 'POST', body: data }),
  list:         ()             => request('/contact'),
  updateStatus: (id, status)   =>
    request(`/contact/${id}/status`, { method: 'PUT', body: { status } }),
};

window.API = { products, auth, adminAuth, orders, admin, services, contact, request };
