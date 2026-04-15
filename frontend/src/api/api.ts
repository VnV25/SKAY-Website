/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

type AuthMode = 'admin' | 'customer' | 'auto' | 'none';

function readStorageValue(key: string) {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
}

function getTokenForMode(endpoint: string, authMode: AuthMode) {
  if (authMode === 'none') return null;
  if (authMode === 'admin') return readStorageValue('adminToken');
  if (authMode === 'customer') return readStorageValue('customerToken');
  if (endpoint.startsWith('/admin')) return readStorageValue('adminToken');
  return readStorageValue('customerToken');
}

function getAuthHeaders(endpoint: string, authMode: AuthMode) {
  const token = getTokenForMode(endpoint, authMode);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint: string, options: RequestInit & { authMode?: AuthMode } = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const authMode = options.authMode || 'auto';
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(endpoint, authMode),
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, { ...options, headers, credentials: 'include' });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const errorMessage = errorBody?.message || response.statusText;
      throw new Error(errorMessage);
    }

    // 204 NO CONTENT
    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    // Re-throw with more context
    if (error instanceof TypeError) {
      // Network error
      throw new Error(`Network error: Cannot reach ${url}. Is the backend server running on ${API_BASE_URL}?`);
    }
    throw error;
  }
}

export const api = {
  products: {
    list: async () => request('/products'),
    get: async (id: string) => request(`/products/${id}`),
    create: async (payload: object) => request('/products', { method: 'POST', body: JSON.stringify(payload) }),
    update: async (id: string, payload: object) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    delete: async (id: string) => request(`/products/${id}`, { method: 'DELETE' }),
  },
  services: {
    list: async () => request('/services'),
    submitQuote: async (payload: object) => request('/services/quote', { method: 'POST', body: JSON.stringify(payload) }),
  },
  contact: {
    submit: async (payload: object) => request('/contact', { method: 'POST', body: JSON.stringify(payload) }),
    list: async () => request('/contact'),
    updateStatus: async (id: string, status: string) => request(`/contact/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },
  auth: {
    register: async (payload: object) => request('/auth/customer/register', { method: 'POST', body: JSON.stringify(payload), authMode: 'none' }),
    login: async (payload: object) => request('/auth/customer/login', { method: 'POST', body: JSON.stringify(payload), authMode: 'none' }),
    logout: async () => request('/auth/customer/logout', { method: 'POST', authMode: 'customer' }),
    profile: async () => request('/auth/me', { authMode: 'customer' }),
    updateProfile: async (payload: object) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload), authMode: 'customer' }),
    adminLogin: async (payload: object) => request('/auth/admin/login', { method: 'POST', body: JSON.stringify(payload), authMode: 'none' }),
  },
  orders: {
    create: async (payload: object) => request('/orders', { method: 'POST', body: JSON.stringify(payload), authMode: 'customer' }),
    list: async () => request('/orders', { authMode: 'customer' }),
    get: async (id: string) => request(`/orders/${id}`, { authMode: 'customer' }),
    update: async (id: string, payload: object) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(payload), authMode: 'admin' }),
  },
  admin: {
    stats: async () => request('/admin/stats', { authMode: 'admin' }),
    users: async () => request('/admin/users', { authMode: 'admin' }),
    orders: async () => request('/admin/orders', { authMode: 'admin' }),
    contacts: async (params?: string) => request(`/admin/contacts${params ? `?${params}` : ''}`, { authMode: 'admin' }),
    updateContact: async (id: string, payload: object) => request(`/admin/contact/${id}`, { method: 'PUT', body: JSON.stringify(payload), authMode: 'admin' }),
    dashboard: async () => request('/admin/dashboard', { authMode: 'admin' }),
  },
};
