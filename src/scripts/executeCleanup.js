/**
 * 🌱 Minha Floresta Conservações - Script de Limpeza
 * 
 * Script para executar limpeza completa dos bancos de dados
 * antes de iniciar a Fase 2 do desenvolvimento
 */

import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';

const SUPABASE_FUNCTION_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1328d8b4`;

async function executeCleanup() {
  console.log('🧹 Iniciando limpeza completa dos bancos de dados...\n');

  try {
    // Chamada para o endpoint de limpeza completa
    const response = await fetch(`${SUPABASE_FUNCTION_URL}/clean-all-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ LIMPEZA CONCLUÍDA COM SUCESSO!\n');
      console.log(`📊 Total de registros removidos: ${result.details.total_removed}\n`);
      
      console.log('📋 DETALHES DA LIMPEZA:');
      console.log('─'.repeat(50));
      
      // Supabase
      console.log('\n🗄️ SUPABASE:');
      console.log(`  • Projetos: ${result.details.supabase.projects}`);
      console.log(`  • Imagens de projetos: ${result.details.supabase.project_images}`);
      console.log(`  • Projetos sociais: ${result.details.supabase.social_projects}`);
      console.log(`  • Itens do carrinho: ${result.details.supabase.cart_items}`);
      console.log(`  • Certificados: ${result.details.supabase.certificates}`);
      console.log(`  • Doações: ${result.details.supabase.donations}`);
      console.log(`  • Cálculos de carbono: ${result.details.supabase.carbon_calculations}`);
      console.log(`  • Compras: ${result.details.supabase.purchases}`);
      console.log(`  • Itens de compras: ${result.details.supabase.purchase_items}`);
      
      // KV Store
      console.log('\n🗃️ KV STORE:');
      console.log(`  • Projetos: ${result.details.kv_store.projects}`);
      console.log(`  • Projetos sociais: ${result.details.kv_store.social_projects}`);
      console.log(`  • Certificados: ${result.details.kv_store.certificates}`);
      console.log(`  • Doações: ${result.details.kv_store.donations}`);
      console.log(`  • Cálculos: ${result.details.kv_store.calculations}`);
      console.log(`  • Carrinhos: ${result.details.kv_store.cart_items}`);
      console.log(`  • Imagens: ${result.details.kv_store.images}`);
      
      // Erros (se houver)
      if (result.details.supabase.errors.length > 0) {
        console.log('\n⚠️ AVISOS SUPABASE:');
        result.details.supabase.errors.forEach(error => {
          console.log(`  • ${error}`);
        });
      }
      
      if (result.details.kv_store.errors.length > 0) {
        console.log('\n⚠️ AVISOS KV STORE:');
        result.details.kv_store.errors.forEach(error => {
          console.log(`  • ${error}`);
        });
      }
      
      console.log('\n─'.repeat(50));
      console.log(`🕐 Finalizado em: ${new Date(result.timestamp).toLocaleString('pt-BR')}`);
      console.log('\n🎉 Banco de dados limpo! Pronto para Fase 2.\n');
      
    } else {
      console.error('❌ ERRO NA LIMPEZA:', result.error || 'Erro desconhecido');
      if (result.details) {
        console.error('Detalhes:', result.details);
      }
    }

  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Verificar se deve executar automaticamente
if (typeof window === 'undefined') {
  // Executar se chamado diretamente via Node
  executeCleanup();
}

export { executeCleanup };