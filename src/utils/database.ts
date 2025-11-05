// Database configuration and connection utilities
import { projectId, publicAnonKey } from './supabase/info';
export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

export const DATABASE_CONFIG: DatabaseConfig = {
  host: 'sql10.freesqldatabase.com', // ou o host fornecido pelo seu provedor
  user: 'u271208684_minhafloresta',
  password: 'B7Jz/vu~4s|Q',
  database: 'u271208684_minhafloresta',
  port: 3306
};

// Base API URL - using Supabase Edge Functions (derived from current projectId)
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/mf-backend`;

// Enhanced API request helper with robust retry logic and extended timeouts
export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {},
  retries: number = 3
): Promise<{ data: T | null; error: string | null }> {
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout (extended to 15 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Success - log if this was a retry
      if (attempt > 1) {
        console.log(`✅ API request succeeded on attempt ${attempt}`);
      }
      
      return { data, error: null };
      
    } catch (error) {
      console.log(`❌ API request attempt ${attempt}/${retries} failed:`, error instanceof Error ? error.message : 'Unknown error');
      
      // If this was the last attempt, handle the error
      if (attempt === retries) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.log('🕒 Request timed out after 15 seconds - backend may be slow');
            return { data: null, error: 'Request timeout - please try again' };
          }
          if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
            console.log('🔌 Network error - checking if backend is available');
            return { data: null, error: 'Network error - please check your connection' };
          }
        }
        
        console.log('🚨 All retry attempts failed, falling back to offline mode');
        return { 
          data: null, 
          error: 'Service temporarily unavailable - using offline mode'
        };
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(Math.pow(2, attempt) * 1000, 5000); // Max 5 second delay
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached
  return { data: null, error: 'Unexpected error in API request' };
}

// Fallback to localStorage when API is unavailable
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

export function setLocalStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
}

// Data synchronization utilities
export class DataSync {
  private static syncInProgress = false;
  private static lastSyncTime = 0;
  private static readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

  static async syncIfNeeded(): Promise<void> {
    const now = Date.now();
    if (
      this.syncInProgress || 
      (now - this.lastSyncTime) < this.SYNC_INTERVAL
    ) {
      return;
    }

    this.syncInProgress = true;
    this.lastSyncTime = now;

    try {
      await this.performSync();
    } catch (error) {
      // Silently handle sync failures when backend is not available
      // This is expected behavior when running in offline mode
    } finally {
      this.syncInProgress = false;
    }
  }

  private static async performSync(): Promise<void> {
    // Sync pending transactions
    await this.syncPendingTransactions();
    
    // Sync user data
    await this.syncUserData();
    
    // Pull latest data
    await this.pullLatestData();
  }

  private static async syncPendingTransactions(): Promise<void> {
    const pendingTransactions = getLocalStorageItem('minha_floresta_pending_transactions', []);
    
    for (const transaction of pendingTransactions) {
      try {
        const { error } = await apiRequest('/transactions', {
          method: 'POST',
          body: JSON.stringify(transaction)
        });
        
        if (!error) {
          // Remove from pending
          const updated = pendingTransactions.filter((t: any) => t.id !== transaction.id);
          setLocalStorageItem('minha_floresta_pending_transactions', updated);
        }
      } catch (error) {
        // Silently handle sync failures
      }
    }
  }

  private static async syncUserData(): Promise<void> {
    // Sync user preferences, cart, etc.
    const userData = getLocalStorageItem('minha_floresta_user_data', {});
    
    if (Object.keys(userData).length > 0) {
      try {
        await apiRequest('/user/sync', {
          method: 'POST',
          body: JSON.stringify(userData)
        });
      } catch (error) {
        // Silently handle sync failures
      }
    }
  }

  private static async pullLatestData(): Promise<void> {
    try {
      // Pull latest projects
      const { data: projects } = await apiRequest('/projects');
      if (projects) {
        setLocalStorageItem('minha_floresta_projects', projects);
      }

      // Pull latest social projects
      const { data: socialProjects } = await apiRequest('/social-projects');
      if (socialProjects) {
        setLocalStorageItem('minha_floresta_social_projects', socialProjects);
      }
    } catch (error) {
      // Silently handle data pull failures
    }
  }
}

// Initialize sync on app start
export function initializeDataSync(): void {
  // Initial sync
  setTimeout(() => DataSync.syncIfNeeded(), 1000);
  
  // Periodic sync
  setInterval(() => DataSync.syncIfNeeded(), 5 * 60 * 1000);
  
  // Sync on window focus
  window.addEventListener('focus', () => DataSync.syncIfNeeded());
  
  // Sync before unload
  window.addEventListener('beforeunload', () => {
    // Quick sync for critical data
    const pendingTransactions = getLocalStorageItem('minha_floresta_pending_transactions', []);
    if (pendingTransactions.length > 0) {
      navigator.sendBeacon(`${API_BASE_URL}/transactions/batch`, 
        JSON.stringify(pendingTransactions)
      );
    }
  });
}