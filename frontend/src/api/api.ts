/// <reference types="vite/client" />

// ─── Base URL ─────────────────────────────────────────────────────────────────
// All API calls use VITE_API_URL — set this in your environment:
//
//   Development (.env.local):
//     VITE_API_URL=http://localhost:5000/api
//     The Vite dev server proxies /api → that target (see vite.config.ts)
//     so relative /api calls work without CORS issues.
//
//   Production (Vercel / hosting env vars):
//     VITE_API_URL=<your-backend-url>/api
//     The full absolute URL is used directly — no proxy needed.
//
//   Fallback (no env var set):
//     /api  — works when frontend and backend share the same origin.

const _rawApiUrl = (import.meta.env.VITE_API_URL ?? '').trim();

const API_BASE = (() => {
  if (!_rawApiUrl) {
    // No env var — use relative path (works when same origin)
    return '/api';
  }

  // Absolute URL (http/https) — use directly. This is the production case.
  if (_rawApiUrl.startsWith('http://') || _rawApiUrl.startsWith('https://')) {
    return _rawApiUrl.endsWith('/') ? _rawApiUrl.slice(0, -1) : _rawApiUrl;
  }

  // Relative value (e.g. "/api") — use as-is
  return _rawApiUrl.endsWith('/') ? _rawApiUrl.slice(0, -1) : _rawApiUrl;
})();

const DEFAULT_TIMEOUT_MS = 15_000;

// ─── Auth helpers ─────────────────────────────────────────────────────────────
type AuthMode = 'admin' | 'customer' | 'none';

function getToken(mode: AuthMode): string | null {
  if (typeof window === 'undefined') return null;
  if (mode === 'admin')    return localStorage.getItem('skay-admin-token');
  if (mode === 'customer') return localStorage.getItem('skay-token');
  return null;
}

