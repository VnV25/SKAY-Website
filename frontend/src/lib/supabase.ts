import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pqdfqgzungrximqwwnkc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

const browserStorage = typeof window !== 'undefined' ? window.localStorage : undefined;

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
  console.warn('[Supabase] Frontend env vars are missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: browserStorage,
  },
});
