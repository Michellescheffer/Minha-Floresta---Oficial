import { useState, useEffect } from 'react';
import { CertificatesAPI } from '../services/api';
import { UserAPI } from '../services/api';

export interface Certificate {
  id: string;
  projectId: string;
  projectName: string;
  buyerName: string;
  buyerEmail: string;
  area: number;
  price: number;
  issueDate: string;
  status: 'active' | 'expired' | 'transferred';
  certificateNumber: string;
  qrCode: string;
  digitalUrl?: string;
  physicalAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  co2Offset: number;
  validUntil: string;
  userId?: string;
}

export interface CertificateGenerationData {
  projectId: string;
  projectName: string;
  buyerName: string;
  buyerEmail: string;
  area: number;
  price: number;
  physicalDelivery: boolean;
  physicalAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = UserAPI.getCurrentUser();
      
      if (currentUser) {
        // Load from API
        const { data, error: apiError } = await CertificatesAPI.getByUser(currentUser.id);
        
        if (data) {
          // Transform API data to frontend format
          const transformedCertificates = data.map(cert => ({
            id: cert.id,
            projectId: cert.project_id,
            projectName: cert.project_name || 'Projeto',
            buyerName: cert.user_name || currentUser.name,
            buyerEmail: currentUser.email,
            area: cert.area_m2,
            price: 0, // Price would need to be calculated or stored
            issueDate: cert.issue_date,
            status: cert.status as 'active' | 'expired' | 'transferred',
            certificateNumber: cert.certificate_number,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${cert.certificate_number}`,
            digitalUrl: `${window.location.origin}/verificar-certificado?numero=${cert.certificate_number}`,
            co2Offset: cert.co2_offset_kg,
            validUntil: cert.valid_until,
            userId: cert.user_id
          }));
          
          setCertificates(transformedCertificates);
          
          // Cache in localStorage as backup
          localStorage.setItem('minha_floresta_certificates', JSON.stringify(transformedCertificates));
        } else if (apiError) {
          console.error('API Error:', apiError);
          // Fallback to localStorage
          const localCertificates = JSON.parse(localStorage.getItem('minha_floresta_certificates') || '[]');
          setCertificates(localCertificates);
        }
      } else {
        // No user logged in, load from localStorage
        const localCertificates = JSON.parse(localStorage.getItem('minha_floresta_certificates') || '[]');
        setCertificates(localCertificates);
      }
    } catch (err) {
      console.error('Error loading certificates:', err);
      setError('Erro ao carregar certificados');
      
      // Fallback to localStorage
      const localCertificates = JSON.parse(localStorage.getItem('minha_floresta_certificates') || '[]');
      setCertificates(localCertificates);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCertificate = async (data: CertificateGenerationData): Promise<Certificate> => {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = UserAPI.getCurrentUser();
      
      if (currentUser) {
        // Generate via API
        const { data: apiCert, error: apiError } = await CertificatesAPI.create({
          user_id: currentUser.id,
          transaction_id: `temp_${Date.now()}`, // Should be passed from transaction
          project_id: data.projectId,
          area_m2: data.area,
          certificate_type: data.physicalDelivery ? 'physical' : 'digital'
        });

        if (apiCert) {
          const certificate: Certificate = {
            id: apiCert.id,
            projectId: apiCert.project_id,
            projectName: data.projectName,
            buyerName: data.buyerName,
            buyerEmail: data.buyerEmail,
            area: apiCert.area_m2,
            price: data.price,
            issueDate: apiCert.issue_date,
            status: 'active',
            certificateNumber: apiCert.certificate_number,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${apiCert.certificate_number}`,
            digitalUrl: `${window.location.origin}/verificar-certificado?numero=${apiCert.certificate_number}`,
            physicalAddress: data.physicalAddress,
            co2Offset: apiCert.co2_offset_kg,
            validUntil: apiCert.valid_until,
            userId: apiCert.user_id
          };

          setCertificates(prev => [certificate, ...prev]);
          
          // Update localStorage cache
          const savedCertificates = JSON.parse(localStorage.getItem('minha_floresta_certificates') || '[]');
          savedCertificates.unshift(certificate);
          localStorage.setItem('minha_floresta_certificates', JSON.stringify(savedCertificates));

          return certificate;
        } else {
          throw new Error(apiError || 'Erro ao gerar certificado via API');
        }
      } else {
        // Generate locally (offline mode)
        const certificateNumber = `MFC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        const issueDate = new Date().toISOString().split('T')[0];
        const validUntil = new Date(Date.now() + 30 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const certificate: Certificate = {
          id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          projectId: data.projectId,
          projectName: data.projectName,
          buyerName: data.buyerName,
          buyerEmail: data.buyerEmail,
          area: data.area,
          price: data.price,
          issueDate,
          status: 'active',
          certificateNumber,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${certificateNumber}`,
          digitalUrl: `${window.location.origin}/verificar-certificado?numero=${certificateNumber}`,
          physicalAddress: data.physicalAddress,
          co2Offset: Math.round(data.area * 22),
          validUntil
        };

        // Save to localStorage
        const savedCertificates = JSON.parse(localStorage.getItem('minha_floresta_certificates') || '[]');
        savedCertificates.unshift(certificate);
        localStorage.setItem('minha_floresta_certificates', JSON.stringify(savedCertificates));

        setCertificates(prev => [certificate, ...prev]);
        
        return certificate;
      }
    } catch (err) {
      console.error('Error generating certificate:', err);
      setError('Erro ao gerar certificado');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCertificate = async (certificateNumber: string): Promise<Certificate | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Try API first
      const { data, error: apiError } = await CertificatesAPI.getByNumber(certificateNumber);
      
      if (data) {
        return {
          id: data.id,
          projectId: data.project_id,
          projectName: data.project_name || 'Projeto',
          buyerName: data.user_name || 'Usuário',
          buyerEmail: 'email@exemplo.com',
          area: data.area_m2,
          price: 0,
          issueDate: data.issue_date,
          status: data.status as 'active' | 'expired' | 'transferred',
          certificateNumber: data.certificate_number,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data.certificate_number}`,
          digitalUrl: `${window.location.origin}/verificar-certificado?numero=${data.certificate_number}`,
          co2Offset: data.co2_offset_kg,
          validUntil: data.valid_until,
          userId: data.user_id
        };
      } else if (apiError) {
        // Fallback to localStorage search
        const localCertificates = JSON.parse(localStorage.getItem('minha_floresta_certificates') || '[]');
        const certificate = localCertificates.find((cert: Certificate) => 
          cert.certificateNumber === certificateNumber
        );
        
        if (certificate) {
          return certificate;
        } else {
          setError('Certificado não encontrado');
          return null;
        }
      }

      setError('Certificado não encontrado');
      return null;
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError('Erro ao verificar certificado');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getCertificatesByUser = (userId: string): Certificate[] => {
    return certificates.filter(cert => cert.userId === userId);
  };

  const getCertificatesByProject = (projectId: string): Certificate[] => {
    return certificates.filter(cert => cert.projectId === projectId);
  };

  return {
    certificates,
    isLoading,
    error,
    generateCertificate,
    verifyCertificate,
    getCertificatesByUser,
    getCertificatesByProject,
    loadCertificates
  };
}