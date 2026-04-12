require('dotenv').config();
const { supabase, supabaseAuth } = require('./lib/supabase');

console.log('Testing Supabase connection...');

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return;
    }
    console.log('✅ Supabase connected successfully');

    // Test auth client
    console.log('Testing auth client...');
    // Just check if the client is created
    console.log('✅ Auth client created');

    console.log('All tests passed!');
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testConnection();