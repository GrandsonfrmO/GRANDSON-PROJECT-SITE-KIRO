/**
 * Test script to create a real order and verify email sending
 * This tests the complete order creation flow including email notifications
 */

require('dotenv').config({ path: __dirname + '/.env' });
const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

console.log('\n' + '='.repeat(80));
console.log('🛒 ORDER CREATION WITH EMAIL TEST');
console.log('='.repeat(80) + '\n');

async function testOrderCreation() {
  try {
    // Test 1: Create order with valid email
    console.log('Test 1: Creating order with valid customer email...\n');
    
    const orderWithEmail = {
      customerName: 'Test Customer Email',
      customerPhone: '0612345678', // French format
      customerEmail: process.env.SMTP_USER, // Send to ourselves
      deliveryAddress: '123 Test Street, Conakry, Guinea',
      deliveryZone: 'Kaloum',
      deliveryFee: 5000,
      totalAmount: 125000,
      items: [
        {
          productId: 'be9b1808-84c0-4d3d-b3a7-aea04f39d899', // Real product ID
          quantity: 1,
          price: 50000,
          size: 'L'
        }
      ]
    };

    console.log('📤 Sending order creation request...');
    console.log('📧 Customer email:', orderWithEmail.customerEmail);
    
    const response1 = await axios.post(`${BACKEND_URL}/api/orders`, orderWithEmail);
    
    if (response1.data.success) {
      console.log('✅ Order created successfully!');
      console.log('📦 Order number:', response1.data.data.order.order_number);
      console.log('💰 Total amount:', response1.data.data.order.total_amount);
      console.log('\n📧 Check the backend logs above for email sending status');
      console.log('📧 Check your email inbox for:');
      console.log('   1. Customer confirmation email');
      console.log('   2. Admin notification email');
    } else {
      console.log('❌ Order creation failed');
      console.log('Error:', response1.data.error);
    }

    // Wait a bit before next test
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Create order without email (should still work)
    console.log('\n' + '='.repeat(80));
    console.log('Test 2: Creating order WITHOUT customer email...\n');
    
    const orderWithoutEmail = {
      customerName: 'Test Customer No Email',
      customerPhone: '0623456789', // French format
      customerEmail: null, // No email
      deliveryAddress: '456 Test Avenue, Conakry, Guinea',
      deliveryZone: 'Matam',
      deliveryFee: 7000,
      totalAmount: 75000,
      items: [
        {
          productId: 'be9b1808-84c0-4d3d-b3a7-aea04f39d899', // Real product ID
          quantity: 1,
          price: 50000,
          size: 'M'
        }
      ]
    };

    console.log('📤 Sending order creation request...');
    console.log('📧 Customer email: (not provided)');
    
    const response2 = await axios.post(`${BACKEND_URL}/api/orders`, orderWithoutEmail);
    
    if (response2.data.success) {
      console.log('✅ Order created successfully (without customer email)!');
      console.log('📦 Order number:', response2.data.data.order.order_number);
      console.log('💰 Total amount:', response2.data.data.order.total_amount);
      console.log('\n📧 Check the backend logs - should show:');
      console.log('   - Warning about no customer email');
      console.log('   - Admin notification still sent');
    } else {
      console.log('❌ Order creation failed');
      console.log('Error:', response2.data.error);
    }

    // Wait a bit before next test
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Create order with invalid email (should still create order)
    console.log('\n' + '='.repeat(80));
    console.log('Test 3: Creating order with INVALID email format...\n');
    
    const orderWithInvalidEmail = {
      customerName: 'Test Customer Invalid Email',
      customerPhone: '0634567890', // French format
      customerEmail: 'not-a-valid-email', // Invalid format
      deliveryAddress: '789 Test Boulevard, Conakry, Guinea',
      deliveryZone: 'Ratoma',
      deliveryFee: 6000,
      totalAmount: 100000,
      items: [
        {
          productId: 'be9b1808-84c0-4d3d-b3a7-aea04f39d899', // Real product ID
          quantity: 1,
          price: 50000,
          size: 'Unique'
        }
      ]
    };

    console.log('📤 Sending order creation request...');
    console.log('📧 Customer email:', orderWithInvalidEmail.customerEmail, '(INVALID FORMAT)');
    
    const response3 = await axios.post(`${BACKEND_URL}/api/orders`, orderWithInvalidEmail);
    
    if (response3.data.success) {
      console.log('✅ Order created successfully (despite invalid email)!');
      console.log('📦 Order number:', response3.data.data.order.order_number);
      console.log('💰 Total amount:', response3.data.data.order.total_amount);
      console.log('\n📧 Check the backend logs - should show:');
      console.log('   - Email sending error (but order still created)');
      console.log('   - Admin notification still sent');
    } else {
      console.log('❌ Order creation failed');
      console.log('Error:', response3.data.error);
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80) + '\n');
    
    console.log('✅ All order creation tests completed');
    console.log('\nVerification checklist:');
    console.log('□ Check backend logs for email sending attempts');
    console.log('□ Check email inbox for customer confirmation (Test 1)');
    console.log('□ Check email inbox for admin notifications (all tests)');
    console.log('□ Verify orders were created in database');
    console.log('□ Verify product stock was updated');
    console.log('□ Verify email errors did not block order creation (Test 3)');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Backend server is not running!');
      console.error('Please start the backend server first:');
      console.error('  cd backend');
      console.error('  node hybrid-server.js');
    }
  }
}

// Check if backend is running first
async function checkBackend() {
  try {
    await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend server is running\n');
    return true;
  } catch (error) {
    console.error('❌ Backend server is not running!');
    console.error('Please start the backend server first:');
    console.error('  cd backend');
    console.error('  node hybrid-server.js\n');
    return false;
  }
}

// Run tests
(async () => {
  const backendRunning = await checkBackend();
  if (backendRunning) {
    await testOrderCreation();
  }
})();
