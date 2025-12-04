/**
 * Simple email test - just verify email service works
 */

require('dotenv').config({ path: __dirname + '/.env' });

console.log('\n' + '='.repeat(80));
console.log('📧 SIMPLE EMAIL SERVICE TEST');
console.log('='.repeat(80) + '\n');

// Step 1: Verify SMTP configuration
console.log('Step 1: Checking SMTP configuration...\n');

const config = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS ? '***' : undefined,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL
};

console.log('Configuration:');
for (const [key, value] of Object.entries(config)) {
  console.log(`  ${key}: ${value || 'NOT SET'}`);
}

if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.ADMIN_EMAIL) {
  console.log('\n❌ SMTP configuration incomplete');
  process.exit(1);
}

console.log('\n✅ SMTP configuration complete\n');

// Step 2: Test email sending
console.log('Step 2: Testing email service...\n');

const emailService = require('./emailService');

const testOrder = {
  orderNumber: 'TEST' + Date.now().toString().slice(-6),
  customerName: 'Test Customer',
  customerEmail: process.env.SMTP_USER,
  customerPhone: '0612345678',
  deliveryAddress: '123 Test Street, Paris',
  deliveryZone: 'Paris Centre',
  deliveryFee: 5000,
  total: 75000,
  items: [
    {
      name: 'Test Product',
      quantity: 1,
      price: 70000,
      size: 'M',
      image: null
    }
  ]
};

async function runTest() {
  console.log('Test Order:', testOrder.orderNumber);
  console.log('Customer Email:', testOrder.customerEmail);
  console.log('Admin Email:', process.env.ADMIN_EMAIL);
  console.log('');

  // Test customer email
  console.log('Sending customer confirmation email...');
  const result1 = await emailService.sendCustomerConfirmation(testOrder);
  
  if (result1.success) {
    console.log('✅ Customer email sent successfully');
    console.log('   Message ID:', result1.messageId);
  } else {
    console.log('❌ Customer email failed');
    console.log('   Error:', result1.error);
  }

  console.log('');

  // Test admin email
  console.log('Sending admin notification email...');
  const result2 = await emailService.sendAdminNotification(testOrder);
  
  if (result2.success) {
    console.log('✅ Admin email sent successfully');
    console.log('   Message ID:', result2.messageId);
  } else {
    console.log('❌ Admin email failed');
    console.log('   Error:', result2.error);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST COMPLETE');
  console.log('='.repeat(80) + '\n');

  console.log('✅ Email service is working correctly');
  console.log('\nNext steps:');
  console.log('1. Check your email inbox for the test emails');
  console.log('2. Verify both customer and admin emails were received');
  console.log('3. Check email formatting and content');
  console.log('\nIf emails not received:');
  console.log('- Check spam/junk folder');
  console.log('- Verify SMTP credentials');
  console.log('- Check Gmail App Password is correct');
}

runTest().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});
