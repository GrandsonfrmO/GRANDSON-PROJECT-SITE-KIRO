#!/usr/bin/env node

/**
 * Test Backend Health and Wake Up Service
 * This script checks if the Render backend is running and attempts to wake it up
 */

import https from 'https';

const BACKEND_URL = 'https://grandson-backend.onrender.com';
const ENDPOINTS = [
  '/health',
  '/api/products',
  '/api/orders'
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    https.get(url, { timeout: 10000 }, (res) => {
      const duration = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          duration,
          data: data.substring(0, 200) // First 200 chars
        });
      });
    }).on('error', (err) => {
      const duration = Date.now() - startTime;
      reject({
        error: err.message,
        duration
      });
    });
  });
}

async function testBackend() {
  console.log('\n🔍 Testing Grandson Backend Health...\n');
  console.log(`📡 Backend URL: ${BACKEND_URL}\n`);
  
  let allHealthy = true;
  
  for (const endpoint of ENDPOINTS) {
    const url = `${BACKEND_URL}${endpoint}`;
    console.log(`Testing: ${endpoint}`);
    
    try {
      const result = await makeRequest(url);
      
      if (result.status === 200) {
        console.log(`  ✅ Status: ${result.status} ${result.statusText}`);
        console.log(`  ⏱️  Response time: ${result.duration}ms`);
        console.log(`  📄 Response: ${result.data.substring(0, 100)}...`);
      } else if (result.status === 404) {
        console.log(`  ⚠️  Status: ${result.status} ${result.statusText}`);
        console.log(`  💡 Endpoint not found - backend might be in sleep mode`);
        allHealthy = false;
      } else {
        console.log(`  ⚠️  Status: ${result.status} ${result.statusText}`);
        allHealthy = false;
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.error}`);
      console.log(`  ⏱️  Timeout after: ${err.duration}ms`);
      allHealthy = false;
    }
    
    console.log('');
  }
  
  if (allHealthy) {
    console.log('✅ Backend is healthy and responding!\n');
  } else {
    console.log('❌ Backend appears to be unavailable or in sleep mode.\n');
    console.log('💡 To wake up the backend on Render:');
    console.log('   1. Go to https://dashboard.render.com');
    console.log('   2. Select "grandson-backend" service');
    console.log('   3. Click "Manual Deploy"');
    console.log('   4. Wait for deployment to complete\n');
  }
}

testBackend().catch(console.error);
