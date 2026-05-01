const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const isValidSupabaseUrl = (url) => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.endsWith('.supabase.co') && urlObj.protocol === 'https:';
  } catch (err) {
    console.error('[Supabase] URL validation failed:', err.message);
    return false;
  }
};

const missingEnv = [];
if (!SUPABASE_URL) missingEnv.push('SUPABASE_URL');
if (!SUPABASE_SERVICE_ROLE_KEY) missingEnv.push('SUPABASE_SERVICE_ROLE_KEY');

const isSupabaseConfigured = missingEnv.length === 0 && isValidSupabaseUrl(SUPABASE_URL);

console.log('[Supabase] Initialization:');
console.log(`  URL: ${SUPABASE_URL ? '✓ Set' : '✗ Missing'}`);
console.log(`  Service Key: ${SUPABASE_SERVICE_ROLE_KEY ? `✓ Set (${SUPABASE_SERVICE_ROLE_KEY.slice(0, 10)}...)` : '✗ Missing'}`);
console.log(`  Valid URL: ${isValidSupabaseUrl(SUPABASE_URL) ? '✓ Yes' : '✗ No'}`);
console.log(`  Status: ${isSupabaseConfigured ? '✓ READY' : '✗ NOT CONFIGURED'}`);
if (missingEnv.length > 0) {
  console.error('[Supabase] Missing required environment variables:', missingEnv.join(', '));
}

let supabase = null;
let supabaseAuth = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('[Supabase] ✓ Supabase client initialized');
  } catch (err) {
    console.error('[Supabase] ✗ Client initialization failed', err);
    supabase = null;
    supabaseAuth = null;
  }
}

module.exports = {
  supabase,
  isSupabaseConfigured,
  supabaseAuth: supabaseAuth || supabase,
};
