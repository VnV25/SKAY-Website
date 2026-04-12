const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const email = process.argv[2];

if (!email) {
  console.log('\n🚀 SKAY Admin Promotion Utility');
  console.log('Usage: node promote-admin.js <email>\n');
  process.exit(0);
}

async function promote() {
  try {
    console.log(`\n🔍 Searching for user: ${email}...`);

    // 1. Find user in auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found in Supabase Auth.`);
      console.log('Tip: Make sure the user has registered on the website first.');
      return;
    }

    console.log(`✅ Found User: ${user.id}`);

    // 2. Update role in profiles table
    console.log(`⚙️  Promoting to Admin...`);
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)
      .select();

    if (updateError) {
      if (updateError.code === '42P01') {
        console.error('🚨 Error: Table "profiles" does not exist.');
        console.log('👉 SOLUTION: You MUST run SUPABASE_DATABASE_SCHEMA.sql in your Supabase SQL Editor first!');
      } else {
        console.error('❌ Error updating profile:', updateError.message);
      }
      return;
    }

    if (!data || data.length === 0) {
      console.error('❌ Error: Profile not found for this user.');
      console.log('Tip: This happens if the user signed up before the SQL triggers were added.');
      console.log('⚙️  Attempting to create a profile manually...');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, email: user.email, role: 'admin', full_name: user.user_metadata?.full_name || '' }]);
      
      if (insertError) {
        console.error('❌ Manual profile creation failed:', insertError.message);
      } else {
        console.log('✨ Success! Profile created and promoted to Admin.');
      }
    } else {
      console.log(`✨ Success! ${email} is now an Admin.`);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

promote();
