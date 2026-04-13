import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
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
  setCustomerSession: (user: CustomerUser, token?: string) => void;
  clearCustomerSession: () => void;
  setAdminSession: (user: AdminUser, token?: string) => void;
  clearAdminSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CUSTOMER_STORAGE_KEY = 'customerUser';
const CUSTOMER_TOKEN_KEY = 'customerToken';
const ADMIN_STORAGE_KEY = 'adminUser';
const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_FLAG_KEY = 'isAdminLoggedIn';

function normalizeCustomerName(user: Partial<CustomerUser> & Record<string, any>) {
  return (
    user?.name ||
    user?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    'Customer'
  );
}

function normalizeCustomerUser(user: Record<string, any> | null | undefined): CustomerUser | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email || '',
    name: normalizeCustomerName(user),
    avatarUrl: user.avatarUrl || user.user_metadata?.avatar_url || user.user_metadata?.picture,
    provider: user.provider || user.app_metadata?.provider,
  };
}

function readJSON<T>(key: string): T | null {
  const value = localStorage.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function syncCustomerToStorage(user: CustomerUser | null, token?: string) {
  if (user) {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(user));
    if (token) localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  }
  window.dispatchEvent(new Event('customer-auth-changed'));
}

function syncAdminToStorage(user: AdminUser | null, token?: string) {
  if (user) {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(ADMIN_FLAG_KEY, 'true');
    if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_FLAG_KEY);
  }
  window.dispatchEvent(new Event('admin-auth-changed'));
}

function sessionToCustomerUser(session: Session | null): CustomerUser | null {
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email || '',
    name: normalizeCustomerName(session.user),
    avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
    provider: session.user.app_metadata?.provider,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() =>
    normalizeCustomerUser(readJSON<Record<string, any>>(CUSTOMER_STORAGE_KEY))
  );
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() =>
    readJSON<AdminUser>(ADMIN_STORAGE_KEY)
  );

  useEffect(() => {
    let mounted = true;

    const hydrateFromSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      const nextUser = sessionToCustomerUser(session);
      if (nextUser) {
        setCustomerUser(nextUser);
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(nextUser));
      }
    };

    hydrateFromSession().catch(() => undefined);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = sessionToCustomerUser(session);
      if (nextUser) {
        setCustomerUser(nextUser);
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(nextUser));
      }
    });

    const handleCustomerChange = () => {
      setCustomerUser(normalizeCustomerUser(readJSON<Record<string, any>>(CUSTOMER_STORAGE_KEY)));
    };

    const handleAdminChange = () => {
      setAdminUser(readJSON<AdminUser>(ADMIN_STORAGE_KEY));
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === CUSTOMER_STORAGE_KEY || event.key === CUSTOMER_TOKEN_KEY) {
        handleCustomerChange();
      }
      if (event.key === ADMIN_STORAGE_KEY || event.key === ADMIN_TOKEN_KEY || event.key === ADMIN_FLAG_KEY) {
        handleAdminChange();
      }
    };

    window.addEventListener('customer-auth-changed', handleCustomerChange);
    window.addEventListener('admin-auth-changed', handleAdminChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('customer-auth-changed', handleCustomerChange);
      window.removeEventListener('admin-auth-changed', handleAdminChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setCustomerSession = (user: CustomerUser, token?: string) => {
    setCustomerUser(user);
    syncCustomerToStorage(user, token);
  };

  const clearCustomerSession = () => {
    setCustomerUser(null);
    syncCustomerToStorage(null);
  };

  const setAdminSession = (user: AdminUser, token?: string) => {
    setAdminUser(user);
    syncAdminToStorage(user, token);
  };

  const clearAdminSession = () => {
    setAdminUser(null);
    syncAdminToStorage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        customerUser,
        adminUser,
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
