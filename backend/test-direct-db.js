require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrderCreation() {
  try {
    console.log('Testing direct database order creation...');
    
    const orderNumber = `GS${Date.now().toString().slice(-6)}`;
    console.log('Order number:', orderNumber);
    
    const orderData = {
      orderNumber: orderNumber,
      customerName: 'Test Client',
      customerPhone: '0612345678',
      // customerEmail: 'test@test.com', // Commented out to test without email
      deliveryAddress: 'Test Address',
      deliveryZone: 'Kaloum',
      deliveryFee: 35000,
      totalAmount: 115000,
      status: 'PENDING'
    };
    
    console.log('Creating order...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    if (orderError) {
      console.error('❌ Error creating order:', orderError);
      return;
    }
    
    console.log('✅ Order created:', order);
    
    // Create order item
    const orderItem = {
      order_id: order.id,
      product_id: 'be9b1808-84c0-4d3d-b3a7-aea04f39d899',
      size: 'L',
      quantity: 1,
      price: 80000
    };
    
    console.log('Creating order item...');
    const { error: itemError } = await supabase
      .from('order_items')
      .insert([orderItem]);
    
    if (itemError) {
      console.error('❌ Error creating order item:', itemError);
      return;
    }
    
    console.log('✅ Order item created');
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

testOrderCreation();
