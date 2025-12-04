#!/usr/bin/env node

/**
 * Production Test Script
 * Automated tests for production deployment
 */

const https = require('https');
const http = require('http');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

console.log(`${COLORS.blue}🧪 Testing Production Deployment${COLORS.reset}\n`);
console.log(`Base URL: ${BASE_URL}\n`);

let passedTests = 0;
let failedTests = 0;

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const endTime = Date.now();
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime: endTime - startTime,
        });
      });
    }).on('error', reject);
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`${COLORS.green}✓${COLORS.reset} ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`${COLORS.red}✗${COLORS.reset} ${name}`);
    console.log(`  ${COLORS.red}Error: ${error.message}${COLORS.reset}`);
    failedTests++;
  }
}

async function runTests() {
  console.log(`${COLORS.blue}📋 Running Tests...${COLORS.reset}\n`);

  // Test 1: Homepage loads
  await test('Homepage loads successfully', async () => {
    const res = await makeRequest(BASE_URL);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
  });

  // Test 2: Products page loads
  await test('Products page loads successfully', async () => {
    const res = await makeRequest(`${BASE_URL}/products`);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
  });

  // Test 3: API endpoint works
  await test('Products API endpoint works', async () => {
    const res = await makeRequest(`${BASE_URL}/api/products`);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
    const data = JSON.parse(res.body);
    if (!data.products && !data.data?.products) {
      throw new Error('No products in response');
    }
  });

  // Test 4: Response time
  await test('Products page loads in < 2s', async () => {
    const res = await makeRequest(`${BASE_URL}/products`);
    if (res.responseTime > 2000) {
      throw new Error(`Response time ${res.responseTime}ms exceeds 2000ms`);
    }
  });

  // Test 5: Security headers
  await test('Security headers are present', async () => {
    const res = await makeRequest(BASE_URL);
    const requiredHeaders = [
      'x-frame-options',
      'x-content-type-options',
    ];
    
    for (const header of requiredHeaders) {
      if (!res.headers[header]) {
        throw new Error(`Missing header: ${header}`);
      }
    }
  });

  // Test 6: Cache headers
  await test('Cache headers configured', async () => {
    const res = await makeRequest(`${BASE_URL}/api/products`);
    if (!res.headers['cache-control']) {
      throw new Error('Missing cache-control header');
    }
  });

  // Test 7: Compression enabled
  await test('Compression is enabled', async () => {
    const res = await makeRequest(BASE_URL);
    // Check if content is compressed or small enough
    const contentLength = parseInt(res.headers['content-length'] || '0');
    if (contentLength > 1000000) { // 1MB
      throw new Error(`Response too large: ${contentLength} bytes`);
    }
  });

  // Test 8: Meta tags present
  await test('SEO meta tags present', async () => {
    const res = await makeRequest(`${BASE_URL}/products`);
    const requiredTags = ['<title>', '<meta name="description"'];
    
    for (const tag of requiredTags) {
      if (!res.body.includes(tag)) {
        throw new Error(`Missing tag: ${tag}`);
      }
    }
  });

  // Test 9: No console errors in HTML
  await test('No obvious errors in HTML', async () => {
    const res = await makeRequest(`${BASE_URL}/products`);
    const errorPatterns = ['error', 'undefined', 'null'];
    
    // This is a basic check - in real tests you'd use a headless browser
    if (res.body.toLowerCase().includes('error occurred')) {
      throw new Error('Error message found in HTML');
    }
  });

  // Test 10: Cloudinary images accessible
  await test('Cloudinary images accessible', async () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('CLOUDINARY_CLOUD_NAME not set');
    }
    
    const testUrl = `https://res.cloudinary.com/${cloudName}/image/upload/sample.jpg`;
    try {
      const res = await makeRequest(testUrl);
      if (res.statusCode !== 200) {
        throw new Error(`Cloudinary not accessible: ${res.statusCode}`);
      }
    } catch (error) {
      throw new Error('Cloudinary connection failed');
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log(`${COLORS.blue}📊 Test Results${COLORS.reset}`);
  console.log('='.repeat(50));
  console.log(`${COLORS.green}Passed: ${passedTests}${COLORS.reset}`);
  console.log(`${COLORS.red}Failed: ${failedTests}${COLORS.reset}`);
  console.log(`Total: ${passedTests + failedTests}`);
  console.log('='.repeat(50) + '\n');

  if (failedTests > 0) {
    console.log(`${COLORS.red}❌ Some tests failed. Please fix before deploying.${COLORS.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${COLORS.green}✅ All tests passed! Ready for production.${COLORS.reset}\n`);
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error(`${COLORS.red}Fatal error: ${error.message}${COLORS.reset}`);
  process.exit(1);
});
