require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

(async () => {
  console.log('Testing feedback table access...');
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log('❌ Error:', error.message);
      console.log('Code:', error.code);
      console.log('Details:', error.details);
      console.log('Hint:', error.hint);
    } else {
      console.log('✅ Feedback table exists and is accessible');
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
  }
})();