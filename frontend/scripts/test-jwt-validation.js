/**
 * JWT Validation Test Script
 * 
 * Tests the JWT validation improvements in production
 * Run with: node scripts/test-jwt-validation.js
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Test scenarios
const scenarios = [
  {
    name: 'Valid Admin Token',
    token: jwt.sign(
      {
        id: 'test-user-123',
        username: 'testadmin',
        email: 'admin@test.com',
        role: 'admin',
        isAdmin: true
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    ),
    expectedStatus: 200,
    expectedSuccess: true
  },
  {
    name: 'Expired Token',
    token: jwt.sign(
      {
        id: 'test-user-123',
        username: 'testadmin',
        email: 'admin@test.com',
        role: 'admin',
        isAdmin: true
      },
      JWT_SECRET,
      { expiresIn: '-1h' } // Expired 1 hour ago
    ),
    expectedStatus: 401,
    expectedSuccess: false,
    expectedErrorCode: 'TOKEN_EXPIRED'
  },
  {
    name: 'Invalid Token',
    token: 'invalid-token-string',
    expectedStatus: 401,
    expectedSuccess: false,
    expectedErrorCode: 'INVALID_TOKEN'
  },
  {
    name: 'Non-Admin Token',
    token: jwt.sign(
      {
        id: 'test-user-456',
        username: 'regularuser',
        email: 'user@test.com',
        role: 'user',
        isAdmin: false
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    ),
    expectedStatus: 403,
    expectedSuccess: false,
    expectedErrorCode: 'FORBIDDEN'
  },
  {
    name: 'Missing Token',
    token: null,
    expectedStatus: 401,
    expectedSuccess: false,
    expectedErrorCode: 'UNAUTHORIZED'
  }
];

async function testScenario(scenario) {
  console.log(`\n🧪 Testing: ${scenario.name}`);
  console.log('─'.repeat(50));
  
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (scenario.token) {
      headers['Authorization'] = `Bearer ${scenario.token}`;
    }
    
    const response = await fetch(`${API_URL}/api/admin/verify`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    
    // Check status code
    const statusMatch = response.status === scenario.expectedStatus;
    console.log(`Status Code: ${response.status} ${statusMatch ? '✅' : '❌'} (expected ${scenario.expectedStatus})`);
    
    // Check success flag
    const successMatch = data.success === scenario.expectedSuccess;
    console.log(`Success Flag: ${data.success} ${successMatch ? '✅' : '❌'} (expected ${scenario.expectedSuccess})`);
    
    // Check error code if applicable
    if (scenario.expectedErrorCode) {
      const errorCodeMatch = data.error?.code === scenario.expectedErrorCode;
      console.log(`Error Code: ${data.error?.code} ${errorCodeMatch ? '✅' : '❌'} (expected ${scenario.expectedErrorCode})`);
      console.log(`Error Message: "${data.error?.message}"`);
    }
    
    // Check user data if successful
    if (data.success && data.user) {
      console.log(`User ID: ${data.user.id}`);
      console.log(`Username: ${data.user.username}`);
      console.log(`Is Admin: ${data.user.isAdmin}`);
    }
    
    const allChecksPass = statusMatch && successMatch && 
      (!scenario.expectedErrorCode || data.error?.code === scenario.expectedErrorCode);
    
    console.log(`\nResult: ${allChecksPass ? '✅ PASS' : '❌ FAIL'}`);
    
    return allChecksPass;
    
  } catch (error) {
    console.error(`❌ Error testing scenario: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 JWT Validation Test Suite');
  console.log('═'.repeat(50));
  console.log(`API URL: ${API_URL}`);
  console.log(`JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);
  
  const results = [];
  
  for (const scenario of scenarios) {
    const passed = await testScenario(scenario);
    results.push({ name: scenario.name, passed });
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Test Summary');
  console.log('═'.repeat(50));
  
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log('\n' + '═'.repeat(50));
  console.log(`Total: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
