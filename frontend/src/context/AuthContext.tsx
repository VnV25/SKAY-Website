import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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

const CUSTOMER_STORAGE_KEY = 'customerUser';
const CUSTOMER_COMPAT_KEY = 'skay-user';
const CUSTOMER_TOKEN_KEY = 'skay-token';
const ADMIN_STORAGE_KEY = 'adminUser';
const ADMIN_TOKEN_KEY = 'skay-admin-token';

function normalizeCustomerName(user: any) {
  return (
    user?.name ||
    user?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    'Customer'
  );
}

function sessionToCustomerUser(session: Session | null): CustomerUser | null {
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email || '',
    name: normalizeCustomerName(session.user),
    avatarUrl: session.user.user_metadata?.avatar_url,
    provider: session.user.app_metadata?.provider,
  };
}

function readJSON<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function persistCustomer(user: CustomerUser | null) {
  if (user) {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(CUSTOMER_COMPAT_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    localStorage.removeItem(CUSTOMER_COMPAT_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      try {
        const storedAdmin = readJSON<AdminUser>(ADMIN_STORAGE_KEY);
        if (storedAdmin && mounted) {
          setAdminUser(storedAdmin);
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Supabase getSession error:', sessionError);
        }

        console.log('[Auth] session on app start:', sessionData?.session);

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Supabase getUser error:', userError);
        }

        console.log('[Auth] user on app start:', userData?.user);

        const sessionUser = sessionToCustomerUser(sessionData?.session || null);

        if (mounted) {
          if (sessionUser) {
            setCustomerUser(sessionUser);
            persistCustomer(sessionUser);
          } else {
            const storedCustomer = readJSON<CustomerUser>(CUSTOMER_STORAGE_KEY) || readJSON<CustomerUser>(CUSTOMER_COMPAT_KEY);
            setCustomerUser(storedCustomer);
            persistCustomer(storedCustomer);
          }
        }
      } catch (error) {
        console.error('[Auth] bootstrap failed:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] onAuthStateChange:', event, session);

      const user = sessionToCustomerUser(session);

      if (user) {
        setCustomerUser(user);
        persistCustomer(user);
        console.log('[Auth] user after login:', user);

        const supabaseToken = session?.access_token;

        if (supabaseToken) {
          try {
            const res = await fetch('/api/auth/google-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: supabaseToken }),
            });

            const data = await res.json();
            if (data?.token) {
              localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token);
            }
          } catch (err) {
            console.error('JWT exchange failed:', err);
          }
        }
      } else {
        setCustomerUser(null);
        persistCustomer(null);
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const setCustomerSession = (user: CustomerUser, token?: string) => {
    setCustomerUser(user);
    persistCustomer(user);

    if (token) {
      localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
    }
  };

  const clearCustomerSession = () => {
    setCustomerUser(null);
    persistCustomer(null);
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  };

  const setAdminSession = (user: AdminUser, token?: string) => {
    setAdminUser(user);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));

    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
  };

  const clearAdminSession = () => {
    setAdminUser(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
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
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
