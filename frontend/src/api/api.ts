/// <reference types="vite/client" />

const API_BASE_URL = '/api';

type AuthMode = 'admin' | 'customer' | 'none';

// ================= TOKEN =================
function getToken(mode: AuthMode): string | null {
  if (typeof window === 'undefined') return null;

  if (mode === 'admin') return localStorage.getItem('skay-admin-token');
  if (mode === 'customer') return localStorage.getItem('skay-token');

  return null;
}

// ================= HEADERS =================
function getAuthHeaders(mode: AuthMode): Record<string, string> {
  const token = getToken(mode);

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

// ================= REQUEST =================
async function request(
  endpoint: string,
  options: RequestInit & { authMode?: AuthMode } = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  const mode: AuthMode = options.authMode || 'none';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(mode),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      console.warn('401 Unauthorized');
      throw new Error('Please login first');
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('API ERROR:', {
        endpoint,
        status: response.status,
        data,
      });

      throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
    }

    return data;

  } catch (error: any) {
    console.error('NETWORK/API FAILURE:', error);
    throw error;
  }
}

// ================= API =================
export const api = {
  products: {
    list: () => request('/products'),
    get: (id: string) => request(`/products/${id}`),

    create: (payload: object) =>
      request('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
        authMode: 'admin',
      }),

    update: (id: string, payload: object) =>
      request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        authMode: 'admin',
      }),

    delete: (id: string) =>
      request(`/products/${id}`, {
        method: 'DELETE',
        authMode: 'admin',
      }),
  },

  services: {
    list: () => request('/services'),

    submitQuote: (payload: any) => {
      const fixedPayload = {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        service: payload.service || payload.productType, // ✅ AUTO FIX
        quantity: payload.quantity,
        description: payload.description,
      };

      console.log('FINAL QUOTE PAYLOAD:', fixedPayload);

      return request('/services/quote', {
        method: 'POST',
        body: JSON.stringify(fixedPayload),
      });
    },
  },

  contact: {
    submit: (payload: object) =>
      request('/contact', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    list: () => request('/contact'),

    updateStatus: (id: string, status: string) =>
      request(`/contact/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
        authMode: 'admin',
      }),
  },

  auth: {
    register: (payload: object) =>
      request('/auth/customer/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    login: (payload: object) =>
      request('/auth/customer/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    adminLogin: (payload: object) =>
      request('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    logout: () =>
      request('/auth/customer/logout', {
        method: 'POST',
        authMode: 'customer',
      }),

    profile: () =>
      request('/auth/me', {
        authMode: 'customer',
      }),
  },

  orders: {
    create: (payload: object) =>
      request('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
        authMode: 'customer',
      }),

    list: () =>
      request('/orders', {
        authMode: 'customer',
      }),

    get: (id: string) =>
      request(`/orders/${id}`, {
        authMode: 'customer',
      }),

    update: (id: string, payload: object) =>
      request(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        authMode: 'admin',
      }),
  },

  admin: {
    dashboard: () =>
      request('/admin/dashboard', {
        authMode: 'admin',
      }),

    users: () =>
      request('/admin/users', {
        authMode: 'admin',
      }),

    orders: () =>
      request('/admin/orders', {
        authMode: 'admin',
      }),

    contacts: () =>
      request('/admin/contacts', {
        authMode: 'admin',
      }),

    updateContact: (id: string, body: any) =>
      request(`/admin/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        authMode: 'admin',
      }),
  },
};
