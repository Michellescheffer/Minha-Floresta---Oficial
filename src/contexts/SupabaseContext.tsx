/**
 * 🌱 Minha Floresta Conservações - Supabase Context
 * 
 * Context provider simplificado usando apenas Supabase
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '../services/supabaseClient';

// =====================================
// 🎯 TYPES E INTERFACES
// =====================================

export interface SupabaseContextType {
  supabase: SupabaseClient;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Helper methods
  refetch: () => Promise<void>;
}

// =====================================
// 🔧 CONTEXT CREATION
// =====================================

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// =====================================
// 🌟 PROVIDER COMPONENT
// =====================================

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  // Use the singleton Supabase client to avoid multiple GoTrueClient instances
  const supabase = supabaseClient;

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =====================================
  // 🔄 CONNECTION CHECK
  // =====================================

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simple connectivity test - use projects table which always exists
      const { error: testError } = await supabase
        .from('projects')
        .select('id')
        .limit(1);

      if (testError) {
        console.warn('Supabase connection check failed:', testError);
        setIsConnected(false);
        setError(testError.message);
      } else {
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Error checking Supabase connection:', err);
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================
  // 🚀 INITIALIZATION
  // =====================================

  useEffect(() => {
    console.log('🚀 Inicializando Supabase Context...');
    checkConnection();

    // Online/offline listeners
    const handleOnline = () => {
      console.log('🌐 Online - reconnecting to Supabase');
      checkConnection();
    };

    const handleOffline = () => {
      console.log('📴 Offline - Supabase disconnected');
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // =====================================
  // 📦 CONTEXT VALUE
  // =====================================

  const value: SupabaseContextType = {
    supabase,
    isConnected,
    isLoading,
    error,
    refetch: checkConnection
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

// =====================================
// 🪝 HOOK EXPORT
// =====================================

export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context;
};

export default SupabaseContext;
