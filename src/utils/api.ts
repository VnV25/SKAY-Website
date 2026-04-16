/**
 * API utility for making authenticated requests to the backend
 */

const API_BASE_URL = 'http://localhost:5000';

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
}

/**
 * Check if user is authenticated
 */
export function isAdminAuthenticated(): boolean {
  return !!sessionStorage.getItem('adminToken');
}

/**
 * Get the admin token
 */
export function getAdminToken(): string | null {
  return sessionStorage.getItem('adminToken');
}

/**
 * Get the logged-in admin user data
 */
export function getAdminUser(): any | null {
  const userStr = sessionStorage.getItem('adminUser');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Logout and clear authentication
 */
export function logout(): void {
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminUser');
  localStorage.removeItem('isAdminLoggedIn'); // Clear any old localStorage entries
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const token = getAdminToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestConfig: RequestInit = {
    ...options,
    headers,
  };

  // Serialize body if it's not a string
  if (options.body && typeof options.body !== 'string') {
    requestConfig.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, requestConfig);

  // Check for 401 Unauthorized
  if (response.status === 401) {
    logout();
    window.location.href = '/admin/login';
    throw new Error('Authentication failed. Please log in again.');
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * GET request
 */
export function apiGet<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export function apiPost<T = any>(
  endpoint: string,
  body?: any,
  options?: ApiRequestOptions
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'POST', body });
}

/**
 * PUT request
 */
export function apiPut<T = any>(
  endpoint: string,
  body?: any,
  options?: ApiRequestOptions
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'PUT', body });
}

/**
 * DELETE request
 */
export function apiDelete<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}
