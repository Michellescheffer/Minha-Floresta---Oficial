import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
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
      // Single source: stripe_payment_intents (schema-agnostic)
      const { data: spiRows, error: spiErr } = await supabase
        .from('stripe_payment_intents')
        .select('stripe_payment_intent_id, amount, currency, status, created_at, email, metadata')
        .eq('email', user.email)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false });

      const rows = (!spiErr && Array.isArray(spiRows)) ? spiRows : [];

      const purchasesLike = rows.filter((r: any) => {
        try { return (r.metadata && (r.metadata as any).type) === 'purchase'; } catch { return false; }
      });
      const donationsLike = rows.filter((r: any) => {
        try { return (r.metadata && (r.metadata as any).type) === 'donation'; } catch { return false; }
      });

      const basePurchases: UserPurchase[] = purchasesLike.map((r: any) => ({
        id: r.stripe_payment_intent_id,
        email: r.email || user.email,
        total_amount: r.amount ?? 0,
        created_at: r.created_at,
      }));
      setPurchases(basePurchases);

      setDonations(donationsLike.map((r: any) => ({
        id: r.stripe_payment_intent_id,
        donor_email: r.email || user.email,
        amount: r.amount ?? 0,
        project_id: null,
        created_at: r.created_at,
      })));

      // Certificates: require purchases table linkage; if absent, skip quietly
      setCertificates([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, error, purchases, donations, certificates, reload: load };
}
