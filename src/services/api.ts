import { apiRequest, getLocalStorageItem, setLocalStorageItem } from '../utils/database';
import type { Project } from '../hooks/useProjects';
import type { SocialProject } from '../hooks/useSocialProjects';
import type { Certificate } from '../hooks/useCertificates';
import type { Donation } from '../hooks/useDonations';

// User API
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  address?: any;
  created_at: string;
  preferences?: any;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class UserAPI {
  static async login(email: string, password: string): Promise<{ data: AuthResponse | null; error: string | null }> {
    const result = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }, 5); // 5 retry attempts for critical operations like login

    if (result.data) {
      setLocalStorageItem('minha_floresta_auth_token', result.data.token);
      setLocalStorageItem('minha_floresta_user', result.data.user);
      console.log('✅ User logged in successfully');
    }

    return result;
  }

  static async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    cpf?: string;
  }): Promise<{ data: AuthResponse | null; error: string | null }> {
    const result = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (result.data) {
      setLocalStorageItem('minha_floresta_auth_token', result.data.token);
      setLocalStorageItem('minha_floresta_user', result.data.user);
    }

    return result;
  }

  static async updateProfile(userId: string, updates: Partial<User>): Promise<{ data: User | null; error: string | null }> {
    const token = getLocalStorageItem('minha_floresta_auth_token', '');
    
    const result = await apiRequest<User>(`/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (result.data) {
      setLocalStorageItem('minha_floresta_user', result.data);
    }

    return result;
  }

  static logout(): void {
    localStorage.removeItem('minha_floresta_auth_token');
    localStorage.removeItem('minha_floresta_user');
  }

  static getCurrentUser(): User | null {
    return getLocalStorageItem('minha_floresta_user', null);
  }

  static getAuthToken(): string | null {
    return getLocalStorageItem('minha_floresta_auth_token', null);
  }
}

// Projects API
export class ProjectsAPI {
  static async getAll(): Promise<{ data: Project[] | null; error: string | null }> {
    try {
      const result = await apiRequest<Project[]>('/projects', {}, 3); // 3 retry attempts
      
      if (result.data) {
        setLocalStorageItem('minha_floresta_projects', result.data);
        console.log(`✅ Loaded ${result.data.length} projects from database`);
        return result;
      }
    } catch (error) {
      console.log('⚠️ Database unavailable, using cached projects');
    }

    // Fallback to localStorage
    const localProjects = getLocalStorageItem('minha_floresta_projects', []);
    console.log(`📱 Using ${localProjects.length} cached projects`);
    return { data: localProjects, error: 'Using cached data' };
  }

  static async getById(id: string): Promise<{ data: Project | null; error: string | null }> {
    const result = await apiRequest<Project>(`/projects/${id}`);
    
    if (result.error) {
      // Fallback to localStorage
      const projects = getLocalStorageItem('minha_floresta_projects', []);
      const project = projects.find((p: Project) => p.id === id);
      return { data: project || null, error: project ? null : 'Project not found' };
    }

    return result;
  }

  static async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Project | null; error: string | null }> {
    const token = UserAPI.getAuthToken();
    
    const result = await apiRequest<Project>('/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(project)
    });

    if (result.data) {
      // Update local cache
      const projects = getLocalStorageItem('minha_floresta_projects', []);
      projects.push(result.data);
      setLocalStorageItem('minha_floresta_projects', projects);
    }

    return result;
  }

  static async update(id: string, updates: Partial<Project>): Promise<{ data: Project | null; error: string | null }> {
    const token = UserAPI.getAuthToken();
    
    const result = await apiRequest<Project>(`/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (result.data) {
      // Update local cache
      const projects = getLocalStorageItem('minha_floresta_projects', []);
      const index = projects.findIndex((p: Project) => p.id === id);
      if (index !== -1) {
        projects[index] = result.data;
        setLocalStorageItem('minha_floresta_projects', projects);
      }
    }

    return result;
  }

  static async updateAvailableArea(id: string, purchasedArea: number): Promise<{ data: boolean; error: string | null }> {
    const result = await apiRequest<{ success: boolean }>(`/projects/${id}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ area: purchasedArea })
    });

    if (result.data?.success) {
      // Update local cache
      const projects = getLocalStorageItem('minha_floresta_projects', []);
      const project = projects.find((p: Project) => p.id === id);
      if (project) {
        project.available -= purchasedArea;
        project.sold += purchasedArea;
        setLocalStorageItem('minha_floresta_projects', projects);
      }
      return { data: true, error: null };
    }

    return { data: false, error: result.error };
  }
}

// Social Projects API
export class SocialProjectsAPI {
  static async getAll(): Promise<{ data: SocialProject[] | null; error: string | null }> {
    const result = await apiRequest<SocialProject[]>('/social-projects');
    
    if (result.data) {
      setLocalStorageItem('minha_floresta_social_projects', result.data);
      return result;
    }

    // Fallback to localStorage
    const localProjects = getLocalStorageItem('minha_floresta_social_projects', []);
    return { data: localProjects, error: result.error };
  }

  static async getById(id: string): Promise<{ data: SocialProject | null; error: string | null }> {
    const result = await apiRequest<SocialProject>(`/social-projects/${id}`);
    
    if (result.error) {
      // Fallback to localStorage
      const projects = getLocalStorageItem('minha_floresta_social_projects', []);
      const project = projects.find((p: SocialProject) => p.id === id);
      return { data: project || null, error: project ? null : 'Social project not found' };
    }

    return result;
  }

  static async addDonation(projectId: string, amount: number): Promise<{ data: boolean; error: string | null }> {
    const result = await apiRequest<{ success: boolean }>(`/social-projects/${projectId}/donate`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    });

    if (result.data?.success) {
      // Update local cache
      const projects = getLocalStorageItem('minha_floresta_social_projects', []);
      const project = projects.find((p: SocialProject) => p.id === projectId);
      if (project) {
        project.donationsReceived += amount;
        setLocalStorageItem('minha_floresta_social_projects', projects);
      }
      return { data: true, error: null };
    }

    return { data: false, error: result.error };
  }
}

// Transactions API
export interface Transaction {
  id: string;
  user_id: string;
  project_id: string;
  amount: number;
  area_purchased: number;
  payment_method: 'pix' | 'credit_card' | 'boleto' | 'bank_transfer';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transaction_data: any;
  created_at: string;
  completed_at?: string;
}

export class TransactionsAPI {
  static async create(transactionData: {
    project_id: string;
    amount: number;
    area_purchased: number;
    payment_method: string;
    user_data: any;
  }): Promise<{ data: Transaction | null; error: string | null }> {
    const token = UserAPI.getAuthToken();
    
    const result = await apiRequest<Transaction>('/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData)
    });

    if (result.data) {
      // Store in local transactions
      const transactions = getLocalStorageItem('minha_floresta_transactions', []);
      transactions.push(result.data);
      setLocalStorageItem('minha_floresta_transactions', transactions);
      
      return result;
    }

    // If API fails, store as pending transaction
    const pendingTransaction = {
      id: `pending_${Date.now()}`,
      ...transactionData,
      created_at: new Date().toISOString(),
      payment_status: 'pending'
    };

    const pendingTransactions = getLocalStorageItem('minha_floresta_pending_transactions', []);
    pendingTransactions.push(pendingTransaction);
    setLocalStorageItem('minha_floresta_pending_transactions', pendingTransactions);

    return { data: pendingTransaction as Transaction, error: null };
  }

  static async getByUser(userId: string): Promise<{ data: Transaction[] | null; error: string | null }> {
    const token = UserAPI.getAuthToken();
    
    const result = await apiRequest<Transaction[]>(`/users/${userId}/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (result.error) {
      // Fallback to localStorage
      const transactions = getLocalStorageItem('minha_floresta_transactions', []);
      const userTransactions = transactions.filter((t: Transaction) => t.user_id === userId);
      return { data: userTransactions, error: null };
    }

    return result;
  }

  static async updateStatus(id: string, status: Transaction['payment_status']): Promise<{ data: boolean; error: string | null }> {
    const result = await apiRequest<{ success: boolean }>(`/transactions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });

    if (result.data?.success) {
      // Update local cache
      const transactions = getLocalStorageItem('minha_floresta_transactions', []);
      const transaction = transactions.find((t: Transaction) => t.id === id);
      if (transaction) {
        transaction.payment_status = status;
        if (status === 'completed') {
          transaction.completed_at = new Date().toISOString();
        }
        setLocalStorageItem('minha_floresta_transactions', transactions);
      }
      return { data: true, error: null };
    }

    return { data: false, error: result.error };
  }
}

// Certificates API
export class CertificatesAPI {
  static async getByUser(userId: string): Promise<{ data: Certificate[] | null; error: string | null }> {
    const token = UserAPI.getAuthToken();
    
    const result = await apiRequest<Certificate[]>(`/users/${userId}/certificates`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (result.error) {
      // Fallback to localStorage
      const certificates = getLocalStorageItem('minha_floresta_certificates', []);
      const userCertificates = certificates.filter((c: Certificate) => c.userId === userId);
      return { data: userCertificates, error: null };
    }

    return result;
  }

  static async getByNumber(certificateNumber: string): Promise<{ data: Certificate | null; error: string | null }> {
    const result = await apiRequest<Certificate>(`/certificates/${certificateNumber}`);
    
    if (result.error) {
      // Fallback to localStorage
      const certificates = getLocalStorageItem('minha_floresta_certificates', []);
      const certificate = certificates.find((c: Certificate) => c.certificateNumber === certificateNumber);
      return { data: certificate || null, error: certificate ? null : 'Certificate not found' };
    }

    return result;
  }

  static async create(certificateData: {
    user_id: string;
    transaction_id: string;
    project_id: string;
    area_m2: number;
    certificate_type: 'digital' | 'physical';
  }): Promise<{ data: Certificate | null; error: string | null }> {
    const token = UserAPI.getAuthToken();
    
    const result = await apiRequest<Certificate>('/certificates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(certificateData)
    });

    if (result.data) {
      // Store in local certificates
      const certificates = getLocalStorageItem('minha_floresta_certificates', []);
      certificates.push(result.data);
      setLocalStorageItem('minha_floresta_certificates', certificates);
    }

    return result;
  }
}

// Donations API
export class DonationsAPI {
  static async create(donationData: {
    donor_name: string;
    donor_email: string;
    donor_phone?: string;
    social_project_id: string;
    amount: number;
    payment_method: 'pix' | 'credit_card' | 'boleto';
    message?: string;
    is_anonymous: boolean;
  }): Promise<{ data: Donation | null; error: string | null }> {
    const result = await apiRequest<Donation>('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData)
    });

    if (result.data) {
      // Store in local donations
      const donations = getLocalStorageItem('minha_floresta_donations', []);
      donations.push(result.data);
      setLocalStorageItem('minha_floresta_donations', donations);
      
      return result;
    }

    // If API fails, store as pending donation
    const pendingDonation = {
      id: `pending_${Date.now()}`,
      ...donationData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const pendingDonations = getLocalStorageItem('minha_floresta_pending_donations', []);
    pendingDonations.push(pendingDonation);
    setLocalStorageItem('minha_floresta_pending_donations', pendingDonations);

    return { data: pendingDonation as Donation, error: null };
  }

  static async getByProject(projectId: string): Promise<{ data: Donation[] | null; error: string | null }> {
    const result = await apiRequest<Donation[]>(`/social-projects/${projectId}/donations`);
    
    if (result.error) {
      // Fallback to localStorage
      const donations = getLocalStorageItem('minha_floresta_donations', []);
      const projectDonations = donations.filter((d: Donation) => d.socialProjectId === projectId);
      return { data: projectDonations, error: null };
    }

    return result;
  }

  static async getStats(): Promise<{ data: { totalAmount: number; totalCount: number; averageAmount: number } | null; error: string | null }> {
    const result = await apiRequest<{ totalAmount: number; totalCount: number; averageAmount: number }>('/donations/stats');
    
    if (result.error) {
      // Calculate from localStorage
      const donations = getLocalStorageItem('minha_floresta_donations', []);
      const totalAmount = donations.reduce((sum: number, d: Donation) => sum + d.amount, 0);
      const totalCount = donations.length;
      const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;
      
      return { 
        data: { totalAmount, totalCount, averageAmount }, 
        error: null 
      };
    }

    return result;
  }
}

// System API
export class SystemAPI {
  static async getSettings(): Promise<{ data: Record<string, any> | null; error: string | null }> {
    const result = await apiRequest<Record<string, any>>('/system/settings');
    
    if (result.data) {
      setLocalStorageItem('minha_floresta_system_settings', result.data);
      return result;
    }

    // Fallback to localStorage or defaults
    const localSettings = getLocalStorageItem('minha_floresta_system_settings', {
      platform_name: 'Minha Floresta Conservações',
      contact_email: 'contato@minhaflorestaconservacoes.com',
      processing_fee_percent: 3.5,
      certificate_prefix: 'MFC',
      certificate_validity_years: 30,
      physical_delivery_fee: 15.00,
      co2_per_m2_kg: 22,
      trees_per_m2: 0.1,
      survival_rate_percent: 85,
      payment_methods: {
        pix: true,
        credit_card: true,
        boleto: true,
        bank_transfer: false
      }
    });

    return { data: localSettings, error: result.error };
  }

  static async updateSetting(key: string, value: any): Promise<{ data: boolean; error: string | null }> {
    const token = UserAPI.getAuthToken();
    
    const result = await apiRequest<{ success: boolean }>('/system/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ key, value })
    });

    if (result.data?.success) {
      // Update local cache
      const settings = getLocalStorageItem('minha_floresta_system_settings', {});
      settings[key] = value;
      setLocalStorageItem('minha_floresta_system_settings', settings);
      return { data: true, error: null };
    }

    return { data: false, error: result.error };
  }

  static async healthCheck(): Promise<{ data: { status: string; database: boolean; timestamp: string } | null; error: string | null }> {
    const result = await apiRequest<{ status: string; database: boolean; timestamp: string }>('/health');
    return result;
  }
}