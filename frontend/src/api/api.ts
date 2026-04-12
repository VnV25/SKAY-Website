/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
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
    register: async (payload: object) => request('/auth/customer/register', { method: 'POST', body: JSON.stringify(payload) }),
    login: async (payload: object) => request('/auth/customer/login', { method: 'POST', body: JSON.stringify(payload) }),
    logout: async () => request('/auth/customer/logout', { method: 'POST' }),
    profile: async () => request('/auth/me'),
    updateProfile: async (payload: object) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
    adminLogin: async (payload: object) => request('/auth/admin/login', { method: 'POST', body: JSON.stringify(payload) }),
  },
  orders: {
    create: async (payload: object) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
    list: async () => request('/orders'),
    get: async (id: string) => request(`/orders/${id}`),
    update: async (id: string, payload: object) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  },
  admin: {
    stats: async () => request('/admin/stats'),
    users: async () => request('/admin/users'),
    orders: async () => request('/admin/orders'),
    contacts: async (params?: string) => request(`/admin/contacts${params ? `?${params}` : ''}`),
    updateContact: async (id: string, payload: object) => request(`/admin/contact/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    dashboard: async () => request('/admin/dashboard'),
  },
};
