/*
 * Complete End-to-End Test
 * Tests all authentication flows and customer management
 */

const http = require('http');

const API_URL = 'http://localhost:5001';

// Helper: Make HTTP request
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Tests
const tests = [];
let adminToken = null;
let customerToken = null;

async function test(name, fn) {
  try {
    await fn();
    tests.push({ name, status: '✅ PASS' });
  } catch (err) {
    tests.push({ name, status: `❌ FAIL: ${err.message}` });
  }
}

async function run() {
  console.log('\n🧪 COMPLETE E2E TEST\n');
  console.log('═'.repeat(60));

  // 1. Health Check
  await test('1. Health Check', async () => {
    const res = await request('GET', '/api/health');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.database !== 'connected') throw new Error('Database not connected');
  });

  // 2. Admin Login
  await test('2. Admin Login', async () => {
    const res = await request('POST', '/api/auth/admin/login', {
      username: 'admin',
      password: 'AdminSKAY@2024',
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${res.body?.message}`);
    if (!res.body.token) throw new Error('No token returned');
    adminToken = res.body.token;
  });

  // 3. Customer Registration
  let customerEmail = `testcust${Date.now()}@example.com`;
  await test('3. Customer Registration', async () => {
    const res = await request('POST', '/api/auth/customer/register', {
      name: 'Test Customer',
      email: customerEmail,
      password: 'Password@123',
    });
    if (res.status !== 201) throw new Error(`Status ${res.status}: ${res.body?.message}`);
    if (!res.body.token) throw new Error('No token returned');
    if (res.body.user.loginCount !== 1) throw new Error('loginCount not set to 1');
    customerToken = res.body.token;
  });

  // 4. Customer Login
  await test('4. Customer Login', async () => {
    const res = await request('POST', '/api/auth/customer/login', {
      email: customerEmail,
      password: 'Password@123',
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${res.body?.message}`);
    if (!res.body.user.loginCount || res.body.user.loginCount < 2) throw new Error('loginCount not incremented');
  });

  // 5. View Customer Profile
  await test('5. View Customer Profile (Customer)', async () => {
    const res = await request('GET', '/api/auth/profile', null, {
      'Authorization': `Bearer ${customerToken}`,
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${res.body?.message}`);
    if (res.body.user.role !== 'user') throw new Error('Wrong role');
  });

  // 6. Admin Get All Customers
  await test('6. Admin Get All Customers', async () => {
    const res = await request('GET', '/api/admin/customers', null, {
      'Authorization': `Bearer ${adminToken}`,
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${res.body?.message}`);
    if (!Array.isArray(res.body.customers)) throw new Error('Customers not an array');
    if (res.body.total === undefined) throw new Error('Total not returned');
    if (res.body.activeToday === undefined) throw new Error('activeToday not returned');
  });

  // 7. Admin Stats
  await test('7. Admin Get Stats', async () => {
    const res = await request('GET', '/api/admin/stats', null, {
      'Authorization': `Bearer ${adminToken}`,
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${res.body?.message}`);
    if (typeof res.body.totalUsers !== 'number') throw new Error('totalUsers missing');
  });

  // 8. Frontend HTML Pages Exist
  await test('8. Customer Login Page (HTML)', async () => {
    const res = await request('GET', '/login.html');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body || !res.body.includes('<!DOCTYPE')) throw new Error('Not valid HTML');
  });

  // 9. Admin Login Page Exists
  await test('9. Admin Login Page (HTML)', async () => {
    const res = await request('GET', '/admin/login.html');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body || !res.body.includes('<!DOCTYPE')) throw new Error('Not valid HTML');
  });

  // 10. Admin Dashboard Page Exists
  await test('10. Admin Dashboard Page (HTML)', async () => {
    const res = await request('GET', '/admin/dashboard.html');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body || !res.body.includes('<!DOCTYPE')) throw new Error('Not valid HTML');
  });

  // Print results
  console.log('\n' + '═'.repeat(60));
  tests.forEach((t, i) => {
    console.log(`${t.name.padEnd(45)} ${t.status}`);
  });
  console.log('═'.repeat(60));

  const passed = tests.filter(t => t.status.startsWith('✅')).length;
  const total = tests.length;
  console.log(`\n📊 Results: ${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! System is working correctly.');
    console.log('\n📍 Access your app:');
    console.log('   Customer: http://localhost:5175/login.html');
    console.log('   Admin: http://localhost:5175/admin/login.html');
    console.log('   Quote: http://localhost:5175/quote');
    console.log('   Backend API: http://localhost:5001/api\n');
  } else {
    console.log('⚠️  Some tests failed. Check output above.');
  }

  process.exit(passed === total ? 0 : 1);
}

run().catch(err => {
  console.error('Test error:', err.message);
  process.exit(1);
});
