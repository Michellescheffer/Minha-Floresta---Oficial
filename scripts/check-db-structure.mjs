import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ngnybwsovjignsflrhyr.supabase.co';
const SUPABASE_SERVICE_KEY = '***REMOVED***';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔍 Verificando estrutura das tabelas...\n');

// Check certificates table
console.log('📋 TABELA: certificates');
console.log('─'.repeat(50));
try {
  const { data, error } = await supabase.from('certificates').select('*').limit(1);
  if (error) {
    console.log('❌ Erro:', error.message);
  } else {
    if (data && data.length > 0) {
      console.log('✅ Colunas encontradas:');
      Object.keys(data[0]).forEach(col => {
        console.log(`   - ${col}: ${typeof data[0][col]}`);
      });
    } else {
      console.log('⚠️  Tabela vazia, tentando schema...');
    }
  }
  
  const { count } = await supabase.from('certificates').select('*', { count: 'exact', head: true });
  console.log(`📊 Total de registros: ${count || 0}\n`);
} catch (e) {
  console.log('❌ Erro ao acessar certificates:', e.message, '\n');
}

// Check sales table
console.log('📋 TABELA: sales');
console.log('─'.repeat(50));
try {
  const { data, error } = await supabase.from('sales').select('*').limit(1);
  if (error) {
    console.log('❌ Erro:', error.message);
  } else {
    if (data && data.length > 0) {
      console.log('✅ Colunas encontradas:');
      Object.keys(data[0]).forEach(col => {
        console.log(`   - ${col}: ${typeof data[0][col]}`);
      });
    } else {
      console.log('⚠️  Tabela vazia');
    }
  }
  
  const { count } = await supabase.from('sales').select('*', { count: 'exact', head: true });
  console.log(`📊 Total de registros: ${count || 0}\n`);
} catch (e) {
  console.log('❌ Erro ao acessar sales:', e.message, '\n');
}

// Check projects table
console.log('📋 TABELA: projects');
console.log('─'.repeat(50));
try {
  const { data, error } = await supabase.from('projects').select('*').limit(1);
  if (error) {
    console.log('❌ Erro:', error.message);
  } else {
    if (data && data.length > 0) {
      console.log('✅ Colunas encontradas:');
      Object.keys(data[0]).forEach(col => {
        console.log(`   - ${col}: ${typeof data[0][col]} = ${JSON.stringify(data[0][col]).substring(0, 50)}`);
      });
    } else {
      console.log('⚠️  Tabela vazia');
    }
  }
  
  const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true });
  console.log(`📊 Total de registros: ${count || 0}\n`);
} catch (e) {
  console.log('❌ Erro ao acessar projects:', e.message, '\n');
}

// Check site_images table
console.log('📋 TABELA: site_images');
console.log('─'.repeat(50));
try {
  const { data, error } = await supabase.from('site_images').select('*').limit(1);
  if (error) {
    console.log('❌ Erro:', error.message);
  } else {
    if (data && data.length > 0) {
      console.log('✅ Colunas encontradas:');
      Object.keys(data[0]).forEach(col => {
        console.log(`   - ${col}`);
      });
    } else {
      console.log('⚠️  Tabela vazia');
    }
  }
  
  const { count } = await supabase.from('site_images').select('*', { count: 'exact', head: true });
  console.log(`📊 Total de registros: ${count || 0}\n`);
} catch (e) {
  console.log('❌ Erro ao acessar site_images:', e.message, '\n');
}

// Check certificate_images table
console.log('📋 TABELA: certificate_images');
console.log('─'.repeat(50));
try {
  const { data, error } = await supabase.from('certificate_images').select('*').limit(1);
  if (error) {
    console.log('❌ Erro:', error.message);
  } else {
    if (data && data.length > 0) {
      console.log('✅ Colunas encontradas:');
      Object.keys(data[0]).forEach(col => {
        console.log(`   - ${col}`);
      });
    } else {
      console.log('⚠️  Tabela vazia');
    }
  }
  
  const { count } = await supabase.from('certificate_images').select('*', { count: 'exact', head: true });
  console.log(`📊 Total de registros: ${count || 0}\n`);
} catch (e) {
  console.log('❌ Erro ao acessar certificate_images:', e.message, '\n');
}

console.log('✅ Verificação concluída!');
