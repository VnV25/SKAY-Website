const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmins() {
  try {
    console.log('Checking for Admin users in Supabase profiles table...');
    const { data: admins, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');
    
    if (error) {
      console.error('❌ Error fetching profiles:', error.message);
      if (error.code === '42P01') {
        console.error('🚨 Table "profiles" does not exist! Have you run the SQL schema?');
      }
    } else {
      console.log(`✅ Found ${admins.length} admin(s):`);
      admins.forEach(a => console.log(`- ${a.email} (${a.id})`));
      
      if (admins.length === 0) {
        console.warn('⚠️ No admin users found. Admin login will fail.');
        
        // Check for any users
        const { data: allUsers, error: usersError } = await supabase.from('profiles').select('*').limit(5);
        if (usersError) {
          console.error('❌ Error fetching all users:', usersError.message);
        } else {
          console.log(`✅ Found ${allUsers.length} total users in profiles table.`);
          if (allUsers.length > 0) {
            console.log('Sample user emails:', allUsers.map(u => u.email).join(', '));
            console.log('Tip: You can change a user to admin in the Supabase Table Editor by updating their "role" column to "admin".');
          } else {
            console.warn('🚨 profiles table is EMPTY. Please run SUPABASE_DATABASE_SCHEMA.sql to set up triggers.');
          }
        }
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

checkAdmins();
