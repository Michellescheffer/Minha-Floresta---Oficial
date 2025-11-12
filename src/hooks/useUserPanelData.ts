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
      // Purchases by email (support different schemas: email or buyer_email)
      const { data: purchaseRows } = await supabase
        .from('purchases')
        .select('id, email, buyer_email, total_amount, created_at')
        .or(`email.eq.${user.email},buyer_email.eq.${user.email}`)
        .order('created_at', { ascending: false });

      const basePurchases: UserPurchase[] = (purchaseRows || []).map((p: any) => ({
        id: p.id,
        email: p.email || p.buyer_email || user.email,
        total_amount: p.total_amount ?? 0,
        created_at: p.created_at,
      }));

      // Purchase items to compute total area and list of project names
      if (basePurchases.length > 0) {
        const purchaseIds = basePurchases.map(p => p.id);
        const { data: itemRows } = await supabase
          .from('purchase_items')
          .select('purchase_id, quantity, project_id, projects(name)')
          .in('purchase_id', purchaseIds);

        const areaMap = new Map<string, number>();
        const namesMap = new Map<string, Set<string>>();
        for (const it of (itemRows || [])) {
          areaMap.set(it.purchase_id, (areaMap.get(it.purchase_id) || 0) + (it.quantity || 0));
          const set = namesMap.get(it.purchase_id) || new Set<string>();
          set.add(((it.projects as any)?.name) || 'Projeto');
          namesMap.set(it.purchase_id, set);
        }

        setPurchases(basePurchases.map(p => ({
          ...p,
          area_total: areaMap.get(p.id) || 0,
          project_names: Array.from(namesMap.get(p.id) || new Set<string>()),
        })));
      } else {
        setPurchases(basePurchases);
      }

      // Donations by donor_email (support different schemas: donor_email or email)
      const { data: donationRows } = await supabase
        .from('donations')
        .select('id, donor_email, email, amount, project_id, created_at')
        .or(`donor_email.eq.${user.email},email.eq.${user.email}`)
        .order('created_at', { ascending: false });

      setDonations((donationRows || []).map((d: any) => ({
        id: d.id,
        donor_email: d.donor_email || d.email || user.email,
        amount: d.amount ?? 0,
        project_id: d.project_id ?? null,
        created_at: d.created_at,
      })));

      // Certificates linked to user's purchases (only if we have purchaseIds)
      const purchaseIds = (purchaseRows || []).map((p: any) => p.id);
      if (purchaseIds.length > 0) {
        const { data: certRows } = await supabase
          .from('certificates')
          .select(`
            id,
            certificate_number,
            area_sqm,
            pdf_url,
            issued_at,
            status,
            purchase_id,
            projects(name)
          `)
          .in('purchase_id', purchaseIds);

        setCertificates((certRows || []).map((c: any) => ({
          id: c.id,
          certificate_number: c.certificate_number,
          area_sqm: c.area_sqm,
          pdf_url: c.pdf_url || null,
          issued_at: c.issued_at,
          status: c.status,
          project_name: (c.projects as any)?.name || 'Projeto',
          purchase_id: c.purchase_id,
        })));
      } else {
        setCertificates([]);
      }
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
