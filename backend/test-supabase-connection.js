const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase Connectivity...');
console.log('URL:', supabaseUrl);
console.log('Key (prefix):', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Key is missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // 1. Try to fetch from a public table or just check API
    console.log('\n1. Checking connection to Supabase API...');
    const { data: healthData, error: healthError } = await supabase.from('contacts').select('id').limit(1);
    
    if (healthError) {
      console.error('❌ API Error:', healthError.message);
      console.error('Full Error:', healthError);
    } else {
      console.log('✅ Connected to Supabase API!');
    }

    // 2. Try a test insert into contacts
    console.log('\n2. Testing insert into "contacts" table...');
    const testContact = {
      name: 'Connectivity Test',
      email: 'test@example.com',
      message: 'This is a test message to verify connectivity.',
      status: 'new'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('contacts')
      .insert([testContact])
      .select();

    if (insertError) {
      console.error('❌ Insert Failed:', insertError.message);
      if (insertError.code === '42P01') {
        console.error('🚨 The "contacts" table does not exist!');
      } else if (insertError.code === '42501') {
        console.error('🚨 RLS Policy violation: The key does not have permission to insert into "contacts".');
      }
    } else {
      console.log('✅ Insert successful! ID:', insertData[0].id);
      
      // 3. Clean up (delete the test entry)
      console.log('\n3. Cleaning up test entry...');
      const { error: deleteError } = await supabase
        .from('contacts')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.warn('⚠️ Could not delete test entry (probably no delete policy):', deleteError.message);
      } else {
        console.log('✅ Test entry cleaned up.');
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error during test:', err.message);
  }
}

testConnection();
