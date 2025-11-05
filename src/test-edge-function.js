// Test script to verify Edge Function deployment
async function testEdgeFunction() {
  const baseUrl = 'https://rU06IlvghUgVuriI3TDGoV.supabase.co/functions/v1/mf-backend';
  
  console.log('🌳 Testing Minha Floresta Edge Function deployment...');
  console.log('Base URL:', baseUrl);
  
  try {
    // Test root endpoint
    console.log('\n1. Testing root endpoint...');
    const rootResponse = await fetch(`${baseUrl}/`);
    const rootData = await rootResponse.json();
    console.log('✅ Root endpoint:', rootData);
    
    // Test health endpoint
    console.log('\n2. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test status endpoint
    console.log('\n3. Testing status endpoint...');
    const statusResponse = await fetch(`${baseUrl}/status`);
    const statusData = await statusResponse.json();
    console.log('✅ Status check:', statusData);
    
    // Test projects endpoint
    console.log('\n4. Testing projects endpoint...');
    const projectsResponse = await fetch(`${baseUrl}/projects`);
    const projectsData = await projectsResponse.json();
    console.log('✅ Projects check:', projectsData);
    
    // Test initialization (if no projects exist)
    if (projectsData.count === 0) {
      console.log('\n5. No projects found, testing initialization...');
      const initResponse = await fetch(`${baseUrl}/initialize`, {
        method: 'POST'
      });
      const initData = await initResponse.json();
      console.log('✅ Initialization:', initData);
      
      // Test projects again
      console.log('\n6. Testing projects after initialization...');
      const projectsResponse2 = await fetch(`${baseUrl}/projects`);
      const projectsData2 = await projectsResponse2.json();
      console.log('✅ Projects after init:', projectsData2);
    }
    
    console.log('\n🎉 All tests passed! Minha Floresta API is working correctly.');
    console.log('Your app should now be able to connect to the database.');
    console.log('');
    console.log('🚀 Run full verification: node verify-deployment.js');
    
  } catch (error) {
    console.error('❌ Edge Function test failed:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure the Edge Function is deployed successfully');
    console.log('2. Check that environment variables are set');
    console.log('3. Verify the database table exists');
    console.log('4. Check Supabase project permissions');
  }
}

// Run the test
testEdgeFunction();