#!/usr/bin/env node

/**
 * 🔍 Verify Current Supabase State
 * This script checks what's already working and what needs to be fixed
 */

const https = require('https');
const http = require('http');

const PROJECT_REF = 'rU06IlvghUgVuriI3TDGoV';
const BASE_URL = `https://${PROJECT_REF}.supabase.co`;

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const req = protocol.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });

        req.on('error', (error) => {
            resolve({
                status: 0,
                error: error.message
            });
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function checkEndpoint(name, url, expectedStatus = 200) {
    try {
        colorLog(`\n🔍 Testing ${name}...`, 'blue');
        colorLog(`   URL: ${url}`, 'cyan');
        
        const response = await makeRequest(url);
        
        if (response.status === expectedStatus) {
            colorLog(`   ✅ Status: ${response.status} - Working!`, 'green');
            if (response.data) {
                const preview = response.data.substring(0, 150);
                colorLog(`   📄 Response: ${preview}${response.data.length > 150 ? '...' : ''}`, 'cyan');
            }
            return true;
        } else if (response.status === 403) {
            colorLog(`   ❌ Status: 403 - Forbidden (This is the error we need to fix!)`, 'red');
            return false;
        } else if (response.status === 404) {
            colorLog(`   ❌ Status: 404 - Function not found`, 'yellow');
            return false;
        } else if (response.status === 0) {
            colorLog(`   ❌ Network error: ${response.error}`, 'red');
            return false;
        } else {
            colorLog(`   ⚠️  Status: ${response.status} - Unexpected`, 'yellow');
            if (response.data) {
                colorLog(`   📄 Response: ${response.data.substring(0, 100)}`, 'cyan');
            }
            return false;
        }
    } catch (error) {
        colorLog(`   ❌ Error: ${error.message}`, 'red');
        return false;
    }
}

async function main() {
    colorLog('🌳 Minha Floresta - Current State Verification', 'bright');
    colorLog('================================================', 'bright');
    
    // Test different function names that might exist
    const functionsToTest = [
        { name: 'mf-backend (GOOD - keep this one)', url: `${BASE_URL}/functions/v1/mf-backend/status` },
        { name: 'make-server (BAD - delete this)', url: `${BASE_URL}/functions/v1/make-server/status` },
        { name: 'minha-floresta-api (BAD - delete this)', url: `${BASE_URL}/functions/v1/minha-floresta-api/status` },
        { name: 'server (BAD - delete this)', url: `${BASE_URL}/functions/v1/server/status` },
        { name: 'api (BAD - delete this)', url: `${BASE_URL}/functions/v1/api/status` }
    ];

    colorLog('\n📋 Checking Edge Functions:', 'bright');
    
    let workingFunctions = [];
    let conflictingFunctions = [];
    
    for (const func of functionsToTest) {
        const isWorking = await checkEndpoint(func.name, func.url);
        if (isWorking) {
            if (func.name.includes('mf-backend')) {
                workingFunctions.push(func.name);
            } else {
                conflictingFunctions.push(func.name);
            }
        }
    }

    // Test additional endpoints if mf-backend is working
    if (workingFunctions.some(f => f.includes('mf-backend'))) {
        colorLog('\n📊 Testing mf-backend endpoints:', 'bright');
        
        const endpoints = [
            { name: 'Projects endpoint', url: `${BASE_URL}/functions/v1/mf-backend/projects` },
            { name: 'Health check', url: `${BASE_URL}/functions/v1/mf-backend/health` }
        ];
        
        for (const endpoint of endpoints) {
            await checkEndpoint(endpoint.name, endpoint.url);
        }
    }

    // Summary
    colorLog('\n📊 DIAGNOSIS SUMMARY:', 'bright');
    colorLog('===================', 'bright');
    
    if (workingFunctions.length > 0) {
        colorLog(`\n✅ Working functions: ${workingFunctions.length}`, 'green');
        workingFunctions.forEach(f => colorLog(`   - ${f}`, 'green'));
    }
    
    if (conflictingFunctions.length > 0) {
        colorLog(`\n⚠️  Conflicting functions: ${conflictingFunctions.length}`, 'yellow');
        conflictingFunctions.forEach(f => colorLog(`   - ${f}`, 'yellow'));
        
        colorLog('\n🔧 ACTION REQUIRED:', 'red');
        colorLog('Delete these conflicting functions from your Supabase dashboard!', 'red');
        colorLog(`Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/functions`, 'cyan');
    }
    
    if (workingFunctions.length === 0) {
        colorLog('\n❌ NO WORKING FUNCTIONS FOUND', 'red');
        colorLog('You need to deploy the mf-backend function:', 'yellow');
        colorLog('1. Clean up conflicting functions first', 'yellow');
        colorLog('2. Deploy: supabase functions deploy mf-backend', 'yellow');
        colorLog('3. Set environment variables', 'yellow');
    }

    // Check if database is accessible
    colorLog('\n🗄️  Database Status:', 'bright');
    colorLog('Since you got "relation projects already exists", your database is set up!', 'green');
    colorLog('✅ Tables already exist - no need to recreate them', 'green');

    // Final recommendations
    colorLog('\n🎯 NEXT STEPS:', 'bright');
    
    if (conflictingFunctions.length > 0) {
        colorLog('1. 🧹 DELETE conflicting functions from Supabase dashboard', 'yellow');
        colorLog('2. 🚀 Keep only mf-backend function', 'yellow');
        colorLog('3. 🔑 Set your service role key as environment variable', 'yellow');
        colorLog('4. 🧪 Test again', 'yellow');
    } else if (workingFunctions.length > 0) {
        colorLog('1. ✅ Functions look good!', 'green');
        colorLog('2. 🔑 Make sure service role key is set', 'yellow');
        colorLog('3. 🧪 Test your React app', 'green');
    } else {
        colorLog('1. 🚀 Deploy mf-backend function', 'yellow');
        colorLog('2. 🔑 Set environment variables', 'yellow');
        colorLog('3. 🧪 Test endpoints', 'yellow');
    }

    colorLog('\n🌳 Verification completed!', 'bright');
}

main().catch(console.error);