/**
 * 🌱 Minha Floresta Conservações - Serviço de Limpeza
 * 
 * Serviço para limpeza completa dos dados do Supabase
 */

import { supabase, edgeFunctionUrl, apiRequest } from './supabaseClient';

// =====================================
// 🎯 TYPES & INTERFACES
// =====================================

export interface CleanupResults {
  success: boolean;
  message: string;
  details: {
    supabase: {
      projects: number;
      project_images: number;
      social_projects: number;
      cart_items: number;
      certificates: number;
      donations: number;
      carbon_calculations: number;
      purchases: number;
      purchase_items: number;
      errors: string[];
    };
    localStorage: number;
    timestamp: string;
  };
  totalRemoved: number;
}

export interface CleanupOptions {
  includeSupabase?: boolean;
  includeLocalStorage?: boolean;
  confirmDeletion?: boolean;
  tables?: string[];
}

// =====================================
// 🧹 CLEANUP SERVICE CLASS
// =====================================

export class CleanupService {
  
  // =====================================
  // 🗑️ LIMPEZA COMPLETA DO SISTEMA
  // =====================================
  
  async cleanAll(options: CleanupOptions = {}): Promise<CleanupResults> {
    const {
      includeSupabase = true,
      includeLocalStorage = true,
      confirmDeletion = true
    } = options;

    try {
      console.log('🧹 Iniciando limpeza completa do sistema...');

      // Confirmação do usuário
      if (confirmDeletion) {
        const confirmed = confirm(
          '⚠️ ATENÇÃO: LIMPEZA COMPLETA DO SISTEMA\n\n' +
          'Isso irá remover PERMANENTEMENTE:\n\n' +
          '• Todos os projetos e imagens\n' +
          '• Todos os projetos sociais\n' +
          '• Todos os itens do carrinho\n' +
          '• Todos os certificados\n' +
          '• Todas as doações\n' +
          '• Todos os cálculos\n' +
          '• Todas as compras\n' +
          '• Cache local\n\n' +
          'Esta ação NÃO PODE SER DESFEITA!\n\n' +
          'Tem certeza que deseja continuar?'
        );

        if (!confirmed) {
          return {
            success: false,
            message: 'Limpeza cancelada pelo usuário',
            details: {
              supabase: {
                projects: 0,
                project_images: 0,
                social_projects: 0,
                cart_items: 0,
                certificates: 0,
                donations: 0,
                carbon_calculations: 0,
                purchases: 0,
                purchase_items: 0,
                errors: []
              },
              localStorage: 0,
              timestamp: new Date().toISOString()
            },
            totalRemoved: 0
          };
        }
      }

      const results: CleanupResults = {
        success: true,
        message: '',
        details: {
          supabase: {
            projects: 0,
            project_images: 0,
            social_projects: 0,
            cart_items: 0,
            certificates: 0,
            donations: 0,
            carbon_calculations: 0,
            purchases: 0,
            purchase_items: 0,
            errors: []
          },
          localStorage: 0,
          timestamp: new Date().toISOString()
        },
        totalRemoved: 0
      };

      // =====================================
      // 🗄️ LIMPEZA DO SUPABASE
      // =====================================

      if (includeSupabase) {
        try {
          console.log('🗄️ Limpando dados do Supabase via Edge Function...');
          
          const cleanupResponse = await apiRequest(
            edgeFunctionUrl('clean-all-data'),
            { method: 'POST' }
          );

          if (cleanupResponse.success) {
            results.details.supabase = {
              projects: cleanupResponse.details?.supabase?.projects || 0,
              project_images: cleanupResponse.details?.supabase?.project_images || 0,
              social_projects: cleanupResponse.details?.supabase?.social_projects || 0,
              cart_items: cleanupResponse.details?.supabase?.cart_items || 0,
              certificates: cleanupResponse.details?.supabase?.certificates || 0,
              donations: cleanupResponse.details?.supabase?.donations || 0,
              carbon_calculations: cleanupResponse.details?.supabase?.carbon_calculations || 0,
              purchases: cleanupResponse.details?.supabase?.purchases || 0,
              purchase_items: cleanupResponse.details?.supabase?.purchase_items || 0,
              errors: []
            };
            console.log('✅ Supabase limpo com sucesso');
          } else {
            throw new Error(cleanupResponse.message || 'Erro ao limpar Supabase');
          }
        } catch (error) {
          console.error('❌ Erro na limpeza do Supabase:', error);
          results.details.supabase.errors.push(
            error instanceof Error ? error.message : 'Erro desconhecido'
          );
          results.success = false;
        }
      }

      // =====================================
      // 🗃️ LIMPEZA DO LOCALSTORAGE
      // =====================================

      if (includeLocalStorage) {
        try {
          console.log('🗃️ Limpando localStorage...');
          const localStorageCount = await this.cleanLocalStorage();
          results.details.localStorage = localStorageCount;
          console.log(`✅ localStorage limpo: ${localStorageCount} itens removidos`);
        } catch (error) {
          console.error('❌ Erro na limpeza do localStorage:', error);
          results.details.supabase.errors.push('Erro ao limpar localStorage');
        }
      }

      // =====================================
      // 📊 CALCULAR TOTAIS
      // =====================================

      results.totalRemoved = 
        results.details.supabase.projects +
        results.details.supabase.project_images +
        results.details.supabase.social_projects +
        results.details.supabase.cart_items +
        results.details.supabase.certificates +
        results.details.supabase.donations +
        results.details.supabase.carbon_calculations +
        results.details.supabase.purchases +
        results.details.supabase.purchase_items +
        results.details.localStorage;

      results.message = results.success
        ? `✅ Limpeza concluída com sucesso! ${results.totalRemoved} registros removidos.`
        : `⚠️ Limpeza concluída com ${results.details.supabase.errors.length} erro(s). ${results.totalRemoved} registros removidos.`;

      console.log('🎉 Limpeza finalizada:', results);
      return results;

    } catch (error) {
      console.error('❌ Erro crítico na limpeza:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido na limpeza',
        details: {
          supabase: {
            projects: 0,
            project_images: 0,
            social_projects: 0,
            cart_items: 0,
            certificates: 0,
            donations: 0,
            carbon_calculations: 0,
            purchases: 0,
            purchase_items: 0,
            errors: [error instanceof Error ? error.message : 'Erro desconhecido']
          },
          localStorage: 0,
          timestamp: new Date().toISOString()
        },
        totalRemoved: 0
      };
    }
  }

