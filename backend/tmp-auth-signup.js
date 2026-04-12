const fetch = globalThis.fetch || require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

(async () => {
  const body = {
    email: `testauth-${Date.now()}@example.com`,
    password: 'Password123!'
  };

  try {
    const res = await fetch(`${url}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    console.log('status', res.status);
    console.log('headers', Object.fromEntries(res.headers.entries()));
    console.log('body', text);
  } catch (err) {
    console.error('fetch error', err);
  }
})();