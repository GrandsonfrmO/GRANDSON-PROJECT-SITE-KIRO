/**
 * Manual test script for demo mode
 * This script tests the demo order creation and retrieval
 * 
 * Run with: node test-demo-mode.js
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

async function testDemoMode() {
  console.log('🧪 Testing Demo Mode for Order Confirmation Fix');
  console.log('='.repeat(80));
  
  // Test data
  const testOrder = {
    customerName: 'Test Client Demo',
    customerPhone: '+224 123 456 789',
    customerEmail: 'test@demo.com',
    deliveryAddress: 'Conakry, Ratoma',
    deliveryZone: 'Ratoma',
    deliveryFee: 20000,
    totalAmount: 150000,
    items: [
      {
        productId: 'test-product-1',
        name: 'T-Shirt Test',
        size: 'L',
        quantity: 2,
        price: 50000,
        images: ['/test-image.jpg']
      },
      {
        productId: 'test-product-2',
        name: 'Pantalon Test',
        size: 'M',
        quantity: 1,
        price: 50000,
        images: ['/test-image2.jpg']
      }
    ]
  };
  
  try {
    // Step 1: Create order (should use demo mode if backend is down)
    console.log('\n📝 Step 1: Creating order...');
    console.log('POST', `${FRONTEND_URL}/api/orders`);
    
    const createResponse = await fetch(`${FRONTEND_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder)
    });
    
    const createData = await createResponse.json();
    console.log('Response status:', createResponse.status);
    console.log('Response data:', JSON.stringify(createData, null, 2));
    
    if (!createData.success) {
      console.error('❌ Order creation failed:', createData.error);
      return;
    }
    
    const orderNumber = createData.data.order.orderNumber;
    console.log('✅ Order created successfully');
    console.log('📋 Order number:', orderNumber);
    
    if (createData.warning) {
      console.log('⚠️  Warning:', createData.warning.message);
      console.log('🎭 Demo mode was activated');
    }
    
    // Step 2: Retrieve order
    console.log('\n📥 Step 2: Retrieving order...');
    console.log('GET', `${FRONTEND_URL}/api/orders/${orderNumber}`);
    
    const getResponse = await fetch(`${FRONTEND_URL}/api/orders/${orderNumber}`);
    const getData = await getResponse.json();
    
    console.log('Response status:', getResponse.status);
    console.log('Response data:', JSON.stringify(getData, null, 2));
    
    if (!getData.success) {
      console.error('❌ Order retrieval failed:', getData.error);
      return;
    }
    
    console.log('✅ Order retrieved successfully');
    
    if (getData.warning) {
      console.log('⚠️  Warning:', getData.warning.message);
      console.log('🎭 Demo mode was used for retrieval');
    }
    
    // Step 3: Verify data structure
    console.log('\n🔍 Step 3: Verifying data structure...');
    const order = getData.data.order;
    
    const checks = [
      { name: 'Order Number', value: order.orderNumber, expected: orderNumber },
      { name: 'Customer Name', value: order.customerName, expected: testOrder.customerName },
      { name: 'Customer Phone', value: order.customerPhone, expected: testOrder.customerPhone },
      { name: 'Customer Email', value: order.customerEmail, expected: testOrder.customerEmail },
      { name: 'Delivery Address', value: order.deliveryAddress, expected: testOrder.deliveryAddress },
      { name: 'Delivery Zone', value: order.deliveryZone, expected: testOrder.deliveryZone },
      { name: 'Delivery Fee', value: order.deliveryFee, expected: testOrder.deliveryFee },
      { name: 'Total Amount', value: order.totalAmount, expected: testOrder.totalAmount },
      { name: 'Status', value: order.status, expected: 'PENDING' },
      { name: 'Items Count', value: order.items?.length, expected: testOrder.items.length },
    ];
    
    let allChecksPassed = true;
    for (const check of checks) {
      const passed = check.value === check.expected;
      const icon = passed ? '✅' : '❌';
      console.log(`${icon} ${check.name}: ${check.value} ${passed ? '' : `(expected: ${check.expected})`}`);
      if (!passed) allChecksPassed = false;
    }
    
    // Check items structure
    console.log('\n📦 Checking items structure...');
    if (order.items && order.items.length > 0) {
      const item = order.items[0];
      const itemChecks = [
        { name: 'Item has ID', value: !!item.id },
        { name: 'Item has size', value: !!item.size },
        { name: 'Item has quantity', value: !!item.quantity },
        { name: 'Item has price', value: !!item.price },
        { name: 'Item has product info', value: !!item.product || !!item.name },
      ];
      
      for (const check of itemChecks) {
        const icon = check.value ? '✅' : '❌';
        console.log(`${icon} ${check.name}`);
        if (!check.value) allChecksPassed = false;
      }
    }
    
    console.log('\n' + '='.repeat(80));
    if (allChecksPassed) {
      console.log('✅ All checks passed! Demo mode is working correctly.');
    } else {
      console.log('❌ Some checks failed. Please review the output above.');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error(error.stack);
  }
}

// Run the test
testDemoMode().catch(console.error);