  // =====================================
  // 🗃️ LIMPEZA ESPECÍFICA DO LOCALSTORAGE
  // =====================================

  private async cleanLocalStorage(): Promise<number> {
    try {
      const keysToRemove: string[] = [];
      
      // Identificar chaves relacionadas ao app
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('minha_floresta_') ||
          key.startsWith('cart_') ||
          key.startsWith('user_') ||
          key.startsWith('project_') ||
          key.startsWith('certificate_') ||
          key.startsWith('donation_') ||
          key.startsWith('calculation_')
        )) {
          keysToRemove.push(key);
        }
      }

      // Remover as chaves identificadas
      keysToRemove.forEach(key => localStorage.removeItem(key));

      return keysToRemove.length;
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
      return 0;
    }
  }

  // =====================================
  // 🗑️ LIMPEZA DE TABELA ESPECÍFICA
  // =====================================

  async cleanTable(tableName: string): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      console.log(`🗑️ Limpando tabela: ${tableName}`);

      const { error, count } = await supabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) {
        console.error(`Erro ao limpar tabela ${tableName}:`, error);
        return { success: false, count: 0, error: error.message };
      }

      console.log(`✅ Tabela ${tableName} limpa: ${count || 0} registros removidos`);
      return { success: true, count: count || 0 };
    } catch (error) {
      console.error(`Erro ao limpar tabela ${tableName}:`, error);
      return { 
        success: false, 
        count: 0, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // =====================================
  // 📊 VERIFICAR STATUS DO SISTEMA
  // =====================================

  async getSystemStatus(): Promise<{
    supabase: {
      connected: boolean;
      tables: Record<string, number>;
    };
    localStorage: {
      itemCount: number;
      keys: string[];
    };
  }> {
    const status = {
      supabase: {
        connected: false,
        tables: {} as Record<string, number>
      },
      localStorage: {
        itemCount: 0,
        keys: [] as string[]
      }
    };

    try {
      // Verificar Supabase
      const tables = [
        'projects',
        'project_images',
        'social_projects',
        'cart_items',
        'certificates',
        'donations',
        'carbon_calculations',
        'purchases',
        'purchase_items'
      ];

      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          status.supabase.tables[table] = count || 0;
          status.supabase.connected = true;
        }
      }

      // Verificar localStorage
      const appKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('minha_floresta_')) {
          appKeys.push(key);
        }
      }
      status.localStorage.itemCount = appKeys.length;
      status.localStorage.keys = appKeys;

    } catch (error) {
      console.error('Erro ao verificar status do sistema:', error);
    }

    return status;
  }
}

// =====================================
// 🎯 EXPORT SINGLETON INSTANCE
// =====================================

export const cleanupService = new CleanupService();
export default cleanupService;
