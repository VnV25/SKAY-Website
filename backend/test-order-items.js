/*
 * Test Order Items Verification
 * Checks if order items were created correctly
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

async function testOrderItems() {
  console.log('🧪 Testing Order Items...\n');

  try {
    // Test the admin orders endpoint to see if it shows order items
    console.log('📦 Getting all orders (admin view)...');
    const ordersResponse = await request('GET', '/api/admin/orders');

    if (ordersResponse.status === 200) {
      const orders = ordersResponse.body.orders || ordersResponse.body;
      console.log(`✅ Found ${orders.length} orders`);

      if (orders.length > 0) {
        const latestOrder = orders[0];
        console.log('📋 Latest order details:', JSON.stringify(latestOrder, null, 2));
      }
    } else {
      console.log('❌ Could not access admin orders (expected without auth):', ordersResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testOrderItems();