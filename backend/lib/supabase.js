// Supabase client for backend
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment is not fully configured.');
  if (!supabaseUrl) console.warn('   Missing SUPABASE_URL');
  if (!supabaseServiceKey) console.warn('   Missing SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseAnonKey) console.warn('   Missing SUPABASE_ANON_KEY');
}

console.log('[Supabase] URL set:', !!supabaseUrl, 'Service key loaded:', !!supabaseServiceKey, 'Anon key loaded:', !!supabaseAnonKey);

// Client with service role for admin operations (database queries, etc.)
const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Client with anon key for auth operations (signup, login, etc.)
const supabaseAuth = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = { supabase, supabaseAuth };
