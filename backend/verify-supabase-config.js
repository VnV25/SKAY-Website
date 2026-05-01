#!/usr/bin/env node
/**
 * Supabase Configuration Verification Script
 * Diagnoses common Supabase connection and permission issues
 */

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n========================================');
console.log('SUPABASE CONFIGURATION VERIFICATION');
console.log('========================================\n');

// 1. Check environment variables
console.log('1️⃣  CHECKING ENVIRONMENT VARIABLES...');
console.log('   SUPABASE_URL:', SUPABASE_URL ? `✓ Set (${SUPABASE_URL})` : '✗ MISSING');
console.log('   SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `✓ Set (${SUPABASE_ANON_KEY.substring(0, 20)}...)` : '✗ MISSING');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? `✓ Set (${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)` : '✗ MISSING');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ FATAL: Missing required environment variables in .env');
  process.exit(1);
}

// 2. Validate URL format
console.log('\n2️⃣  VALIDATING URL FORMAT...');
try {
  const url = new URL(SUPABASE_URL);
  if (url.hostname.includes('supabase.co') && url.protocol === 'https:') {
    console.log(`   ✓ Valid Supabase URL: ${url.hostname}`);
  } else {
    console.error(`   ✗ Invalid Supabase URL format: ${SUPABASE_URL}`);
    console.error('   Expected format: https://[project-id].supabase.co');
    process.exit(1);
  }
} catch (err) {
  console.error(`   ✗ URL parsing error: ${err.message}`);
  process.exit(1);
}

// 3. Test connection with anon key
console.log('\n3️⃣  TESTING CONNECTION WITH ANON KEY...');
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

(async () => {
  try {
    const { error } = await supabaseAuth.from('products').select('count(*)', { count: 'exact', head: true });
    if (error && error.code === 'PGRST116') {
      console.log('   ⚠️  RLS is restricting read access (this is OK for anon key)');
    } else if (error) {
      console.error(`   ✗ Connection failed: ${error.message}`);
      console.error(`   Code: ${error.code}`);
    } else {
      console.log('   ✓ Anon key connection successful');
    }
  } catch (err) {
    console.error(`   ✗ Error: ${err.message}`);
  }

  // 4. Test connection with service role key
  console.log('\n4️⃣  TESTING CONNECTION WITH SERVICE ROLE KEY...');
  const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data, error } = await supabaseService.from('feedback').select('count()', { count: 'exact', head: true });
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('   ⚠️  Feedback table may not exist yet');
        console.log('   Solution: Run SUPABASE_FEEDBACK_RLS_POLICY.sql in Supabase SQL Editor');
      } else {
        console.error(`   ✗ Query failed: ${error.message}`);
        console.error(`   Code: ${error.code}`);
      }
    } else {
      console.log('   ✓ Service role key connection successful');
    }
  } catch (err) {
    console.error(`   ✗ Error: ${err.message}`);
  }

  // 5. Test feedback table insert with service role
  console.log('\n5️⃣  TESTING FEEDBACK TABLE INSERT (SERVICE ROLE)...');
  try {
    const { data, error } = await supabaseService
      .from('feedback')
      .insert([
        {
          name: 'Verification Test',
          email: 'test@example.com',
          rating: 5,
          message: 'Configuration test - this can be deleted',
        },
      ])
      .select();

    if (error) {
      console.error(`   ✗ Insert failed: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      if (error.code === 'PGRST301') {
        console.error('   Issue: RLS policy missing or denying access');
        console.error('   Solution: Run SUPABASE_FEEDBACK_RLS_POLICY.sql');
      }
    } else if (data && data.length > 0) {
      console.log(`   ✓ Insert successful (ID: ${data[0].id})`);
      console.log('   Cleaning up test record...');
      
      // Clean up test record
      await supabaseService.from('feedback').delete().eq('id', data[0].id);
      console.log('   ✓ Test record deleted');
    }
  } catch (err) {
    console.error(`   ✗ Error: ${err.message}`);
  }

  // 6. Summary
  console.log('\n========================================');
  console.log('✓ VERIFICATION COMPLETE');
  console.log('========================================\n');
  console.log('NEXT STEPS:');
  console.log('1. Ensure backend is using fixed lib/supabase.js');
  console.log('2. Run "npm start" to start the backend');
  console.log('3. If RLS errors occur, run SUPABASE_FEEDBACK_RLS_POLICY.sql in Supabase');
  console.log('4. Check backend console logs for "[Supabase]" messages\n');
})();
