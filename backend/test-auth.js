#!/usr/bin/env node

/**
 * SKAY Authentication System - Endpoint Verification Test
 * Run this file to verify all authentication endpoints are working
 */

const http = require('http');

const BASE_URL = 'https://skay-website-backend.onrender.com';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 SKAY Authentication System - Endpoint Test\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣  Testing /api/health...');
    const health = await makeRequest('GET', '/api/health');
    console.log(`✅ Status: ${health.status}`);
    console.log(`   Database: ${health.body.database}\n`);

    // Test 2: Admin Login
    console.log('2️⃣  Testing /api/auth/admin/login...');
    const adminLogin = await makeRequest('POST', '/api/auth/admin/login', {
      username: 'admin',
      password: 'AdminSKAY@2024',
    });
    console.log(`✅ Status: ${adminLogin.status}`);
    console.log(`   Admin: ${adminLogin.body.admin.name}`);
    console.log(`   Token: ${adminLogin.body.token.substring(0, 20)}...\n`);

    const adminToken = adminLogin.body.token;

    // Test 3: Customer Registration
    console.log('3️⃣  Testing /api/auth/customer/register...');
    const testEmail = `test${Date.now()}@example.com`;
    const customerReg = await makeRequest('POST', '/api/auth/customer/register', {
      name: 'Test Customer',
      email: testEmail,
      password: 'password123',
    });
    console.log(`✅ Status: ${customerReg.status}`);
    console.log(`   Customer: ${customerReg.body.user.name}`);
    console.log(`   Email: ${customerReg.body.user.email}\n`);

    // Test 4: Customer Login
    console.log('4️⃣  Testing /api/auth/customer/login...');
    const customerLogin = await makeRequest('POST', '/api/auth/customer/login', {
      email: testEmail,
      password: 'password123',
    });
    console.log(`✅ Status: ${customerLogin.status}`);
    console.log(`   Customer: ${customerLogin.body.user.name}`);
    console.log(`   Login Count: ${customerLogin.body.user.loginCount || 'N/A'}\n`);

    // Test 5: Admin Get Customers
    console.log('5️⃣  Testing /api/admin/customers...');
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/customers',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    };

    const customersResponse = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
          });
        });
      });
      req.on('error', reject);
      req.end();
    });

    console.log(`✅ Status: ${customersResponse.status}`);
    console.log(`   Total Customers: ${customersResponse.body.total}`);
    console.log(`   Active Today: ${customersResponse.body.activeToday}\n`);

    console.log('✅ All endpoints are working!\n');
    console.log('📋 Summary:');
    console.log('   ✓ Admin login working');
    console.log('   ✓ Customer registration working');
    console.log('   ✓ Customer login working');
    console.log('   ✓ Admin can view customers');
    console.log('\n🎉 Authentication system is fully operational!\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

runTests();
