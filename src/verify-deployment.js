#!/usr/bin/env node

// 🔍 Verify Minha Floresta Supabase Deployment
// This script tests all endpoints and provides detailed diagnostics

const PROJECT_REF = 'rU06IlvghUgVuriI3TDGoV';
const BASE_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/mf-backend`;

console.log('🌳 Minha Floresta - Deployment Verification');
console.log('==========================================');
console.log(`Project: ${PROJECT_REF}`);
console.log(`Base URL: ${BASE_URL}`);
console.log('');

async function testEndpoint(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const method = options.method || 'GET';
  
  console.log(`Testing ${method} ${path}...`);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${response.status} - Success`);
      if (options.showData) {
        console.log('   Response:', JSON.stringify(data, null, 2));
      }
      return { success: true, data, status: response.status };
    } else {
      console.log(`❌ ${response.status} - Error`);
      console.log('   Error:', JSON.stringify(data, null, 2));
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    console.log(`💥 Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  const results = [];
  
  console.log('📋 Testing Core Endpoints...\n');
  
  // Test 1: Root endpoint
  results.push(await testEndpoint('/', { showData: true }));
  console.log('');
  
  // Test 2: Health check
  results.push(await testEndpoint('/health', { showData: true }));
  console.log('');
  
  // Test 3: Status check
  results.push(await testEndpoint('/status', { showData: true }));
  console.log('');
  
  // Test 4: Projects endpoint
  console.log('📋 Testing Data Endpoints...\n');
  results.push(await testEndpoint('/projects', { showData: true }));
  console.log('');
  
  // Test 5: Initialize data (if no projects found)
  const projectsResult = results[results.length - 1];
  if (projectsResult.success && projectsResult.data.count === 0) {
    console.log('📋 No projects found, testing initialization...\n');
    results.push(await testEndpoint('/initialize', { method: 'POST', showData: true }));
    console.log('');
    
    // Test projects again after initialization
    console.log('📋 Testing projects after initialization...\n');
    results.push(await testEndpoint('/projects', { showData: true }));
    console.log('');
  }
  
  // Test 6: Social projects
  results.push(await testEndpoint('/social-projects'));
  console.log('');
  
  // Test 7: Admin endpoint
  results.push(await testEndpoint('/admin/projects'));
  console.log('');
  
  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log('');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('');
    console.log('✅ Your Minha Floresta API is working correctly!');
    console.log('✅ Your React app should now connect successfully');
    console.log('✅ Database operations are functional');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Your app should now work without errors');
    console.log('   2. Test the frontend by opening your app');
    console.log('   3. Check that projects load correctly');
    console.log('   4. Test the shopping cart functionality');
    console.log('');
    console.log('📡 API Endpoints Available:');
    console.log(`   - Root: ${BASE_URL}/`);
    console.log(`   - Status: ${BASE_URL}/status`);
    console.log(`   - Projects: ${BASE_URL}/projects`);
    console.log(`   - Social Projects: ${BASE_URL}/social-projects`);
    console.log(`   - Admin: ${BASE_URL}/admin/projects`);
  } else {
    console.log('');
    console.log('⚠️  SOME TESTS FAILED');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check that environment variables are set:');
    console.log('      - SUPABASE_URL');
    console.log('      - SUPABASE_SERVICE_ROLE_KEY');
    console.log('   2. Verify database table exists (kv_store_minha_floresta)');
    console.log('   3. Check Supabase function logs for errors');
    console.log('   4. Ensure RLS policy allows service role access');
    
    // Show specific failures
    results.forEach((result, index) => {
      if (!result.success) {
        console.log(`   ❌ Test ${index + 1}: ${result.error || result.data?.error || 'Unknown error'}`);
      }
    });
  }
  
  console.log('');
  console.log('🏁 Verification completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Verification script failed:', error);
  process.exit(1);
});