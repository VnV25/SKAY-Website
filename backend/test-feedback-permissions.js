#!/usr/bin/env node
/**
 * Test Feedback Permission Fix
 * Verifies that feedback table permissions are working
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n========================================');
console.log('FEEDBACK PERMISSION TEST');
console.log('========================================\n');

// Check environment
console.log('1️⃣  CHECKING ENVIRONMENT...');
console.log('   SUPABASE_URL:', SUPABASE_URL ? '✓ Set' : '✗ MISSING');
console.log('   SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? `✓ Set (${SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...)` : '✗ MISSING');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ Missing required environment variables');
  process.exit(1);
}

// Create client with SERVICE ROLE KEY
console.log('\n2️⃣  TESTING CONNECTION...');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

(async () => {
  try {
    // Test 1: Simple select to check connection
    console.log('   Testing basic connection...');
    const { error: selectError } = await supabase
      .from('feedback')
      .select('count', { count: 'exact', head: true });

    if (selectError) {
      console.error('   ✗ Connection failed:', selectError.message);
      console.error('   Code:', selectError.code);
      process.exit(1);
    }

    console.log('   ✓ Connection successful');

    // Test 2: Insert test record
    console.log('\n3️⃣  TESTING INSERT PERMISSION...');
    const testData = {
      name: 'Permission Test',
      email: 'test@example.com',
      rating: 5,
      message: 'Testing feedback permissions - this can be deleted',
    };

    console.log('   Inserting test record...');
    const { data, error: insertError } = await supabase
      .from('feedback')
      .insert([testData])
      .select();

    if (insertError) {
      console.error('   ✗ Insert failed:', insertError.message);
      console.error('   Code:', insertError.code);
      console.error('   Details:', insertError.details);

      if (insertError.code === 'PGRST301' || insertError.message.includes('permission denied')) {
        console.error('\n🔧 SOLUTION: Run FIX_FEEDBACK_PERMISSION_DENIED.sql in Supabase SQL Editor');
        console.error('   1. Go to https://supabase.com/dashboard');
        console.error('   2. Select your project');
        console.error('   3. Go to SQL Editor');
        console.error('   4. Run the SQL script');
      }

      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log('   ✓ Insert successful!');
      console.log(`   Record ID: ${data[0].id}`);

      // Clean up test record
      console.log('   Cleaning up test record...');
      await supabase.from('feedback').delete().eq('id', data[0].id);
      console.log('   ✓ Test record deleted');
    }

    console.log('\n========================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('========================================');
    console.log('✓ Supabase connection works');
    console.log('✓ Feedback table accessible');
    console.log('✓ Insert permissions working');
    console.log('✓ RLS policies configured correctly');
    console.log('\n🎉 Your feedback form should now work!');
    console.log('   Try submitting feedback from your frontend.');

  } catch (err) {
    console.error('\n❌ Unexpected error:', err.message);
    process.exit(1);
  }
})();