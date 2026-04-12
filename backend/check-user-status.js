const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const emailToCheck = process.argv[2];

if (!emailToCheck) {
  console.error('Usage: node check-user-status.js <email>');
  process.exit(1);
}

async function checkUser() {
  try {
    console.log(`Checking status for: ${emailToCheck}...`);

    // 1. Check in auth.users (via admin API)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listing auth users:', authError.message);
    } else {
      const user = authUsers.users.find(u => u.email.toLowerCase() === emailToCheck.toLowerCase());
      if (!user) {
        console.error('🚨 User not found in Supabase Auth!');
      } else {
        console.log('✅ Found in Auth:', { id: user.id, email: user.email, confirmed: !!user.email_confirmed_at });
        
        // 2. Check in public.profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            console.error('🚨 Profile NOT found in public.profiles table!');
            console.log('Tip: Try to register again or manually insert a profile for this ID.');
          } else {
            console.error('❌ Database error checking profile:', profileError.message);
          }
        } else {
          console.log('✅ Profile found:', profile);
          if (profile.role !== 'admin') {
            console.warn(`⚠️ Role is "${profile.role}", NOT "admin". Admin login will be denied.`);
          }
        }
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

checkUser();
