import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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
  pdfUrl?: string;
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

      // Fonte estável: localStorage
      const localCertificates = JSON.parse(localStorage.getItem('minha_floresta_certificates') || '[]');
      setCertificates(localCertificates);
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

      // Geração local (offline)
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

      // Persistir no localStorage
      const savedCertificates = JSON.parse(localStorage.getItem('minha_floresta_certificates') || '[]');
      savedCertificates.unshift(certificate);
      localStorage.setItem('minha_floresta_certificates', JSON.stringify(savedCertificates));

      setCertificates(prev => [certificate, ...prev]);

      return certificate;
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

      // Consultar Edge Function de verificação
      const url = `https://${projectId}.supabase.co/functions/v1/certificate-verify?certificate_number=${encodeURIComponent(certificateNumber)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${publicAnonKey}` } });
      if (!res.ok) throw new Error('Falha na verificação do certificado');
      const payload = await res.json();

      if (!payload || payload.found !== true) {
        // Fallback: localStorage
        const localCertificates = JSON.parse(localStorage.getItem('minha_floresta_certificates') || '[]');
        const certificate = localCertificates.find((cert: Certificate) => cert.certificateNumber === certificateNumber);
        if (certificate) return certificate;
        setError('Certificado não encontrado');
        return null;
      }

      const issueDate = payload.issued_at || new Date().toISOString();
      const validityYears = 30; // padrão
      const validUntil = new Date(new Date(issueDate).getTime() + validityYears * 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const verificationLink = `${window.location.origin}/#verificar-certificado?numero=${encodeURIComponent(payload.certificate_number)}`;
      const certificate: Certificate = {
        id: payload.id,
        projectId: undefined as any,
        projectName: payload.project_name || 'Projeto',
        buyerName: '',
        buyerEmail: payload.buyer_email || '',
        area: payload.area_sqm,
        price: 0,
        issueDate,
        status: (payload.status as any) || 'active',
        certificateNumber: payload.certificate_number,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationLink)}`,
        digitalUrl: `${window.location.origin}/verificar-certificado?numero=${payload.certificate_number}`,
        pdfUrl: payload.pdf_url || undefined,
        co2Offset: Math.round((payload.area_sqm || 0) * 22),
        validUntil,
        userId: undefined,
      };

      return certificate;
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