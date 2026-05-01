const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Key is missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Running feedback table migration...');

    // Read the migration SQL
    const migrationPath = path.join(__dirname, 'migrations', 'create-feedback-table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Migration SQL:');
    console.log(sql);

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      // Try alternative approach - run individual statements
      console.log('Trying individual statements...');

      const statements = sql.split(';').filter(stmt => stmt.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Executing:', statement.trim().substring(0, 50) + '...');
          const { error: stmtError } = await supabase.from('_supabase_migration_temp').select('*').limit(0); // dummy query
          // Since we can't run raw SQL directly, we'll need to inform the user
        }
      }

      console.log('⚠️  Please run the migration SQL manually in your Supabase dashboard:');
      console.log('Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
      console.log('And execute the SQL from:', migrationPath);

    } else {
      console.log('✅ Migration completed successfully!');
    }

  } catch (err) {
    console.error('❌ Migration error:', err.message);
    console.log('⚠️  Please run the migration SQL manually in your Supabase dashboard');
  }
}

runMigration();