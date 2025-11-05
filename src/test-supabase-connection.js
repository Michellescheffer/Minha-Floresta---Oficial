#!/usr/bin/env node

/**
 * 🌱 Minha Floresta - Teste de Conexão Supabase
 * 
 * Script para verificar conectividade com Supabase
 */

const PROJECT_ID = 'ngnybwsovjignsflrhyr';
const ANON_KEY = '***REMOVED***';
const BASE_URL = `https://${PROJECT_ID}.supabase.co`;
const FUNCTION_URL = `${BASE_URL}/functions/v1/make-server-1328d8b4`;

console.log('🌱 Minha Floresta - Teste de Conexão Supabase\n');
console.log('═══════════════════════════════════════════════\n');

async function testEndpoint(name, url, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'apikey': ANON_KEY
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`🔍 Testando: ${name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Method: ${method}`);
    
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (response.ok) {
      console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
      console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
      return { success: true, data };
    } else {
      console.log(`   ❌ Status: ${response.status} ${response.statusText}`);
      console.log(`   Error:`, JSON.stringify(data, null, 2).substring(0, 200));
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    console.log('');
  }
}

async function main() {
  console.log('📊 Informações de Conexão:');
  console.log(`   Project ID: ${PROJECT_ID}`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Function URL: ${FUNCTION_URL}`);
  console.log('');
  console.log('═══════════════════════════════════════════════\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Teste 1: Status Endpoint
  const statusResult = await testEndpoint(
    'Status Endpoint',
    `${FUNCTION_URL}/status`
  );
  results.tests.push({ name: 'Status', ...statusResult });
  statusResult.success ? results.passed++ : results.failed++;

  // Teste 2: Health Endpoint
  const healthResult = await testEndpoint(
    'Health Endpoint',
    `${FUNCTION_URL}/health`
  );
  results.tests.push({ name: 'Health', ...healthResult });
  healthResult.success ? results.passed++ : results.failed++;

  // Teste 3: Test Endpoint
  const testResult = await testEndpoint(
    'Test Endpoint',
    `${FUNCTION_URL}/test`
  );
  results.tests.push({ name: 'Test', ...testResult });
  testResult.success ? results.passed++ : results.failed++;

  // Teste 4: Projects Endpoint (Supabase direct)
  const projectsDirectResult = await testEndpoint(
    'Projects - Supabase REST API',
    `${BASE_URL}/rest/v1/projects?select=*&limit=5`
  );
  results.tests.push({ name: 'Projects Direct', ...projectsDirectResult });
  projectsDirectResult.success ? results.passed++ : results.failed++;

  // Teste 5: Projects via Edge Function
  const projectsFunctionResult = await testEndpoint(
    'Projects - Edge Function',
    `${FUNCTION_URL}/projects`
  );
  results.tests.push({ name: 'Projects Function', ...projectsFunctionResult });
  projectsFunctionResult.success ? results.passed++ : results.failed++;

  // Teste 6: Social Projects via Edge Function
  const socialProjectsResult = await testEndpoint(
    'Social Projects - Edge Function',
    `${FUNCTION_URL}/social-projects`
  );
  results.tests.push({ name: 'Social Projects', ...socialProjectsResult });
  socialProjectsResult.success ? results.passed++ : results.failed++;

  // Resumo
  console.log('═══════════════════════════════════════════════\n');
  console.log('📈 RESUMO DOS TESTES:\n');
  console.log(`   ✅ Passou: ${results.passed}`);
  console.log(`   ❌ Falhou: ${results.failed}`);
  console.log(`   📊 Total: ${results.tests.length}`);
  console.log('');

  if (results.passed === results.tests.length) {
    console.log('🎉 SUCESSO! Todos os testes passaram!');
    console.log('');
    console.log('✅ Conexão com Supabase está funcionando perfeitamente!');
    console.log('✅ Edge Functions estão operacionais!');
    console.log('✅ Tabelas do banco de dados estão acessíveis!');
    console.log('');
    console.log('🚀 Você pode prosseguir com a migração dos hooks!');
  } else {
    console.log('⚠️  ATENÇÃO! Alguns testes falharam.');
    console.log('');
    console.log('🔍 Testes que falharam:');
    results.tests
      .filter(t => !t.success)
      .forEach(t => {
        console.log(`   ❌ ${t.name}`);
        console.log(`      Error: ${JSON.stringify(t.error).substring(0, 100)}`);
      });
    console.log('');
    console.log('💡 Possíveis soluções:');
    console.log('   1. Verificar se as Edge Functions foram deployed');
    console.log('   2. Verificar se as migrações foram aplicadas');
    console.log('   3. Verificar políticas RLS das tabelas');
    console.log('   4. Verificar logs do Supabase Dashboard');
  }

  console.log('');
  console.log('═══════════════════════════════════════════════\n');

  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
