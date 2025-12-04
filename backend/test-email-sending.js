/**
 * Test script for email sending functionality
 * Tests both customer confirmation and admin notification emails
 */

require('dotenv').config({ path: __dirname + '/.env' });

console.log('\n' + '='.repeat(80));
console.log('📧 EMAIL SENDING TEST SCRIPT');
console.log('='.repeat(80) + '\n');

// Step 1: Verify SMTP environment variables
console.log('Step 1: Verifying SMTP configuration...\n');

const requiredEnvVars = {
  'SMTP_HOST': process.env.SMTP_HOST,
  'SMTP_PORT': process.env.SMTP_PORT,
  'SMTP_SECURE': process.env.SMTP_SECURE,
  'SMTP_USER': process.env.SMTP_USER,
  'SMTP_PASS': process.env.SMTP_PASS ? '***HIDDEN***' : undefined,
  'ADMIN_EMAIL': process.env.ADMIN_EMAIL
};

let configValid = true;
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (value === undefined || value === '') {
    console.log(`❌ ${key}: NOT SET`);
    configValid = false;
  } else {
    console.log(`✅ ${key}: ${value}`);
  }
}

if (!configValid) {
  console.log('\n❌ SMTP configuration is incomplete. Please check your .env file.');
  process.exit(1);
}

console.log('\n✅ SMTP configuration is complete\n');

// Step 2: Test email service functions
console.log('Step 2: Testing email service functions...\n');

const emailService = require('./emailService');

// Test data for a sample order
const testOrderWithEmail = {
  orderNumber: 'TEST' + Date.now().toString().slice(-6),
  customerName: 'Test Customer',
  customerEmail: process.env.SMTP_USER, // Send to ourselves for testing
  customerPhone: '+224662662958',
  deliveryAddress: '123 Test Street, Conakry',
  deliveryZone: 'Kaloum',
  deliveryFee: 5000,
  total: 125000,
  items: [
    {
      name: 'T-shirt Classic Black',
      quantity: 2,
      price: 50000,
      size: 'L',
      image: 'http://localhost:3001/images/tshirt-classic-black.jpg'
    },
    {
      name: 'Casquette Logo Red',
      quantity: 1,
      price: 25000,
      size: 'Unique',
      image: 'http://localhost:3001/images/cap-logo-red.jpg'
    }
  ]
};

const testOrderWithoutEmail = {
  ...testOrderWithEmail,
  orderNumber: 'TEST' + (Date.now() + 1).toString().slice(-6),
  customerEmail: null
};

const testOrderInvalidEmail = {
  ...testOrderWithEmail,
  orderNumber: 'TEST' + (Date.now() + 2).toString().slice(-6),
  customerEmail: 'invalid-email-format'
};

async function runTests() {
  console.log('='.repeat(80));
  console.log('Test 1: Send customer confirmation email (valid email)');
  console.log('='.repeat(80) + '\n');
  
  try {
    const result1 = await emailService.sendCustomerConfirmation(testOrderWithEmail);
    
    if (result1.success) {
      console.log('✅ TEST PASSED: Customer confirmation email sent successfully');
      console.log(`📧 Message ID: ${result1.messageId}`);
      console.log(`📧 Recipient: ${testOrderWithEmail.customerEmail}`);
    } else {
      console.log('❌ TEST FAILED: Customer confirmation email failed');
      console.log(`📄 Error: ${result1.error}`);
    }
  } catch (error) {
    console.log('❌ TEST FAILED: Exception thrown');
    console.log(`📄 Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('Test 2: Send admin notification email');
  console.log('='.repeat(80) + '\n');
  
  try {
    const result2 = await emailService.sendAdminNotification(testOrderWithEmail);
    
    if (result2.success) {
      console.log('✅ TEST PASSED: Admin notification email sent successfully');
      console.log(`📧 Message ID: ${result2.messageId}`);
      console.log(`📧 Recipient: ${process.env.ADMIN_EMAIL}`);
    } else {
      console.log('❌ TEST FAILED: Admin notification email failed');
      console.log(`📄 Error: ${result2.error}`);
    }
  } catch (error) {
    console.log('❌ TEST FAILED: Exception thrown');
    console.log(`📄 Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('Test 3: Handle missing customer email gracefully');
  console.log('='.repeat(80) + '\n');
  
  try {
    const result3 = await emailService.sendCustomerConfirmation(testOrderWithoutEmail);
    
    if (!result3.success && result3.error.includes('email is required')) {
      console.log('✅ TEST PASSED: Missing email handled gracefully');
      console.log(`📄 Expected error: ${result3.error}`);
    } else if (result3.success) {
      console.log('❌ TEST FAILED: Should have failed with missing email');
    } else {
      console.log('⚠️  TEST WARNING: Unexpected error');
      console.log(`📄 Error: ${result3.error}`);
    }
  } catch (error) {
    console.log('❌ TEST FAILED: Exception thrown');
    console.log(`📄 Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('Test 4: Send email with invalid format (should still attempt)');
  console.log('='.repeat(80) + '\n');
  
  try {
    const result4 = await emailService.sendCustomerConfirmation(testOrderInvalidEmail);
    
    if (!result4.success) {
      console.log('✅ TEST PASSED: Invalid email handled (error logged but not blocking)');
      console.log(`📄 Error: ${result4.error}`);
    } else {
      console.log('⚠️  TEST WARNING: Email sent despite invalid format');
      console.log('Note: SMTP server may have accepted it anyway');
    }
  } catch (error) {
    console.log('✅ TEST PASSED: Exception caught and logged');
    console.log(`📄 Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  console.log('✅ All tests completed');
  console.log('\nNext steps:');
  console.log('1. Check your email inbox for test emails');
  console.log('2. Verify that both customer confirmation and admin notification were received');
  console.log('3. Check the email content and formatting');
  console.log('4. Review the logs above for any errors or warnings');
  console.log('\nIf emails were not received:');
  console.log('- Check your spam/junk folder');
  console.log('- Verify SMTP credentials are correct');
  console.log('- Ensure Gmail "Less secure app access" is enabled (if using Gmail)');
  console.log('- Check that you\'re using an App Password (not your regular password)');
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Fatal error running tests:', error);
  process.exit(1);
});
