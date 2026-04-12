/* ============================================================
   api.js – Fetch wrapper for SKAY backend
   ============================================================ */

const API_BASE = window.location.origin.replace(/:\d+/, ':5001') + '/api';

function getAuthHeaders() {
  // Check for admin token first, then customer token
  const adminToken = localStorage.getItem('skay-admin-token');
  const customerToken = localStorage.getItem('skay-token');
  const token = adminToken || customerToken;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
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
  console.log('API Request:', { url, method: config.method || 'GET', hasBody: !!config.body });
  console.log('API Response:', { status: res.status, statusText: res.statusText, ok: res.ok });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    console.log('API Error:', err);
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  
  const result = await res.json();
  console.log('API Success:', result);
  return result;
}

// ── Products ──────────────────────────────────────────────
const products = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/products${q ? '?' + q : ''}`);
  },
  get: (id) => request(`/products/${id}`),
  create: (data) => request('/products', { method: 'POST', body: data }),
  update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};

// ── Auth (Customer) ───────────────────────────────────────
const auth = {
  login: (email, password) => request('/auth/customer/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) => request('/auth/customer/register', { method: 'POST', body: { full_name: name, email, password } }),
  googleSync: (googleData) => request('/auth/customer/google-sync', { method: 'POST', body: googleData }),
  logout: () => request('/auth/logout', { method: 'POST' }),
};

// ── Admin Auth ────────────────────────────────────────────
const adminAuth = {
  login: (username, password) => request('/auth/admin/login', { method: 'POST', body: { username, password } }),
};

// ── Orders ────────────────────────────────────────────────
const orders = {
  list: () => request('/orders'),
  get: (id) => request(`/orders/${id}`),
  create: (data) => request('/orders', { method: 'POST', body: data }),
  updateStatus: (id, status) => request(`/orders/${id}`, { method: 'PUT', body: { status } }),
};

// ── Admin ─────────────────────────────────────────────────
const admin = {
  stats: () => request('/admin/stats'),
  users: () => request('/admin/users'),
  orders: () => request('/admin/orders'),
  customers: () => request('/admin/customers'),
  getCustomer: (id) => request(`/admin/customers/${id}`),
};

// ── Services ──────────────────────────────────────────────
const services = {
  list: () => request('/services'),
  submitQuote: (data) => request('/services/quote', { method: 'POST', body: data }),
};

// ── Contact ───────────────────────────────────────────────
const contact = {
  send: (data) => request('/contact', { method: 'POST', body: data }),
  list: () => request('/contact'),
  updateStatus: (id, status) => request(`/contact/${id}/status`, { method: 'PUT', body: { status } }),
};

window.API = { products, auth, adminAuth, orders, admin, services, contact, request };
