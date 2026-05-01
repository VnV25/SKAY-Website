/**
 * AuthContext.tsx
 *
 * Manages two separate auth identities:
 *
 *   customerUser  — Google OAuth or email/password customer
 *   adminUser     — email/password admin (role = 'admin' in profiles table)
 *
 * Both now use supabase.auth.signInWithPassword() / signInWithOAuth() so
 * auth.uid() is always non-null after login, making RLS policies work.
 *
 * Key design decisions:
 * ─────────────────────
 * • A single Supabase client instance (lib/supabase.ts) is used everywhere.
 * • onAuthStateChange is the single source of truth for session state.
 * • Admin sessions are identified by profiles.role = 'admin'.
 * • When an admin session is detected, we do NOT set customerUser — the two
 *   identities are kept strictly separate.
 * • skay-admin-token stores the Supabase access_token so checkAdminAuth()
 *   can verify it synchronously without a network call.
 * • TOKEN_REFRESHED events keep skay-admin-token in sync automatically.
 */

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { api } from '../api/api';

// ── Public types ──────────────────────────────────────────────────────────────
export interface CustomerUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider?: string;
}

export interface AdminUser {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  customerUser: CustomerUser | null;
  adminUser: AdminUser | null;
  loading: boolean;
  setCustomerSession: (user: CustomerUser, token?: string) => void;
  clearCustomerSession: () => void;
  setAdminSession: (user: AdminUser, token?: string) => void;
  clearAdminSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Storage keys ──────────────────────────────────────────────────────────────
const CUSTOMER_KEY  = 'customerUser';
const COMPAT_KEY    = 'skay-user';        // legacy — kept for compatibility
const TOKEN_KEY     = 'skay-token';       // customer app token (JWT_SECRET-signed)
const ADMIN_KEY     = 'adminUser';
const ADMIN_TOKEN   = 'skay-admin-token'; // Supabase access_token for admin

// ── Helpers ───────────────────────────────────────────────────────────────────
function readJSON<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

function persistCustomer(user: CustomerUser | null) {
  if (user) {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(user));
    localStorage.setItem(COMPAT_KEY,   JSON.stringify(user));
  } else {
    localStorage.removeItem(CUSTOMER_KEY);
    localStorage.removeItem(COMPAT_KEY);
  }
}

function normalizeCustomerName(user: any): string {
  return (
    user?.name ||
    user?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    'Customer'
  );
}

function sessionToCustomerUser(session: Session): CustomerUser {
  return {
    id:        session.user.id,
    email:     session.user.email ?? '',
    name:      normalizeCustomerName(session.user),
    avatarUrl: session.user.user_metadata?.avatar_url,
    provider:  session.user.app_metadata?.provider,
  };
}

