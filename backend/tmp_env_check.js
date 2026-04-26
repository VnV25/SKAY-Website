require('dotenv').config();
console.log('SUPABASE_URL=', process.env.SUPABASE_URL);
console.log('SERVICE KEY LENGTH=', process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 'missing');
console.log('ANON KEY LENGTH=', process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.length : 'missing');
