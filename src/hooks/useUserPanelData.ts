import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';

export interface UserPurchase {
  id: string;
  email: string;
  total_amount: number;
  created_at: string;
  area_total?: number;
  project_names?: string[];
}

export interface UserDonation {
  id: string;
  donor_email: string;
  amount: number;
  project_id: string | null;
  created_at: string;
}

export interface UserCertificate {
  id: string;
  certificate_number: string;
  area_sqm: number;
  pdf_url?: string | null;
  issued_at: string;
  status: string;
  project_name?: string;
  purchase_id?: string;
}

export function useUserPanelData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [donations, setDonations] = useState<UserDonation[]>([]);
  const [certificates, setCertificates] = useState<UserCertificate[]>([]);

  const load = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    setError(null);
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/user-dashboard?` + new URLSearchParams({ email: user.email }).toString();
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      if (!res.ok) throw new Error('Falha ao carregar seus dados');
      const data = await res.json();

      setPurchases((data?.purchases || []) as UserPurchase[]);
      setDonations((data?.donations || []) as UserDonation[]);
      setCertificates((data?.certificates || []) as UserCertificate[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    // Preferir pequeno polling por alguns segundos após retorno do checkout
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const cameFromCheckout = (hash || '').includes('checkout-return');
    if (!cameFromCheckout) {
      load();
      return;
    }
    let cancelled = false;
    const schedule = [500, 1000, 2000, 3000, 5000, 8000];
    (async () => {
      for (const ms of schedule) {
        if (cancelled) return;
        await load();
        await new Promise(r => setTimeout(r, ms));
      }
    })();
    return () => { cancelled = true; };
  }, [load]);

  return { loading, error, purchases, donations, certificates, reload: load };
}
