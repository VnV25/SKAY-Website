/**
 * API utility for making authenticated requests to the backend.
 */

const LOCAL_API_BASE_URL = 'http://localhost:5000/api';
const PRODUCTION_API_BASE_URL = 'https://skay-website-1.onrender.com/api';

const DEFAULT_API_BASE_URL =
  window.location.hostname === 'localhost'
    ? LOCAL_API_BASE_URL
    : PRODUCTION_API_BASE_URL;

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | null;
}

export interface AdminUser {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  role?: string;
}

export function isAdminAuthenticated(): boolean {
  return !!sessionStorage.getItem('adminToken');
}

export function getAdminToken(): string | null {
  return sessionStorage.getItem('adminToken');
}

export function getAdminUser(): AdminUser | null {
  const userStr = sessionStorage.getItem('adminUser');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as AdminUser;
  } catch {
    sessionStorage.removeItem('adminUser');
    return null;
  }
}

export function logout(): void {
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminUser');
  localStorage.removeItem('isAdminLoggedIn');
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const token = getAdminToken();
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const headers = new Headers(options.headers);

  if (
    !headers.has('Content-Type') &&
    options.body !== undefined &&
    options.body !== null &&
    !(options.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestConfig: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  if (
    options.body !== undefined &&
    options.body !== null &&
    typeof options.body === 'object' &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof Blob) &&
    !(options.body instanceof URLSearchParams)
  ) {
    requestConfig.body = JSON.stringify(options.body);
  } else if (options.body !== undefined) {
    requestConfig.body = options.body;
  }

  const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, requestConfig);

  if (response.status === 401) {
    logout();
    window.location.href = '/admin';
    throw new Error('Authentication failed. Please log in again.');
  }

  const responseText = await response.text();
  const data = responseText ? safeJsonParse(responseText) : null;

  if (!response.ok) {
    const message = isApiErrorResponse(data)
      ? data.message
      : `API Error: ${response.statusText}`;
    throw new Error(message);
  }

  return data as T;
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function isApiErrorResponse(value: unknown): value is { message?: string } {
  return typeof value === 'object' && value !== null && 'message' in value;
}

export function apiGet<T = unknown>(
  endpoint: string,
  options?: ApiRequestOptions,
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

export function apiPost<T = unknown>(
  endpoint: string,
  body?: ApiRequestOptions['body'],
  options?: ApiRequestOptions,
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'POST', body });
}

export function apiPut<T = unknown>(
  endpoint: string,
  body?: ApiRequestOptions['body'],
  options?: ApiRequestOptions,
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'PUT', body });
}

export function apiDelete<T = unknown>(
  endpoint: string,
  options?: ApiRequestOptions,
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}