function authHeaders(mode: AuthMode): Record<string, string> {
  const token = getToken(mode);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request<T = any>(
  endpoint: string,
  options: RequestInit & { authMode?: AuthMode; timeoutMs?: number } = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint}`;

  const mode       = options.authMode ?? 'none';
  const controller = new AbortController();
  const timer      = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  const headers: HeadersInit = {
    ...authHeaders(mode),
    // Only set Content-Type for requests that carry a body
    ...(options.body != null ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers ?? {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal:      controller.signal,
      credentials: 'include',
    });

    // Parse body regardless of status so we can surface error messages
    const contentType = res.headers.get('content-type') ?? '';
    let data: any;
    if (contentType.includes('application/json')) {
      data = await res.json().catch(() => null);
    } else {
      const text = await res.text().catch(() => '');
      data = text ? { message: text } : null;
    }

    if (!res.ok) {
      const message =
        data?.message ??
        data?.error   ??
        `Request failed (${res.status})`;

      const err = new Error(String(message)) as Error & {
        status?: number;
        payload?: unknown;
      };
      err.status  = res.status;
      err.payload = data;
      throw err;
    }

    return (data ?? {}) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('The request timed out. Please try again.');
    }
    if (err instanceof TypeError) {
      throw new Error(
        'Unable to reach the server. Check your network connection.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export { API_BASE as API_BASE_URL };

// ─── API surface ──────────────────────────────────────────────────────────────
export const api = {
  health: () => request('/health'),

  // ── Products ──────────────────────────────────────────────────────────────
  products: {
    /**
     * Public product list — paginated, default 50 per page.
     * For admin use, prefer fetchAllProducts() from lib/adminSupabase.ts
     * which queries Supabase directly and avoids auth token mismatches.
     */
    list: (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page)     qs.set('page',     String(params.page));
      if (params?.limit)    qs.set('limit',    String(params.limit));
      if (params?.category) qs.set('category', params.category);
      if (params?.search)   qs.set('search',   params.search);
      const query = qs.toString();
      return request(`/products${query ? `?${query}` : ''}`);
    },
    get:    (id: string)             => request(`/products/${id}`),
    create: (payload: object)        => request('/products', {
      method: 'POST', body: JSON.stringify(payload), authMode: 'admin',
    }),
    update: (id: string, payload: object) => request(`/products/${id}`, {
      method: 'PUT', body: JSON.stringify(payload), authMode: 'admin',
    }),
    delete: (id: string) => request(`/products/${id}`, {
      method: 'DELETE', authMode: 'admin',
    }),
    // ── Variants ────────────────────────────────────────────────────────────
    variants: {
      /**
       * Fetch variants for ONE product via Express backend.
       * For fetching ALL variants at once, use fetchAllVariants() from
       * lib/adminSupabase.ts (direct Supabase query, no auth issues).
       */
      list: (productId: string) =>
        request(`/products/${productId}/variants`),
      /** Create a new variant row (Express backend, JWT_SECRET auth) */
      create: (productId: string, payload: object) =>
        request(`/products/${productId}/variants`, {
          method: 'POST', body: JSON.stringify(payload), authMode: 'admin',
        }),
      /** Update a variant — e.g. set image_url after Supabase Storage upload */
      update: (productId: string, variantId: string, payload: object) =>
        request(`/products/${productId}/variants/${variantId}`, {
          method: 'PUT', body: JSON.stringify(payload), authMode: 'admin',
        }),
      /** Delete a variant */
      delete: (productId: string, variantId: string) =>
        request(`/products/${productId}/variants/${variantId}`, {
          method: 'DELETE', authMode: 'admin',
        }),
    },
  },

  // ── Services / quotes ─────────────────────────────────────────────────────
  services: {
    list: () => request('/services'),
    submitQuote: (payload: any) => request('/services/quote', {
      method: 'POST',
      body: JSON.stringify({
        name:        payload.name,
        email:       payload.email,
        phone:       payload.phone,
        company:     payload.company,
        service:     payload.service ?? payload.serviceType ?? payload.productType,
        quantity:    payload.quantity,
        description: payload.description,
        color:       payload.color,
        variant:     payload.variant,
        size:        payload.size,
      }),
    }),
  },

  // ── Contact ───────────────────────────────────────────────────────────────
  contact: {
    submit: (payload: object) => request('/inquiries/quote', {
      method: 'POST', body: JSON.stringify(payload),
    }),
    list: () => request('/admin/contacts', { authMode: 'admin' }),
    updateStatus: (id: string, status: string) =>
      request(`/admin/contacts/${id}`, {
        method: 'PUT', body: JSON.stringify({ status }), authMode: 'admin',
      }),
  },

  // ── Feedback ──────────────────────────────────────────────────────────────
  feedback: {
    submit: (payload: object) => request('/feedback', {
      method: 'POST', body: JSON.stringify(payload),
    }),
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    register: (payload: object) => request('/auth/customer/register', {
      method: 'POST', body: JSON.stringify(payload),
    }),
    login: (payload: object) => request('/auth/customer/login', {
      method: 'POST', body: JSON.stringify(payload),
    }),
    adminLogin: (payload: object) => request('/auth/admin/login', {
      method: 'POST', body: JSON.stringify(payload),
    }),
    /**
     * Exchange a Supabase access_token for a backend-signed JWT.
     * The backend verifies the Supabase token, upserts the profile,
     * and returns { token, user } where token is signed with JWT_SECRET.
     */
    exchangeGoogleToken: (supabaseToken: string) =>
      request('/auth/google-login', {
        method: 'POST', body: JSON.stringify({ token: supabaseToken }),
      }),
    profile: () => request('/auth/me', { authMode: 'customer' }),
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  orders: {
    create: (payload: object) => request('/orders', {
      method: 'POST', body: JSON.stringify(payload), authMode: 'customer',
    }),
    list: () => request('/orders', { authMode: 'customer' }),
    get:  (id: string) => request(`/orders/${id}`, { authMode: 'customer' }),
    update: (id: string, payload: object) => request(`/orders/${id}`, {
      method: 'PUT', body: JSON.stringify(payload), authMode: 'admin',
    }),
  },

  // ── Payments ──────────────────────────────────────────────────────────────
  payments: {
    /**
     * Create a Stripe PaymentIntent.
     * amount is in the smallest currency unit (paise for INR).
     * Sends the customer JWT so the backend can optionally verify the user.
     */
    createIntent: (amount: number) => request('/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount }),
      authMode: 'customer',   // sends Bearer skay-token header
    }),
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: {
    dashboard:     ()                      => request('/admin/dashboard',  { authMode: 'admin' }),
    users:         ()                      => request('/admin/users',      { authMode: 'admin' }),
    orders:        ()                      => request('/admin/orders',     { authMode: 'admin' }),
    contacts:      ()                      => request('/admin/contacts',   { authMode: 'admin' }),
    feedback:      ()                      => request('/admin/feedback',   { authMode: 'admin' }),
    updateContact: (id: string, body: any) =>
      request(`/admin/contacts/${id}`, {
        method: 'PUT', body: JSON.stringify(body), authMode: 'admin',
      }),
  },
};
