/*
 * Test Database Direct Query
 * Checks order items in database directly
 */

const { supabase } = require('./lib/supabase');

async function testDatabaseQuery() {
  console.log('🧪 Testing Database Query...\n');

  try {
    // Get the latest order
    console.log('📦 Getting latest order...');
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (orderError) throw orderError;

    if (orders.length === 0) {
      console.log('❌ No orders found');
      return;
    }

    const latestOrder = orders[0];
    console.log('📋 Latest order:', latestOrder);

    // Get order items for this order
    console.log('📦 Getting order items...');
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        products (
          name,
          price
        )
      `)
      .eq('order_id', latestOrder.id);

    if (itemsError) throw itemsError;

    console.log(`✅ Found ${orderItems.length} order items:`);
    orderItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.products?.name || 'Unknown Product'} - Qty: ${item.quantity}, Price: ${item.price}`);
    });

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testDatabaseQuery();