/**
 * Test script for order validation and error handling
 * Tests the improved error messages in French
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test cases
const tests = [
  {
    name: 'Missing customer name',
    data: {
      customerPhone: '0612345678',
      deliveryAddress: '123 Rue Test',
      deliveryZone: 'Paris',
      deliveryFee: 5,
      totalAmount: 50,
      items: [{ productId: 'test-id', quantity: 1, price: 45, size: 'M' }]
    },
    expectedError: 'Le nom du client est requis'
  },
  {
    name: 'Missing customer phone',
    data: {
      customerName: 'Test User',
      deliveryAddress: '123 Rue Test',
      deliveryZone: 'Paris',
      deliveryFee: 5,
      totalAmount: 50,
      items: [{ productId: 'test-id', quantity: 1, price: 45, size: 'M' }]
    },
    expectedError: 'Le numéro de téléphone est requis'
  },
  {
    name: 'Invalid phone format',
    data: {
      customerName: 'Test User',
      customerPhone: '123',
      deliveryAddress: '123 Rue Test',
      deliveryZone: 'Paris',
      deliveryFee: 5,
      totalAmount: 50,
      items: [{ productId: 'test-id', quantity: 1, price: 45, size: 'M' }]
    },
    expectedError: 'Le numéro de téléphone doit être au format français valide'
  },
  {
    name: 'Invalid email format',
    data: {
      customerName: 'Test User',
      customerPhone: '0612345678',
      customerEmail: 'invalid-email',
      deliveryAddress: '123 Rue Test',
      deliveryZone: 'Paris',
      deliveryFee: 5,
      totalAmount: 50,
      items: [{ productId: 'test-id', quantity: 1, price: 45, size: 'M' }]
    },
    expectedError: 'L\'adresse email n\'est pas valide'
  },
  {
    name: 'Empty cart',
    data: {
      customerName: 'Test User',
      customerPhone: '0612345678',
      deliveryAddress: '123 Rue Test',
      deliveryZone: 'Paris',
      deliveryFee: 5,
      totalAmount: 50,
      items: []
    },
    expectedError: 'Le panier ne peut pas être vide'
  },
  {
    name: 'Invalid item quantity',
    data: {
      customerName: 'Test User',
      customerPhone: '0612345678',
      deliveryAddress: '123 Rue Test',
      deliveryZone: 'Paris',
      deliveryFee: 5,
      totalAmount: 50,
      items: [{ productId: 'test-id', quantity: 0, price: 45, size: 'M' }]
    },
    expectedError: 'La quantité de l\'article 1 doit être supérieure à zéro'
  }
];

async function runTests() {
  console.log('🧪 Testing Order Validation and Error Handling\n');
  console.log('=' .repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`\n📝 Test: ${test.name}`);
      
      const response = await axios.post(`${BASE_URL}/api/orders`, test.data, {
        validateStatus: () => true // Don't throw on error status
      });
      
      if (response.status === 400 && response.data.error) {
        const errorMessage = response.data.error.message;
        
        if (errorMessage.includes(test.expectedError) || test.expectedError.includes(errorMessage)) {
          console.log(`✅ PASSED - Got expected error: "${errorMessage}"`);
          passed++;
        } else {
          console.log(`❌ FAILED - Expected: "${test.expectedError}"`);
          console.log(`   Got: "${errorMessage}"`);
          failed++;
        }
      } else {
        console.log(`❌ FAILED - Expected 400 error, got status ${response.status}`);
        console.log(`   Response:`, JSON.stringify(response.data, null, 2));
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAILED - Exception: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}/${tests.length}`);
  console.log(`   ❌ Failed: ${failed}/${tests.length}`);
  console.log(`   Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%\n`);
  
  process.exit(failed > 0 ? 1 : 0);
}

// Check if server is running
axios.get(`${BASE_URL}/health`)
  .then(() => {
    console.log('✅ Server is running\n');
    runTests();
  })
  .catch(() => {
    console.error('❌ Server is not running. Please start the backend server first.');
    console.error('   Run: node backend/hybrid-server.js');
    process.exit(1);
  });
