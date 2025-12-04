/**
 * Test script for stock check error handling
 * Tests the improved stock error messages in French
 */

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const BASE_URL = 'http://localhost:3001';

// Supabase config
require('dotenv').config({ path: __dirname + '/.env' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTestProducts() {
  console.log('🔧 Setting up test products...\n');
  
  // Create test products with different stock levels
  const testProducts = [
    {
      name: 'Test Product - Out of Stock',
      description: 'Test product with 0 stock',
      price: 50,
      base_price: 50,
      category: 'test',
      sizes: JSON.stringify(['M']),
      images: JSON.stringify([]),
      stock: 0,
      total_stock: 0,
      is_active: true
    },
    {
      name: 'Test Product - Low Stock',
      description: 'Test product with 1 stock',
      price: 50,
      base_price: 50,
      category: 'test',
      sizes: JSON.stringify(['M']),
      images: JSON.stringify([]),
      stock: 1,
      total_stock: 1,
      is_active: true
    },
    {
      name: 'Test Product - Limited Stock',
      description: 'Test product with 3 stock',
      price: 50,
      base_price: 50,
      category: 'test',
      sizes: JSON.stringify(['M']),
      images: JSON.stringify([]),
      stock: 3,
      total_stock: 3,
      is_active: true
    },
    {
      name: 'Test Product - Inactive',
      description: 'Test product that is inactive',
      price: 50,
      base_price: 50,
      category: 'test',
      sizes: JSON.stringify(['M']),
      images: JSON.stringify([]),
      stock: 10,
      total_stock: 10,
      is_active: false
    }
  ];
  
  const createdProducts = [];
  
  for (const product of testProducts) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Error creating test product: ${product.name}`, error);
    } else {
      console.log(`✅ Created: ${product.name} (ID: ${data.id})`);
      createdProducts.push(data);
    }
  }
  
  return createdProducts;
}

async function cleanupTestProducts(productIds) {
  console.log('\n🧹 Cleaning up test products...\n');
  
  for (const id of productIds) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`❌ Error deleting product ${id}:`, error);
    } else {
      console.log(`✅ Deleted product: ${id}`);
    }
  }
}

async function runTests() {
  console.log('🧪 Testing Stock Check Error Handling\n');
  console.log('=' .repeat(60));
  
  let testProducts;
  try {
    testProducts = await setupTestProducts();
    
    if (testProducts.length < 4) {
      console.error('❌ Failed to create all test products');
      return;
    }
    
    const [outOfStock, lowStock, limitedStock, inactive] = testProducts;
    
    const tests = [
      {
        name: 'Out of stock product',
        data: {
          customerName: 'Test User',
          customerPhone: '0612345678',
          deliveryAddress: '123 Rue Test',
          deliveryZone: 'Paris',
          deliveryFee: 5,
          totalAmount: 50,
          items: [{ productId: outOfStock.id, quantity: 1, price: 50, size: 'M' }]
        },
        expectedError: 'est en rupture de stock'
      },
      {
        name: 'Low stock product (requesting more than available)',
        data: {
          customerName: 'Test User',
          customerPhone: '0612345678',
          deliveryAddress: '123 Rue Test',
          deliveryZone: 'Paris',
          deliveryFee: 5,
          totalAmount: 100,
          items: [{ productId: lowStock.id, quantity: 2, price: 50, size: 'M' }]
        },
        expectedError: 'qu\'un seul exemplaire'
      },
      {
        name: 'Limited stock product (requesting more than available)',
        data: {
          customerName: 'Test User',
          customerPhone: '0612345678',
          deliveryAddress: '123 Rue Test',
          deliveryZone: 'Paris',
          deliveryFee: 5,
          totalAmount: 250,
          items: [{ productId: limitedStock.id, quantity: 5, price: 50, size: 'M' }]
        },
        expectedError: 'Il ne reste que 3 exemplaires en stock'
      },
      {
        name: 'Inactive product',
        data: {
          customerName: 'Test User',
          customerPhone: '0612345678',
          deliveryAddress: '123 Rue Test',
          deliveryZone: 'Paris',
          deliveryFee: 5,
          totalAmount: 50,
          items: [{ productId: inactive.id, quantity: 1, price: 50, size: 'M' }]
        },
        expectedError: 'n\'est plus disponible à la vente'
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
      try {
        console.log(`\n📝 Test: ${test.name}`);
        
        const response = await axios.post(`${BASE_URL}/api/orders`, test.data, {
          validateStatus: () => true
        });
        
        if (response.status === 400 && response.data.error) {
          const errorMessage = response.data.error.message;
          
          if (errorMessage.includes(test.expectedError)) {
            console.log(`✅ PASSED - Got expected error containing: "${test.expectedError}"`);
            console.log(`   Full message: "${errorMessage}"`);
            passed++;
          } else {
            console.log(`❌ FAILED - Expected error containing: "${test.expectedError}"`);
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
    
    await cleanupTestProducts(testProducts.map(p => p.id));
    
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Test error:', error);
    if (testProducts) {
      await cleanupTestProducts(testProducts.map(p => p.id));
    }
    process.exit(1);
  }
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
