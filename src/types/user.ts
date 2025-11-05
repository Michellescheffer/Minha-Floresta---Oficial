export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  cpf?: string;
  address?: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  // Estatísticas do usuário
  total_purchases: number;
  total_donations: number;
  total_m2_purchased: number;
  total_co2_compensated: number;
  certificates_count: number;
  // Configurações
  preferences: {
    newsletter: boolean;
    notifications: boolean;
    language: 'pt' | 'en';
  };
}

export interface UserPurchase {
  id: string;
  userId: string;
  saleId: string;
  projectId: string;
  projectName: string;
  m2_quantity: number;
  price_per_m2: number;
  total_value: number;
  purchase_date: string;
  certificateId?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface UserDonation {
  id: string;
  userId: string;
  donationId: string;
  projectId?: string;
  projectTitle?: string;
  amount: number;
  donation_date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface UserCertificate {
  id: string;
  userId: string;
  certificateId: string;
  code: string;
  projectName: string;
  m2_quantity: number;
  co2_compensated: number;
  issue_date: string;
  valid_until: string;
  status: 'active' | 'expired' | 'cancelled';
  download_url?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  name: string;
  phone?: string;
  cpf?: string;
  address?: string;
};