/**
 * Production Smoke Test Script
 * Tests critical functionality in production environment
 * 
 * Usage: node scripts/production-smoke-test.js
 */

const https = require('https');
const http = require('http');

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://grandson-project.vercel.app';
const BACKEND_URL = process.env.BACKEND_URL || 'https://grandson-backend.onrender.com';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 30000
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testBackendHealth() {
  console.log('\n📋 Test 1: Backend Health Check');
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    
    if (response.statusCode === 200 && response.data.status === 'ok') {
      console.log('✅ Backend is healthy');
      results.passed++;
      results.tests.push({ name: 'Backend Health', status: 'PASS' });
      return true;
    } else {
      console.log('❌ Backend health check failed');
      results.failed++;
      results.tests.push({ name: 'Backend Health', status: 'FAIL', error: 'Unexpected response' });
      return false;
    }
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Backend Health', status: 'FAIL', error: error.message });
    return false;
  }
}

async function testAdminLogin() {
  console.log('\n📋 Test 2: Admin Login');
  
  if (!ADMIN_PASSWORD) {
    console.log('⚠️  Skipping admin login test (no password provided)');
    results.tests.push({ name: 'Admin Login', status: 'SKIP', error: 'No password' });
    return null;
  }

  try {
    const response = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
      }
    });
    
    if (response.statusCode === 200 && response.data.success && response.data.data.token) {
      console.log('✅ Admin login successful');
      results.passed++;
      results.tests.push({ name: 'Admin Login', status: 'PASS' });
      return response.data.data.token;
    } else {
      console.log('❌ Admin login failed');
      results.failed++;
      results.tests.push({ name: 'Admin Login', status: 'FAIL', error: 'Invalid credentials' });
      return null;
    }
  } catch (error) {
    console.log('❌ Admin login failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Admin Login', status: 'FAIL', error: error.message });
    return null;
  }
}

async function testGetProducts(token) {
  console.log('\n📋 Test 3: Get Products');
  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await makeRequest(`${BACKEND_URL}/api/products`, {
      headers
    });
    
    if (response.statusCode === 200 && response.data.success) {
      const productCount = response.data.data?.products?.length || 0;
      console.log(`✅ Products retrieved successfully (${productCount} products)`);
      results.passed++;
      results.tests.push({ name: 'Get Products', status: 'PASS', details: `${productCount} products` });
      return response.data.data.products;
    } else {
      console.log('❌ Failed to get products');
      results.failed++;
      results.tests.push({ name: 'Get Products', status: 'FAIL', error: 'Unexpected response' });
      return [];
    }
  } catch (error) {
    console.log('❌ Failed to get products:', error.message);
    results.failed++;
    results.tests.push({ name: 'Get Products', status: 'FAIL', error: error.message });
    return [];
  }
}

async function testCreateProduct(token) {
  console.log('\n📋 Test 4: Create Product');
  
  if (!token) {
    console.log('⚠️  Skipping create product test (no auth token)');
    results.tests.push({ name: 'Create Product', status: 'SKIP', error: 'No token' });
    return null;
  }

  try {
    const testProduct = {
      name: `Smoke Test Product ${Date.now()}`,
      description: 'Automated smoke test product',
      price: 99.99,
      category: 'Test',
      stock: 10,
      sizes: ['Unique'],
      images: [],
      colors: null
    };

    const response = await makeRequest(`${BACKEND_URL}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: testProduct
    });
    
    if (response.statusCode === 201 && response.data.success && response.data.data.product) {
      console.log('✅ Product created successfully');
      console.log(`   Product ID: ${response.data.data.product.id}`);
      results.passed++;
      results.tests.push({ name: 'Create Product', status: 'PASS', details: response.data.data.product.id });
      return response.data.data.product;
    } else {
      console.log('❌ Failed to create product');
      results.failed++;
      results.tests.push({ name: 'Create Product', status: 'FAIL', error: 'Unexpected response' });
      return null;
    }
  } catch (error) {
    console.log('❌ Failed to create product:', error.message);
    results.failed++;
    results.tests.push({ name: 'Create Product', status: 'FAIL', error: error.message });
    return null;
  }
}

async function testUpdateProduct(token, productId) {
  console.log('\n📋 Test 5: Update Product');
  
  if (!token || !productId) {
    console.log('⚠️  Skipping update product test (no token or product)');
    results.tests.push({ name: 'Update Product', status: 'SKIP', error: 'No token or product' });
    return false;
  }

  try {
    const updates = {
      name: `Updated Smoke Test Product ${Date.now()}`,
      price: 149.99,
      stock: 5
    };

    const response = await makeRequest(`${BACKEND_URL}/api/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: updates
    });
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('✅ Product updated successfully');
      results.passed++;
      results.tests.push({ name: 'Update Product', status: 'PASS' });
      return true;
    } else {
      console.log('❌ Failed to update product');
      results.failed++;
      results.tests.push({ name: 'Update Product', status: 'FAIL', error: 'Unexpected response' });
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to update product:', error.message);
    results.failed++;
    results.tests.push({ name: 'Update Product', status: 'FAIL', error: error.message });
    return false;
  }
}

async function testDeleteProduct(token, productId) {
  console.log('\n📋 Test 6: Delete Product');
  
  if (!token || !productId) {
    console.log('⚠️  Skipping delete product test (no token or product)');
    results.tests.push({ name: 'Delete Product', status: 'SKIP', error: 'No token or product' });
    return false;
  }

  try {
    const response = await makeRequest(`${BACKEND_URL}/api/admin/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('✅ Product deleted successfully');
      results.passed++;
      results.tests.push({ name: 'Delete Product', status: 'PASS' });
      return true;
    } else {
      console.log('❌ Failed to delete product');
      results.failed++;
      results.tests.push({ name: 'Delete Product', status: 'FAIL', error: 'Unexpected response' });
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to delete product:', error.message);
    results.failed++;
    results.tests.push({ name: 'Delete Product', status: 'FAIL', error: error.message });
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('='.repeat(80));
  console.log('🚀 Production Smoke Tests');
  console.log('='.repeat(80));
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log('');

  const startTime = Date.now();

  // Run tests
  await testBackendHealth();
  const token = await testAdminLogin();
  await testGetProducts(token);
  const product = await testCreateProduct(token);
  if (product) {
    await testUpdateProduct(token, product.id);
    await testDeleteProduct(token, product.id);
  }

  const duration = Date.now() - startTime;

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Test Summary');
  console.log('='.repeat(80));
  console.log(`Total tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log('');

  // Print detailed results
  console.log('Detailed Results:');
  results.tests.forEach((test, index) => {
    const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
    const details = test.details ? ` (${test.details})` : '';
    const error = test.error ? ` - ${test.error}` : '';
    console.log(`  ${index + 1}. ${icon} ${test.name}${details}${error}`);
  });
  console.log('');

  // Exit with appropriate code
  if (results.failed === 0) {
    console.log('✅ All tests passed! Production is operational.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
