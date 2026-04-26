const { createClient } = require('@supabase/supabase-js');

const baseClientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

let adminClient = null;
let authClient = null;

function createProxy(getClient) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        const client = getClient();
        const value = client[prop];
        return typeof value === 'function' ? value.bind(client) : value;
      },
    },
  );
}

function getSupabaseUrl() {
  return process.env.SUPABASE_URL;
}

function getSupabaseAdminClient() {
  if (adminClient) return adminClient;

  const supabaseUrl = getSupabaseUrl();
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('[Supabase] Missing server env vars:', {
      SUPABASE_URL: Boolean(supabaseUrl),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(supabaseServiceRoleKey),
    });
    throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  }

  adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, baseClientOptions);
  return adminClient;
}

function getSupabaseAuthClient() {
  if (authClient) return authClient;

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing server env vars:', {
      SUPABASE_URL: Boolean(supabaseUrl),
      SUPABASE_ANON_KEY: Boolean(supabaseAnonKey),
    });
    throw new Error('Missing SUPABASE_URL / SUPABASE_ANON_KEY');
  }

  authClient = createClient(supabaseUrl, supabaseAnonKey, baseClientOptions);
  return authClient;
}

// Proxies defer client creation until first use (prevents crashing during import when env vars are unset).
const supabaseAdmin = createProxy(getSupabaseAdminClient);
const supabaseAuth = createProxy(getSupabaseAuthClient);

module.exports = {
  supabaseAdmin,
  supabaseAuth,
};
