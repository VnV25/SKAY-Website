// Supabase client for backend
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not configured. Some features may not work.');
  console.warn('   Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env');
}

// Client with service role for admin operations (database queries, etc.)
const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

// Client with anon key for auth operations (signup, login, etc.)
const supabaseAuth = createClient(supabaseUrl || '', supabaseAnonKey || '');

module.exports = { supabase, supabaseAuth };
