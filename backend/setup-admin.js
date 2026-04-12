const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = 'admin@skay.in';
const ADMIN_PASSWORD = 'AdminSKAY@2024';

async function setup() {
  try {
    console.log('\n🚀 SKAY Admin Initializer');
    console.log('-------------------------');

    // 1. Check if user already exists in Auth
    console.log(`🔍 Checking if ${ADMIN_EMAIL} exists in Auth...`);
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    let user = users.find(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

    if (!user) {
      console.log(`✨ Creating new Auth user: ${ADMIN_EMAIL}...`);
      const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: 'SKAY Admin' }
      });
      if (createError) throw createError;
      user = newUser;
      console.log(`✅ User created successfully! (ID: ${user.id})`);
    } else {
      console.log(`✅ User already exists. (ID: ${user.id})`);
      
      // Update password just in case
      console.log(`⚙️ Updating password to: ${ADMIN_PASSWORD}...`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: ADMIN_PASSWORD
      });
      if (updateError) throw updateError;
      console.log('✅ Password updated.');
    }

    // 2. Ensure Profile exists and is Admin
    console.log('⚙️ Setting role to "admin" in profiles table...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: 'SKAY Admin',
        role: 'admin'
      })
      .select();

    if (profileError) {
      if (profileError.code === '42P01') {
        console.error('🚨 Error: Table "profiles" does not exist.');
        console.log('👉 SOLUTION: You MUST run SUPABASE_DATABASE_SCHEMA.sql in your Supabase Dashboard SQL Editor!');
      } else {
        console.error('❌ Error updating profile:', profileError.message);
      }
      return;
    }

    console.log(`✨ Success! Admin "${ADMIN_EMAIL}" is fully configured.`);
    console.log('\nCredentials:');
    console.log(`- Username: admin`);
    console.log(`- Password: ${ADMIN_PASSWORD}`);
    console.log('\nTry logging in at: http://localhost:3001/admin/login.html');

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

setup();
