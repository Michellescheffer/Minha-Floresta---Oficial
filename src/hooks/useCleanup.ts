/**
 * 🌱 Minha Floresta Conservações - useCleanup Hook
 * 
 * Hook para acessar funcionalidades de limpeza do sistema
 */

import { useState, useCallback } from 'react';
import { cleanupService, CleanupResults, CleanupOptions } from '../services/cleanupService';

export { CleanupResults } from '../services/cleanupService';

export function useCleanup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =====================================
  // 🗑️ LIMPEZA COMPLETA
  // =====================================

  const cleanAllData = useCallback(async (options?: CleanupOptions): Promise<CleanupResults> => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await cleanupService.cleanAll(options);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao limpar dados';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =====================================
  // 🗑️ LIMPEZA DE PROJETOS
  // =====================================

  const cleanProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cleanupService.cleanTable('projects');
      const imageResult = await cleanupService.cleanTable('project_images');
      
      return {
        success: result.success && imageResult.success,
        projectsRemoved: result.count,
        imagesRemoved: imageResult.count,
        error: result.error || imageResult.error
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao limpar projetos';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =====================================
  // 🗑️ LIMPEZA DE CACHE
  // =====================================

  const cleanCache = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Limpar localStorage
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('minha_floresta_')) {
          keys.push(key);
        }
      }

      keys.forEach(key => localStorage.removeItem(key));

      return {
        success: true,
        itemsRemoved: keys.length
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao limpar cache';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =====================================
  // 📊 STATUS DOS DADOS
  // =====================================

  const getDataStatus = useCallback(async () => {
    try {
      const status = await cleanupService.getSystemStatus();
      
      return {
        hasData: Object.values(status.supabase.tables).some(count => count > 0),
        counts: {
          projects: status.supabase.tables.projects || 0,
          certificates: status.supabase.tables.certificates || 0,
          donations: status.supabase.tables.donations || 0,
          calculations: status.supabase.tables.carbon_calculations || 0,
          cartItems: status.supabase.tables.cart_items || 0,
          socialProjects: status.supabase.tables.social_projects || 0
        },
        localStorage: status.localStorage.itemCount,
        isConnected: status.supabase.connected
      };
    } catch (err) {
      console.error('Error getting data status:', err);
      return {
        hasData: false,
        counts: {
          projects: 0,
          certificates: 0,
          donations: 0,
          calculations: 0,
          cartItems: 0,
          socialProjects: 0
        },
        localStorage: 0,
        isConnected: false
      };
    }
  }, []);

  // =====================================
  // 🔌 TESTE DE CONEXÃO
  // =====================================

  const testConnection = useCallback(async () => {
    try {
      const status = await cleanupService.getSystemStatus();
      return status.supabase.connected;
    } catch (err) {
      console.error('Error testing connection:', err);
      return false;
    }
  }, []);

  // =====================================
  // 🗑️ FORCE CLEAN INDEXEDDB (Legacy - não faz nada)
  // =====================================

  const forceCleanIndexedDB = useCallback(async () => {
    // IndexedDB foi removido do sistema
    // Esta função existe apenas para compatibilidade
    console.warn('forceCleanIndexedDB: IndexedDB foi removido do sistema');
    return {
      success: true,
      message: 'IndexedDB foi removido do sistema - não há nada para limpar'
    };
  }, []);

  // =====================================
  // 🗑️ LIMPEZA DE TABELA ESPECÍFICA
  // =====================================

  const cleanTable = useCallback(async (tableName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cleanupService.cleanTable(tableName);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Erro ao limpar tabela ${tableName}`;
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,

    // Methods
    cleanAllData,
    cleanProjects,
    cleanCache,
    cleanTable,
    getDataStatus,
    testConnection,
    forceCleanIndexedDB // Legacy compatibility
  };
}

export default useCleanup;