/** Exchange a Supabase access_token for a backend-signed JWT (customer only). */
async function fetchAppToken(supabaseAccessToken: string): Promise<string | null> {
  try {
    const data = await api.auth.exchangeGoogleToken(supabaseAccessToken);
    return typeof data?.token === 'string' && data.token.length > 0 ? data.token : null;
  } catch {
    return null;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [adminUser,    setAdminUser]    = useState<AdminUser | null>(null);
  const [loading,      setLoading]      = useState(true);

  // Track whether we've already applied the initial session so we don't
  // double-process it when both bootstrap and onAuthStateChange fire.
  const bootstrapDone = useRef(false);

  useEffect(() => {
    let mounted = true;

    /**
     * Determine whether a Supabase session belongs to an admin or a customer
     * and update state accordingly.
     *
     * Admin detection: profiles.role = 'admin' for this user id.
     * We cache the result in localStorage (ADMIN_KEY) to avoid a DB round-trip
     * on every token refresh.
     */
    const applySession = async (session: Session | null): Promise<void> => {
      if (!session?.user) {
        // No active session — restore from localStorage if available
        const storedCustomer =
          readJSON<CustomerUser>(CUSTOMER_KEY) ??
          readJSON<CustomerUser>(COMPAT_KEY);

        if (mounted) {
          setCustomerUser(storedCustomer?.id ? storedCustomer : null);
          if (!storedCustomer?.id) {
            persistCustomer(null);
            localStorage.removeItem(TOKEN_KEY);
          }
        }
        return;
      }

      // ── Check if this is an admin session ──────────────────────────────
      // First check localStorage cache to avoid a DB query on every refresh.
      const cachedAdmin = readJSON<AdminUser>(ADMIN_KEY);
      const isAdminCached = cachedAdmin?.id === session.user.id && cachedAdmin?.role === 'admin';

      if (isAdminCached) {
        // Admin session — keep admin state in sync, don't touch customerUser
        if (mounted) {
          setAdminUser(cachedAdmin);
          localStorage.setItem(ADMIN_TOKEN, session.access_token);
        }
        return;
      }

      // Not cached as admin — check the DB (only on first login or cache miss)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, full_name, role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role === 'admin') {
          // Admin session
          const adminData: AdminUser = {
            id:    profile.id,
            email: profile.email,
            name:  profile.full_name || profile.email,
            role:  'admin',
          };
          if (mounted) {
            setAdminUser(adminData);
            localStorage.setItem(ADMIN_KEY,   JSON.stringify(adminData));
            localStorage.setItem(ADMIN_TOKEN, session.access_token);
          }
          return;
        }
      } catch {
        // Profile fetch failed — treat as customer (non-fatal)
      }

      // ── Customer session ───────────────────────────────────────────────
      const user = sessionToCustomerUser(session);
      if (mounted) {
        setCustomerUser(user);
        persistCustomer(user);
      }

      // Exchange for backend JWT if we don't have one yet
      if (!localStorage.getItem(TOKEN_KEY)) {
        const appToken = await fetchAppToken(session.access_token);
        if (appToken && mounted) {
          localStorage.setItem(TOKEN_KEY, appToken);
        }
      }
    };

    // ── Bootstrap: restore session on page load ────────────────────────────
    const bootstrap = async () => {
      try {
        // Restore admin from localStorage synchronously (no flicker)
        const storedAdmin = readJSON<AdminUser>(ADMIN_KEY);
        if (storedAdmin && mounted) setAdminUser(storedAdmin);

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[Auth] getSession error:', error.message);
          localStorage.removeItem(TOKEN_KEY);
        }

        await applySession(data?.session ?? null);
      } catch (err) {
        console.error('[Auth] bootstrap error:', err);
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        bootstrapDone.current = true;
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    // ── Auth state listener ────────────────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // SIGNED_OUT: clear everything
        if (event === 'SIGNED_OUT') {
          if (mounted) {
            setCustomerUser(null);
            setAdminUser(null);
            persistCustomer(null);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(ADMIN_KEY);
            localStorage.removeItem(ADMIN_TOKEN);
          }
          return;
        }

        // TOKEN_REFRESHED: keep stored tokens in sync — no full re-apply needed
        if (event === 'TOKEN_REFRESHED' && session?.access_token) {
          const cachedAdmin = readJSON<AdminUser>(ADMIN_KEY);
          if (cachedAdmin?.id === session.user?.id) {
            // Admin token refresh
            localStorage.setItem(ADMIN_TOKEN, session.access_token);
          } else {
            // Customer token refresh — clear old app token so it gets re-exchanged
            localStorage.removeItem(TOKEN_KEY);
          }
          return;
        }

        // SIGNED_IN: full session apply (handles Google redirect + admin login)
        if (event === 'SIGNED_IN') {
          // Clear stale customer app token so it gets re-exchanged
          localStorage.removeItem(TOKEN_KEY);
          void applySession(session);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Called after email/password customer login or registration. */
  const setCustomerSession = (user: CustomerUser, token?: string) => {
    setCustomerUser(user);
    persistCustomer(user);
    if (token) localStorage.setItem(TOKEN_KEY, token);
  };

  const clearCustomerSession = () => {
    setCustomerUser(null);
    persistCustomer(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  /**
   * Called by AdminLogin after a successful Supabase sign-in + role check.
   * Stores the admin user and the Supabase access_token.
   */
  const setAdminSession = (user: AdminUser, token?: string) => {
    setAdminUser(user);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(user));
    if (token) localStorage.setItem(ADMIN_TOKEN, token);
  };

  /**
   * Sign out the admin completely — clears both localStorage and the
   * Supabase browser session so auth.uid() becomes null again.
   */
  const clearAdminSession = () => {
    setAdminUser(null);
    localStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem(ADMIN_TOKEN);
    localStorage.removeItem('isAdminLoggedIn');
    // Sign out of Supabase so auth.uid() becomes null in RLS
    void supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        customerUser,
        adminUser,
        loading,
        setCustomerSession,
        clearCustomerSession,
        setAdminSession,
        clearAdminSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
