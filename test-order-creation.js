#!/usr/bin/env node

/**
 * Test Order Creation
 * Tests the complete order creation flow with all fallbacks
 */

import fetch from 'node-fetch';

const FRONTEND_URL = 'http://localhost:3000';
const API_URL = `${FRONTEND_URL}/api/orders`;

// Test order data
const testOrder = {
  customerName: 'Test Customer',
  customerPhone: '+224 612 345 678',
  customerEmail: 'test@example.com',
  deliveryAddress: 'Test Address, Conakry, Guinée',
  deliveryZone: 'Ratoma',
  deliveryFee: 20000,
  totalAmount: 95000,
  items: [
    {
      productId: 'test-product-1',
      size: 'M',
      quantity: 2,
      price: 37500,
      name: 'Test T-Shirt',
      color: 'Noir'
    }
  ]
};

async function testOrderCreation() {
  console.log('\n🧪 Testing Order Creation Flow\n');
  console.log(`📡 API URL: ${API_URL}\n`);
  
  try {
    console.log('📝 Creating test order...');
    console.log('Order data:', JSON.stringify(testOrder, null, 2));
    console.log('');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testOrder)
    });
    
    const data = await response.json();
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}\n`);
    
    if (data.success) {
      const order = data.data?.order;
      console.log('✅ Order Created Successfully!\n');
      console.log('Order Details:');
      console.log(`  Order Number: ${order.orderNumber}`);
      console.log(`  Customer: ${order.customerName}`);
      console.log(`  Email: ${order.customerEmail}`);
      console.log(`  Phone: ${order.customerPhone}`);
      console.log(`  Delivery Zone: ${order.deliveryZone}`);
      console.log(`  Total: ${order.totalAmount}`);
      console.log(`  Items: ${order.items?.length || 0}`);
      console.log(`  Status: ${order.status}`);
      
      if (data.warning) {
        console.log(`\n⚠️  Warning: ${data.warning.message}`);
      }
      
      // Test fetching the order
      console.log(`\n🔍 Fetching order ${order.orderNumber}...`);
      
      const getResponse = await fetch(`${API_URL}/${order.orderNumber}`);
      const getData = await getResponse.json();
      
      if (getData.success) {
        const fetchedOrder = getData.data?.order;
        console.log('✅ Order Retrieved Successfully!\n');
        console.log('Fetched Order Details:');
        console.log(`  Order Number: ${fetchedOrder.orderNumber}`);
        console.log(`  Customer: ${fetchedOrder.customerName}`);
        console.log(`  Email: ${fetchedOrder.customerEmail}`);
        console.log(`  Total: ${fetchedOrder.totalAmount}`);
        
        // Verify data matches
        if (fetchedOrder.customerName === testOrder.customerName &&
            fetchedOrder.customerEmail === testOrder.customerEmail &&
            fetchedOrder.totalAmount === testOrder.totalAmount) {
          console.log('\n✅ Data Integrity Verified!');
        } else {
          console.log('\n⚠️  Data Mismatch!');
          console.log('Expected:', testOrder);
          console.log('Got:', fetchedOrder);
        }
      } else {
        console.log('❌ Failed to fetch order');
        console.log('Error:', getData.error);
      }
    } else {
      console.log('❌ Order Creation Failed\n');
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('  1. Frontend is running (npm run dev)');
    console.log('  2. Supabase is configured correctly');
    console.log('  3. Orders table exists in Supabase');
  }
  
  console.log('\n');
}

testOrderCreation();
