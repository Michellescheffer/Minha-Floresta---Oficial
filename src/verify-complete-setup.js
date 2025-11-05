#!/usr/bin/env node

/**
 * 🔍 Complete Setup Verification Script
 * Verifies all Supabase configurations for Minha Floresta
 */

const PROJECT_REF = "rU06IlvghUgVuriI3TDGoV";
const BASE_URL = `https://${PROJECT_REF}.supabase.co`;

console.log("🔍 Minha Floresta - Complete Setup Verification");
console.log("=".repeat(50));

let allTestsPassed = true;
const results = [];

function logResult(test, status, message = "") {
  const icon = status ? "✅" : "❌";
  console.log(`${icon} ${test}${message ? ": " + message : ""}`);
  results.push({ test, status, message });
  if (!status) allTestsPassed = false;
}

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    const response = await fetch(url);
    const success = response.status === expectedStatus;
    logResult(
      `${name} (${url})`,
      success,
      success ? `Status: ${response.status}` : `Failed: ${response.status}`
    );
    
    if (success && response.headers.get('content-type')?.includes('application/json')) {
      try {
        const data = await response.json();
        console.log(`   📄 Response: ${JSON.stringify(data).substring(0, 100)}...`);
      } catch (e) {
        console.log(`   📄 Response: [Non-JSON content]`);
      }
    }
    
    return success;
  } catch (error) {
    logResult(`${name} (${url})`, false, `Error: ${error.message}`);
    return false;
  }
}

async function verifyDatabase() {
  console.log("\n📊 Database Verification");
  console.log("-".repeat(30));
  
  // Test basic connectivity through edge function
  const dbTest = await testEndpoint("Database Status", `${BASE_URL}/functions/v1/mf-backend/status`);
  
  if (dbTest) {
    console.log("   💡 Database appears to be accessible through Edge Function");
  } else {
    console.log("   ⚠️  Database connectivity issue or Edge Function not deployed");
  }
}

async function verifyEdgeFunctions() {
  console.log("\n⚡ Edge Functions Verification");
  console.log("-".repeat(30));
  
  const endpoints = [
    { name: "Status Endpoint", path: "/status" },
    { name: "Projects Endpoint", path: "/projects" },
    { name: "Cart Endpoint", path: "/cart" },
    { name: "Health Check", path: "/health" }
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(
      endpoint.name,
      `${BASE_URL}/functions/v1/mf-backend${endpoint.path}`
    );
  }
}

async function verifyStorage() {
  console.log("\n🗂️  Storage Verification");
  console.log("-".repeat(30));
  
  // Test storage by trying to access the API
  const storageTest = await testEndpoint(
    "Storage API",
    `${BASE_URL}/storage/v1/bucket`,
    200
  );
  
  logResult("Storage Service", storageTest, storageTest ? "Accessible" : "Not accessible");
}

async function verifyAuth() {
  console.log("\n🔐 Authentication Verification");
  console.log("-".repeat(30));
  
  // Test auth API
  const authTest = await testEndpoint(
    "Auth API",
    `${BASE_URL}/auth/v1/settings`,
    200
  );
  
  logResult("Auth Service", authTest, authTest ? "Accessible" : "Not accessible");
}

async function verifyEnvironmentVariables() {
  console.log("\n🔧 Environment Variables Check");
  console.log("-".repeat(30));
  
  // Test if environment variables are working by calling a protected endpoint
  try {
    const response = await fetch(`${BASE_URL}/functions/v1/mf-backend/debug`);
    const debugStatus = response.status !== 500; // If 500, likely env var issue
    
    logResult(
      "Environment Variables",
      debugStatus,
      debugStatus ? "Appear to be configured" : "Likely missing or incorrect"
    );
  } catch (error) {
    logResult("Environment Variables", false, "Cannot verify - endpoint unreachable");
  }
}

async function testDataOperations() {
  console.log("\n🔄 Data Operations Test");
  console.log("-".repeat(30));
  
  try {
    // Test basic data operations
    const testKey = `test_${Date.now()}`;
    const testData = { test: true, timestamp: new Date().toISOString() };
    
    // Try to set data
    const setResponse = await fetch(`${BASE_URL}/functions/v1/mf-backend/kv/${testKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const setSuccess = setResponse.ok;
    logResult("Data Write Operation", setSuccess);
    
    if (setSuccess) {
      // Try to get data
      const getResponse = await fetch(`${BASE_URL}/functions/v1/mf-backend/kv/${testKey}`);
      const getSuccess = getResponse.ok;
      logResult("Data Read Operation", getSuccess);
      
      if (getSuccess) {
        const retrievedData = await getResponse.json();
        const dataMatch = JSON.stringify(retrievedData) === JSON.stringify(testData);
        logResult("Data Integrity", dataMatch);
      }
      
      // Clean up test data
      await fetch(`${BASE_URL}/functions/v1/mf-backend/kv/${testKey}`, {
        method: 'DELETE'
      });
    }
    
  } catch (error) {
    logResult("Data Operations", false, `Error: ${error.message}`);
  }
}

async function runAllTests() {
  console.log(`🌳 Testing Supabase setup for project: ${PROJECT_REF}\n`);
  
  await verifyEdgeFunctions();
  await verifyDatabase();
  await verifyStorage();
  await verifyAuth();
  await verifyEnvironmentVariables();
  await testDataOperations();
  
  console.log("\n" + "=".repeat(50));
  console.log("📋 VERIFICATION SUMMARY");
  console.log("=".repeat(50));
  
  const passed = results.filter(r => r.status).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total} tests`);
  
  if (allTestsPassed) {
    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("Your Minha Floresta Supabase setup is fully functional! 🌳");
    console.log("\n🚀 Ready for production:");
    console.log("   • Database is accessible");
    console.log("   • Edge Functions are working");
    console.log("   • Storage is configured");
    console.log("   • Authentication is ready");
    console.log("   • Environment variables are set");
  } else {
    console.log("\n⚠️  SOME TESTS FAILED");
    console.log("Issues found that need attention:");
    
    results.filter(r => !r.status).forEach(result => {
      console.log(`   ❌ ${result.test}: ${result.message}`);
    });
    
    console.log("\n💡 Troubleshooting tips:");
    console.log("   1. Check Supabase dashboard for function logs");
    console.log("   2. Verify environment variables are set correctly");
    console.log("   3. Ensure billing is active for your project");
    console.log("   4. Try redeploying the edge function");
    console.log("   5. Check database schema was applied correctly");
  }
  
  console.log("\n📊 Detailed Results:");
  results.forEach(result => {
    const icon = result.status ? "✅" : "❌";
    console.log(`   ${icon} ${result.test}${result.message ? `: ${result.message}` : ""}`);
  });
  
  console.log("\nFor support, check the logs at:");
  console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/functions/mf-backend/logs`);
}

// Run all tests
runAllTests().catch(console.error);