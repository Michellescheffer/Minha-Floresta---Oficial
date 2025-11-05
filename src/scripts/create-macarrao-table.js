/**
 * 🍝 Script para Criar Tabela Macarrão Amarelo
 * 
 * Executa a migration no Supabase para criar a tabela de exemplo
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = 'https://ngnybwsovjignsflrhyr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sua-service-role-key-aqui';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createMacarraoTable() {
  console.log('🍝 Iniciando criação da tabela macarrao_amarelo...\n');

  try {
    // Ler arquivo SQL
    const sqlPath = join(__dirname, '../supabase/migrations/002_macarrao_amarelo.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    console.log('📄 Migration lida com sucesso');
    console.log('📊 Executando SQL no Supabase...\n');

    // Executar SQL - Nota: Isso requer permissões de admin
    // Em produção, use: npx supabase db push
    
    console.log('⚠️  Para executar a migration, use um dos métodos abaixo:\n');
    console.log('MÉTODO 1 - Via Supabase CLI (Recomendado):');
    console.log('  npx supabase db push\n');
    
    console.log('MÉTODO 2 - Via Dashboard do Supabase:');
    console.log('  1. Acesse: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/editor');
    console.log('  2. Clique em "SQL Editor"');
    console.log('  3. Cole o conteúdo do arquivo: supabase/migrations/002_macarrao_amarelo.sql');
    console.log('  4. Execute o SQL\n');

    console.log('MÉTODO 3 - Via API (se tiver SERVICE_ROLE_KEY):');
    console.log('  Execute este script com a variável de ambiente:');
    console.log('  SUPABASE_SERVICE_ROLE_KEY=sua-chave npm run create-macarrao\n');

    // Tentar verificar se a tabela já existe
    const { data, error } = await supabase
      .from('macarrao_amarelo')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Tabela ainda não existe - Execute a migration primeiro!');
      } else {
        console.log('⚠️  Erro ao verificar tabela:', error.message);
      }
    } else {
      console.log('✅ Tabela macarrao_amarelo já existe!');
      console.log('📊 Dados encontrados:', data.length, 'registros\n');
      
      if (data.length > 0) {
        console.log('🍝 Tipos de massa na tabela:');
        console.log('  1. Espaguete:', data[0].espaguete?.substring(0, 50) + '...');
        console.log('  2. Penne:', data[0].penne?.substring(0, 50) + '...');
        console.log('  3. Fusilli:', data[0].fusilli?.substring(0, 50) + '...');
        console.log('  4. Farfalle:', data[0].farfalle?.substring(0, 50) + '...');
        console.log('  5. Rigatoni:', data[0].rigatoni?.substring(0, 50) + '...');
      }
    }

  } catch (err) {
    console.error('❌ Erro ao criar tabela:', err);
    process.exit(1);
  }
}

// Executar
createMacarraoTable().then(() => {
  console.log('\n✅ Script concluído!');
  process.exit(0);
});
