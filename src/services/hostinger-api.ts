/**
 * API service configurado especificamente para Hostinger
 * Detecta automaticamente Node.js ou PHP e usa o melhor disponível
 */

// URLs da API
const API_NODEJS_URL = 'https://minhafloresta.ampler.me/backend';
const API_PHP_URL = 'https://minhafloresta.ampler.me/backend/api';
const API_LOCAL_URL = 'http://localhost:8080/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

class HostingerAPIService {
  private nodeApiUrl: string;
  private phpApiUrl: string;
  private localApiUrl: string;
  private usePhp: boolean = false;
  private apiDetected: boolean = false;

  constructor() {
    this.nodeApiUrl = API_NODEJS_URL;
    this.phpApiUrl = API_PHP_URL;
    this.localApiUrl = API_LOCAL_URL;
    this.detectBestApi();
  }

  private async detectBestApi(): Promise<void> {
    if (this.apiDetected) return;

    try {
      // 1. Tentar local primeiro (desenvolvimento)
      if (window.location.hostname === 'localhost') {
        const response = await fetch(`${this.localApiUrl}/status`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            this.usePhp = false;
            this.apiDetected = true;
            console.log('✅ Usando API Local Node.js');
            return;
          }
        }
      }

      // 2. Tentar API Node.js na Hostinger
      const nodeResponse = await fetch(`${this.nodeApiUrl}/status`);
      if (nodeResponse.ok) {
        const data = await nodeResponse.json();
        if (data.success && data.status === 'online') {
          this.usePhp = false;
          this.apiDetected = true;
          console.log('✅ Usando API Node.js na Hostinger');
          return;
        }
      }
    } catch (error) {
      console.log('⚠️ API Node.js não disponível, tentando PHP...');
    }

    try {
      // 3. Fallback para API PHP
      const phpResponse = await fetch(`${this.phpApiUrl}/status`);
      if (phpResponse.ok) {
        const data = await phpResponse.json();
        if (data.success) {
          this.usePhp = true;
          this.apiDetected = true;
          console.log('✅ Usando API PHP na Hostinger');
          return;
        }
      }
    } catch (error) {
      console.error('❌ Nenhuma API disponível:', error);
    }

    // Se chegou aqui, nenhuma API está disponível
    console.error('❌ Nenhuma API disponível - usando modo offline');
  }

  private getApiUrl(): string {
    if (window.location.hostname === 'localhost') {
      return this.localApiUrl;
    }
    return this.usePhp ? this.phpApiUrl : this.nodeApiUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    await this.detectBestApi();

    const url = `${this.getApiUrl()}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro de conexão'
      };
    }
  }

  // ==========================================
  // MÉTODOS PÚBLICOS DA API
  // ==========================================

  async getStatus(): Promise<ApiResponse<{ status: string; database: string; server: string }>> {
    return this.request('/status');
  }

  async getProjects(): Promise<ApiResponse<any[]>> {
    return this.request('/projects');
  }

  async getProject(id: string): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`);
  }

  async createCertificate(certificateData: {
    project_id: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone?: string;
    area_m2: number;
    total_price: number;
    payment_method?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/certificates', {
      method: 'POST',
      body: JSON.stringify(certificateData)
    });
  }

  async getCertificate(code: string): Promise<ApiResponse<any>> {
    return this.request(`/certificates/${code}`);
  }

  async calculateFootprint(footprintData: {
    transport?: {
      car_km?: number;
      plane_km?: number;
      public_km?: number;
    };
    energy?: {
      electricity_kwh?: number;
      gas_m3?: number;
    };
    consumption?: {
      food_score?: number;
      goods_score?: number;
    };
    waste?: {
      general_kg?: number;
      recyclable_kg?: number;
    };
  }): Promise<ApiResponse<{
    total_co2_kg_year: number;
    breakdown: any;
    recommended_area_m2: number;
    estimated_cost: number;
    trees_equivalent: number;
  }>> {
    return this.request('/calculate-footprint', {
      method: 'POST',
      body: JSON.stringify(footprintData)
    });
  }

  // Métodos auxiliares para compatibilidade
  async healthCheck() {
    return this.getStatus();
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.getStatus();
      return result.success;
    } catch {
      return false;
    }
  }
}

// Instância singleton
export const hostingerAPI = new HostingerAPIService();

// Exports para compatibilidade com o sistema existente
export default hostingerAPI;

// Funções auxiliares para integração
export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  const result = await hostingerAPI.request<T>(endpoint, options);
  
  return {
    data: result.success ? result.data || null : null,
    error: result.success ? null : result.error || 'Erro desconhecido'
  };
}

export async function checkApiStatus(): Promise<{ available: boolean; type: string; url: string }> {
  await hostingerAPI.detectBestApi();
  
  const status = await hostingerAPI.getStatus();
  
  return {
    available: status.success,
    type: status.data?.server || 'unknown',
    url: hostingerAPI.getApiUrl()
  };
}