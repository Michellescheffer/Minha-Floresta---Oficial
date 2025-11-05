import { useState, useEffect } from 'react';
import { DonationsAPI } from '../services/api';

export interface Donation {
  id: string;
  projectId: string;
  projectName: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: 'credit_card' | 'pix' | 'bank_slip';
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
  confirmedAt?: string;
  transactionId?: string;
  socialProjectId?: string;
}

export interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  donorCount: number;
  averageDonation: number;
}

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load from localStorage as primary source (for now)
      const localDonations = JSON.parse(localStorage.getItem('minha_floresta_donations') || '[]');
      setDonations(localDonations);

    } catch (err) {
      console.error('Error loading donations:', err);
      setError('Erro ao carregar doações');
    } finally {
      setIsLoading(false);
    }
  };

  const createDonation = async (donationData: {
    projectId: string;
    projectName: string;
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    amount: number;
    message?: string;
    isAnonymous: boolean;
    paymentMethod: 'credit_card' | 'pix' | 'bank_slip';
  }): Promise<Donation> => {
    try {
      setIsLoading(true);
      setError(null);

      // Try API first
      const { data, error: apiError } = await DonationsAPI.create({
        donor_name: donationData.donorName,
        donor_email: donationData.donorEmail,
        donor_phone: donationData.donorPhone,
        social_project_id: donationData.projectId,
        amount: donationData.amount,
        payment_method: donationData.paymentMethod as 'pix' | 'credit_card' | 'boleto',
        message: donationData.message,
        is_anonymous: donationData.isAnonymous
      });

      if (data) {
        const donation: Donation = {
          id: data.id,
          projectId: data.social_project_id || donationData.projectId,
          projectName: donationData.projectName,
          donorName: data.donor_name,
          donorEmail: data.donor_email,
          amount: data.amount,
          message: data.message,
          isAnonymous: data.is_anonymous,
          paymentMethod: data.payment_method === 'boleto' ? 'bank_slip' : data.payment_method as 'credit_card' | 'pix',
          status: data.payment_status === 'completed' ? 'confirmed' : 'pending',
          createdAt: data.created_at,
          confirmedAt: data.payment_status === 'completed' ? data.created_at : undefined,
          socialProjectId: data.social_project_id
        };

        // Update local state
        setDonations(prev => [donation, ...prev]);

        // Update localStorage
        const localDonations = JSON.parse(localStorage.getItem('minha_floresta_donations') || '[]');
        localDonations.unshift(donation);
        localStorage.setItem('minha_floresta_donations', JSON.stringify(localDonations));

        return donation;
      } else {
        throw new Error(apiError || 'Erro ao criar doação via API');
      }
    } catch (err) {
      console.error('API error, creating donation locally:', err);
      
      // Fallback to local creation
      const donation: Donation = {
        id: `don_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: donationData.projectId,
        projectName: donationData.projectName,
        donorName: donationData.donorName,
        donorEmail: donationData.donorEmail,
        amount: donationData.amount,
        message: donationData.message,
        isAnonymous: donationData.isAnonymous,
        paymentMethod: donationData.paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        transactionId: `LOCAL_${Date.now()}`
      };

      // Save locally
      const localDonations = JSON.parse(localStorage.getItem('minha_floresta_donations') || '[]');
      localDonations.unshift(donation);
      localStorage.setItem('minha_floresta_donations', JSON.stringify(localDonations));

      // Add to pending sync queue
      const pendingDonations = JSON.parse(localStorage.getItem('minha_floresta_pending_donations') || '[]');
      pendingDonations.push(donation);
      localStorage.setItem('minha_floresta_pending_donations', JSON.stringify(pendingDonations));

      setDonations(prev => [donation, ...prev]);
      
      return donation;
    } finally {
      setIsLoading(false);
    }
  };

  const getDonationStats = async (): Promise<DonationStats> => {
    try {
      // Try API first
      const { data, error: apiError } = await DonationsAPI.getStats();
      
      if (data && !apiError) {
        return {
          totalDonations: data.totalCount,
          totalAmount: data.totalAmount,
          donorCount: data.totalCount, // Simplified
          averageDonation: data.averageAmount
        };
      } else {
        // Fallback to localStorage calculation
        const localDonations = JSON.parse(localStorage.getItem('minha_floresta_donations') || '[]');
        const confirmedDonations = localDonations.filter((d: Donation) => d.status === 'confirmed');
        
        const totalAmount = confirmedDonations.reduce((sum: number, d: Donation) => sum + d.amount, 0);
        const totalDonations = confirmedDonations.length;
        const uniqueDonors = new Set(confirmedDonations.map((d: Donation) => d.donorEmail)).size;
        
        return {
          totalDonations,
          totalAmount,
          donorCount: uniqueDonors,
          averageDonation: totalDonations > 0 ? totalAmount / totalDonations : 0
        };
      }
    } catch (err) {
      console.error('Error getting donation stats:', err);
      
      // Fallback calculation
      const localDonations = JSON.parse(localStorage.getItem('minha_floresta_donations') || '[]');
      const confirmedDonations = localDonations.filter((d: Donation) => d.status === 'confirmed');
      
      const totalAmount = confirmedDonations.reduce((sum: number, d: Donation) => sum + d.amount, 0);
      const totalDonations = confirmedDonations.length;
      const uniqueDonors = new Set(confirmedDonations.map((d: Donation) => d.donorEmail)).size;
      
      return {
        totalDonations,
        totalAmount,
        donorCount: uniqueDonors,
        averageDonation: totalDonations > 0 ? totalAmount / totalDonations : 0
      };
    }
  };

  const getDonationsByProject = async (projectId: string): Promise<Donation[]> => {
    try {
      // Try API first
      const { data, error: apiError } = await DonationsAPI.getByProject(projectId);
      
      if (data && !apiError) {
        return data.map(d => ({
          id: d.id,
          projectId: d.social_project_id || projectId,
          projectName: 'Projeto Social',
          donorName: d.is_anonymous ? 'Anônimo' : d.donor_name,
          donorEmail: d.donor_email,
          amount: d.amount,
          message: d.message,
          isAnonymous: d.is_anonymous,
          paymentMethod: d.payment_method === 'boleto' ? 'bank_slip' : d.payment_method as 'credit_card' | 'pix',
          status: d.payment_status === 'completed' ? 'confirmed' : 'pending',
          createdAt: d.created_at,
          socialProjectId: d.social_project_id
        }));
      } else {
        // Fallback to localStorage
        return donations.filter(d => d.projectId === projectId || d.socialProjectId === projectId);
      }
    } catch (err) {
      console.error('Error getting project donations:', err);
      return donations.filter(d => d.projectId === projectId || d.socialProjectId === projectId);
    }
  };

  const updateDonationStatus = (donationId: string, status: 'pending' | 'confirmed' | 'failed') => {
    setDonations(prev => prev.map(donation => 
      donation.id === donationId 
        ? { 
            ...donation, 
            status, 
            confirmedAt: status === 'confirmed' ? new Date().toISOString() : donation.confirmedAt 
          }
        : donation
    ));

    // Update localStorage
    const localDonations = JSON.parse(localStorage.getItem('minha_floresta_donations') || '[]');
    const updatedDonations = localDonations.map((donation: Donation) => 
      donation.id === donationId 
        ? { 
            ...donation, 
            status, 
            confirmedAt: status === 'confirmed' ? new Date().toISOString() : donation.confirmedAt 
          }
        : donation
    );
    localStorage.setItem('minha_floresta_donations', JSON.stringify(updatedDonations));
  };

  const getRecentDonations = (limit: number = 10): Donation[] => {
    return donations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  return {
    donations,
    isLoading,
    error,
    createDonation,
    getDonationStats,
    getDonationsByProject,
    updateDonationStatus,
    getRecentDonations,
    loadDonations
  };
}