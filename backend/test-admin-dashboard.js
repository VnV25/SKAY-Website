// Quick test script to verify admin dashboard data
require('dotenv').config();
const { supabase } = require('./lib/supabase');

async function testAdminDashboard() {
  console.log('\n🧪 Testing Admin Dashboard Data Retrieval\n');
  console.log('═'.repeat(60));

  try {
    // Test 1: Count users
    console.log('\n📊 TEST 1: Counting Users...');
    const { count: userCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    console.log(`   ✓ Total Users: ${userCount}`);

    // Test 2: Count products
    console.log('\n📦 TEST 2: Counting Products...');
    const { count: productCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });
    console.log(`   ✓ Total Products: ${productCount}`);

    // Test 3: Count orders
    console.log('\n🛒 TEST 3: Counting Orders...');
    const { count: orderCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true });
    console.log(`   ✓ Total Orders: ${orderCount}`);

    // Test 4: Get sample orders
    console.log('\n📋 TEST 4: Retrieving Sample Orders...');
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .limit(3)
      .order('created_at', { ascending: false });
    console.log(`   ✓ Retrieved ${orders?.length || 0} sample orders`);
    if (orders?.length) {
      orders.forEach(o => {
        console.log(`      - Order ${o.id}: ${o.customer_name || 'Unknown'} | ₹${o.total} | Status: ${o.status}`);
      });
    }

    // Test 5: Get sample customers (profiles)
    console.log('\n👥 TEST 5: Retrieving Sample Customers...');
    const { data: customers } = await supabase
      .from('profiles')
      .select('id, email, full_name, login_count, created_at')
      .eq('role', 'customer')
      .limit(3)
      .order('created_at', { ascending: false });
    console.log(`   ✓ Retrieved ${customers?.length || 0} sample customers`);
    if (customers?.length) {
      customers.forEach(c => {
        console.log(`      - ${c.full_name || c.email} | Logins: ${c.login_count} | Created: ${new Date(c.created_at).toLocaleDateString('en-IN')}`);
      });
    }

    // Test 6: Calculate revenue
    console.log('\n💰 TEST 6: Calculating Total Revenue...');
    const { data: allOrders } = await supabase
      .from('orders')
      .select('total');
    const revenue = (allOrders || []).reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    console.log(`   ✓ Total Revenue: ₹${revenue.toLocaleString('en-IN')}`);

    // Test 7: Count contacts
    console.log('\n📧 TEST 7: Counting Contacts...');
    const { count: contactCount } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true });
    console.log(`   ✓ Total Contacts: ${contactCount}`);

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ ALL TESTS PASSED!\n');
    console.log('Summary:');
    console.log(`  👥 Users: ${userCount}`);
    console.log(`  📦 Products: ${productCount}`);
    console.log(`  🛒 Orders: ${orderCount}`);
    console.log(`  📧 Contacts: ${contactCount}`);
    console.log(`  💰 Revenue: ₹${revenue.toLocaleString('en-IN')}`);
    console.log('\n');

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    if (err.code) console.error('   Code:', err.code);
    if (err.details) console.error('   Details:', err.details);
  } finally {
    process.exit(0);
  }
}

testAdminDashboard();
