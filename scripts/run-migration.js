#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://mcohgaxlxxhrbvajjsvh.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jb2hnYXhseHhocmJ2YWpqc3ZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY2OTM3MSwiZXhwIjoyMDgwMjQ1MzcxfQ.YV29B6bDoBaxzUHbOMnElfBfaaJYUudZxyuA25SIyMA';

async function runMigration() {
  try {
    const sqlFile = path.join(__dirname, '../supabase/migrations/20250113_create_image_management_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📋 Executando ${statements.length} comandos SQL...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\n[${i + 1}/${statements.length}] Executando...`);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ query: statement })
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Erro no comando ${i + 1}:`, error);
        
        // Continue mesmo com erro (algumas tabelas podem já existir)
        if (error.includes('already exists')) {
          console.log('⚠️  Tabela já existe, continuando...');
          continue;
        }
      } else {
        console.log(`✅ Comando ${i + 1} executado com sucesso`);
      }
    }
    
    console.log('\n✅ Migration concluída!');
    
    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/site_images?limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    if (checkResponse.ok) {
      console.log('✅ Tabela site_images criada com sucesso!');
    }
    
    const checkResponse2 = await fetch(`${SUPABASE_URL}/rest/v1/certificate_images?limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    if (checkResponse2.ok) {
      console.log('✅ Tabela certificate_images criada com sucesso!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
    process.exit(1);
  }
}

runMigration();
