/**
 * checkAdminAuth.ts
 *
 * Admin authentication guards for all admin write operations.
 *
 * ── How admin auth works ──────────────────────────────────────────────────────
 * AdminLogin.tsx calls supabase.auth.signInWithPassword() directly.
 * This creates a real Supabase browser session, making auth.uid() non-null
 * in RLS policies. The Supabase access_token is stored as `skay-admin-token`.
 *
 * On TOKEN_REFRESHED events, AuthContext keeps skay-admin-token in sync with
 * the new access_token automatically.
 *
 * ── Two guards are exported ───────────────────────────────────────────────────
 *
 * checkAdminAuth()       — synchronous, checks localStorage only.
 *                          Fast, no network call. Use for UI guards.
 *
 * checkAdminAuthAsync()  — async, verifies the live Supabase session.
 *                          Use before critical write operations to be certain.
 */

import { supabase } from './supabase';

const ADMIN_TOKEN_KEY = 'skay-admin-token';
const ADMIN_KEY       = 'adminUser';

/** Decode a JWT payload without verifying the signature. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Synchronous check — reads localStorage only, no network call.
 * Returns null if the admin token is present and not expired.
 * Returns an error message string if authentication fails.
 */
export function checkAdminAuth(): string | null {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);

  if (!token) {
    return 'You must be logged in as admin to perform this action.';
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return 'Your admin session is invalid. Please log in again.';
  }

  const exp = typeof payload.exp === 'number' ? payload.exp : null;
  if (exp !== null && Date.now() / 1000 > exp) {
    // Remove stale token — AuthContext will refresh it via onAuthStateChange
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return 'Your admin session has expired. Please log in again.';
  }

  return null; // authenticated
}

/**
 * Async check — verifies the live Supabase session AND confirms admin role.
 * Use this before critical write operations (insert/update/delete).
 *
 * Returns null if authenticated as admin.
 * Returns an error message string if not.
 */
export async function checkAdminAuthAsync(): Promise<string | null> {
  // Fast path: synchronous check first
  const syncError = checkAdminAuth();
  if (syncError) return syncError;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      return 'Your admin session has expired. Please log in again.';
    }

    // Keep the stored token in sync with the live session
    if (session.access_token !== localStorage.getItem(ADMIN_TOKEN_KEY)) {
      localStorage.setItem(ADMIN_TOKEN_KEY, session.access_token);
    }

    // Verify admin role from cached profile
    const cached = localStorage.getItem(ADMIN_KEY);
    if (cached) {
      try {
        const profile = JSON.parse(cached);
        if (profile?.role === 'admin' && profile?.id === session.user.id) {
          return null; // confirmed admin
        }
      } catch {
        // ignore parse error — fall through to DB check
      }
    }

    // Cache miss — check DB
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return 'Access denied. This account does not have admin privileges.';
    }

    return null; // confirmed admin
  } catch {
    return 'Could not verify admin session. Please try again.';
  }
}

/**
 * Classify a Supabase / API error into a user-friendly message.
 */
export function classifyAdminError(err: unknown, fallback = 'An unexpected error occurred.'): string {
  const msg = err instanceof Error ? err.message : String(err ?? fallback);

  if (/permission denied|row.level security|rls|policy/i.test(msg)) {
    return 'Permission denied. Make sure you are logged in as admin and RLS policies are configured correctly.';
  }
  if (/unauthorized|invalid.*token|expired.*session|no token|jwt/i.test(msg)) {
    return 'Your admin session is invalid or expired. Please log in again.';
  }
  if (/bucket not found/i.test(msg)) {
    return 'Storage bucket not found. Check your Supabase Storage configuration.';
  }
  if (/not allowed|storage.*policy/i.test(msg)) {
    return 'Storage upload blocked by policy. Check Supabase Storage policies.';
  }
  if (/unable to reach|network|fetch/i.test(msg)) {
    return 'Cannot reach the server. Check your network connection.';
  }

  return msg || fallback;
}
