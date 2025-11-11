/**
 * 🌱 Minha Floresta Conservações - Supabase Client
 * 
 * Cliente Supabase singleton para uso direto
 */

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Criar cliente Supabase
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Helper para fazer requests à Edge Function
export const edgeFunctionUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `https://${projectId}.supabase.co/functions/v1/mf-backend/${cleanPath}`;
};

// Helper para fazer requests com retry
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {},
  retries = 3
): Promise<T> {
  // Prefer authenticated user token for Edge Functions; fallback to anon key
  const { data: sessionData } = await supabase.auth.getSession();
  const bearer = sessionData?.session?.access_token || publicAnonKey;
  const defaultOptions: RequestInit = {
    headers: {
      'Authorization': `Bearer ${bearer}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Request failed (attempt ${attempt}/${retries}):`, lastError.message);

      if (attempt < retries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

export default supabase;
