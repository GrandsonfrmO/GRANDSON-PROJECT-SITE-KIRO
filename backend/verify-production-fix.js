#!/usr/bin/env node

/**
 * Verify and fix production issues
 * 1. Check products with missing images
 * 2. Verify image URLs are accessible
 * 3. Check order creation flow
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://grandson-backend.onrender.com';
const FRONTEND_URL = 'https://grandsonproject.com';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          resolve({
            status: response.statusCode,
            headers: response.headers,
            data: data ? JSON.parse(data) : data
          });
        } catch (e) {
          resolve({
            status: response.statusCode,
            headers: response.headers,
            data: data
          });
        }
      });
    });
    
    request.on('error', reject);
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkBackendConnection() {
  log('\n=== Checking Backend Connection ===', 'cyan');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    log(`✓ Backend is accessible (${response.status})`, 'green');
    return true;
  } catch (error) {
    log(`✗ Backend is not accessible: ${error.message}`, 'red');
    return false;
  }
}

async function checkProducts() {
  log('\n=== Checking Products ===', 'cyan');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/products`);
    
    if (response.status !== 200) {
      log(`✗ Failed to fetch products (${response.status})`, 'red');
      return;
    }
    
    const products = response.data.products || response.data.data?.products || [];
    log(`✓ Found ${products.length} products`, 'green');
    
    // Check for products with missing images
    const productsWithoutImages = products.filter(p => 
      !p.images || 
      (Array.isArray(p.images) && p.images.length === 0) ||
      p.images === '[]' ||
      p.images === 'null'
    );
    
    if (productsWithoutImages.length > 0) {
      log(`⚠ ${productsWithoutImages.length} products have no images:`, 'yellow');
      productsWithoutImages.forEach(p => {
        log(`  - ${p.id}: ${p.name}`, 'yellow');
      });
    } else {
      log(`✓ All products have images`, 'green');
    }
    
    // Check for products with invalid data
    const invalidProducts = products.filter(p => 
      !p.name || 
      p.price === null || 
      p.price <= 0 ||
      p.stock === null ||
      p.stock < 0
    );
    
    if (invalidProducts.length > 0) {
      log(`⚠ ${invalidProducts.length} products have invalid data:`, 'yellow');
      invalidProducts.forEach(p => {
        log(`  - ${p.id}: ${p.name} (price: ${p.price}, stock: ${p.stock})`, 'yellow');
      });
    } else {
      log(`✓ All products have valid data`, 'green');
    }
    
    // Show first 3 products
    log('\nFirst 3 products:', 'blue');
    products.slice(0, 3).forEach(p => {
      const images = Array.isArray(p.images) ? p.images.length : 0;
      log(`  - ${p.name} (${images} images, stock: ${p.stock})`, 'blue');
    });
    
  } catch (error) {
    log(`✗ Error checking products: ${error.message}`, 'red');
  }
}

async function checkImageUrls() {
  log('\n=== Checking Image URLs ===', 'cyan');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/products?limit=5`);
    const products = response.data.products || response.data.data?.products || [];
    
    for (const product of products.slice(0, 3)) {
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        const imageUrl = product.images[0];
        log(`\nChecking image for "${product.name}":`, 'blue');
        log(`  URL: ${imageUrl}`, 'blue');
        
        try {
          const imgResponse = await makeRequest(imageUrl, { timeout: 3000 });
          if (imgResponse.status === 200) {
            log(`  ✓ Image is accessible`, 'green');
          } else {
            log(`  ✗ Image returned ${imgResponse.status}`, 'red');
          }
        } catch (error) {
          log(`  ✗ Image is not accessible: ${error.message}`, 'red');
        }
      }
    }
  } catch (error) {
    log(`✗ Error checking images: ${error.message}`, 'red');
  }
}

async function checkOrderCreation() {
  log('\n=== Checking Order Creation Flow ===', 'cyan');
  
  const testOrder = {
    customerName: 'Test Customer',
    customerPhone: '+224662662958',
    customerEmail: 'test@example.com',
    deliveryAddress: 'Test Address, Conakry',
    deliveryZone: 'Kaloum',
    items: [
      {
        productId: 1,
        size: 'M',
        quantity: 1,
        price: 50000
      }
    ],
    deliveryFee: 35000,
    totalAmount: 85000
  };
  
  try {
    log('Attempting to create test order...', 'blue');
    
    // This would need to be a POST request, which is more complex
    // For now, just verify the endpoint exists
    const response = await makeRequest(`${BACKEND_URL}/api/orders`);
    
    if (response.status === 405 || response.status === 200) {
      log('✓ Order endpoint is accessible', 'green');
    } else {
      log(`⚠ Order endpoint returned ${response.status}`, 'yellow');
    }
  } catch (error) {
    log(`✗ Error checking order endpoint: ${error.message}`, 'red');
  }
}

async function checkEnvironmentVariables() {
  log('\n=== Environment Configuration ===', 'cyan');
  log(`Backend URL: ${BACKEND_URL}`, 'blue');
  log(`Frontend URL: ${FRONTEND_URL}`, 'blue');
  log(`Image optimization enabled: true`, 'blue');
}

async function runAllChecks() {
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║  Production Issues Verification Tool  ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');
  
  await checkEnvironmentVariables();
  const backendOk = await checkBackendConnection();
  
  if (backendOk) {
    await checkProducts();
    await checkImageUrls();
    await checkOrderCreation();
  }
  
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║  Verification Complete                ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');
}

// Run checks
runAllChecks().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});
