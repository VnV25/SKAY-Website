/*
 * Test Order Creation
 * Tests the complete order placement flow
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

async function testOrderCreation() {
  console.log('🧪 Testing Order Creation...\n');

  try {
    // First, let's get the products to see what's available
    console.log('📦 Getting available products...');
    const productsResponse = await request('GET', '/api/products');
    if (productsResponse.status !== 200) {
      console.error('❌ Failed to get products:', productsResponse.body);
      return;
    }

    const products = productsResponse.body.products;
    console.log(`✅ Found ${products.length} products`);

    if (products.length === 0) {
      console.error('❌ No products available for testing');
      return;
    }

    // Use the first product for testing
    const testProduct = products[0];
    console.log(`🛒 Using product: ${testProduct.name} (ID: ${testProduct.id})`);

    // Create a test order
    const orderData = {
      items: [
        {
          product_id: testProduct.id,
          quantity: 2,
          price: testProduct.price
        }
      ],
      total: testProduct.price * 2,
      shippingAddress: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zip_code: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'test_payment'
    };

    console.log('📝 Creating order...');
    const orderResponse = await request('POST', '/api/orders', orderData);

    if (orderResponse.status === 201) {
      console.log('✅ Order created successfully!');
      console.log('📋 Order details:', orderResponse.body);
    } else {
      console.error('❌ Failed to create order:', orderResponse.status, orderResponse.body);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testOrderCreation();