/**
 * Awards API - Manual Testing Script
 * Run this in browser console to test API endpoints
 */

// Configuration
const API_URL = 'https://dev-be.lncorp.local';
const TOKEN = localStorage.getItem('token'); // Get from localStorage

// Helper function
async function testAPI(method, endpoint, data = null) {
  console.log(`\n🧪 Testing: ${method} ${endpoint}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', result);
      return result;
    } else {
      console.error('❌ Error:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
    return null;
  }
}

// Test Suite
async function testAwardsAPI() {
  console.log('🚀 Starting Awards API Tests...\n');
  console.log('📌 Backend URL:', API_URL);
  console.log('🔑 Token:', TOKEN ? 'Found' : 'Not found (login first!)');
  
  if (!TOKEN) {
    console.error('❌ No token found! Please login first.');
    return;
  }
  
  // 1. Get all awards
  console.log('\n=== Test 1: Get All Awards ===');
  const allAwards = await testAPI('GET', '/cms/awards');
  
  // 2. Create new award
  console.log('\n=== Test 2: Create Award ===');
  const newAward = await testAPI('POST', '/cms/awards', {
    title: 'Test Award ' + Date.now(),
    year: 2024,
    issuer: 'Test Issuer',
    description: 'This is a test award',
    status: 'ACTIVE'
  });
  
  const createdId = newAward?.data?.id;
  
  if (createdId) {
    // 3. Get single award
    console.log('\n=== Test 3: Get Single Award ===');
    await testAPI('GET', `/cms/awards/${createdId}`);
    
    // 4. Update award
    console.log('\n=== Test 4: Update Award ===');
    await testAPI('PUT', `/cms/awards/${createdId}`, {
      title: 'Updated Test Award',
      year: 2024,
      issuer: 'Updated Issuer',
      description: 'This award has been updated',
      status: 'INACTIVE'
    });
    
    // 5. Delete award
    console.log('\n=== Test 5: Delete Award ===');
    await testAPI('DELETE', `/cms/awards/${createdId}`);
  }
  
  console.log('\n✅ All tests completed!');
}

// Run tests
console.log('📝 Awards API Test Script Loaded');
console.log('📝 Run: testAwardsAPI()');
console.log('📝 Or test individual endpoints with testAPI()');

// Auto-run (comment out if you want to run manually)
// testAwardsAPI();
