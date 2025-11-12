import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1) Base: stripe_payment_intents por email
    const { data: intents, error: intentsErr } = await supabase
      .from('stripe_payment_intents')
      .select('stripe_payment_intent_id, amount, currency, status, created_at, email, metadata')
      .eq('email', email)
      .order('created_at', { ascending: false });

    const rows = intentsErr || !Array.isArray(intents) ? [] : intents;

    const purchasesLike = rows.filter((r: any) => {
      try { return (r.metadata && (r.metadata as any).type) === 'purchase' && r.status === 'succeeded'; } catch { return false; }
    });
    const donationsLike = rows.filter((r: any) => {
      try { return (r.metadata && (r.metadata as any).type) === 'donation' && r.status === 'succeeded'; } catch { return false; }
    });

    const basePurchases = purchasesLike.map((r: any) => ({
      id: r.stripe_payment_intent_id,
      email: r.email || email,
      total_amount: r.amount ?? 0,
      created_at: r.created_at,
    }));

    const baseDonations = donationsLike.map((r: any) => ({
      id: r.stripe_payment_intent_id,
      donor_email: r.email || email,
      amount: r.amount ?? 0,
      project_id: null,
      created_at: r.created_at,
    }));

    // 2) Enriquecimento opcional usando purchases/purchase_items/certificates quando existir
    let certificates: any[] = [];
    try {
      // Mapear PI -> purchase.id
      const { data: purchaseRows } = await supabase
        .from('purchases')
        .select('id, stripe_payment_intent_id, email, buyer_email, total_amount, created_at')
        .or(`email.eq.${email},buyer_email.eq.${email}`);

      const purchaseMap = new Map<string, string>();
      (purchaseRows || []).forEach((p: any) => purchaseMap.set(p.stripe_payment_intent_id, p.id));

      // Enriquecer purchases com área e projetos
      if ((purchaseRows || []).length > 0) {
        const ids = (purchaseRows || []).map((p: any) => p.id);
        const { data: items } = await supabase
          .from('purchase_items')
          .select('purchase_id, quantity, projects(name)')
          .in('purchase_id', ids);

        const areaMap = new Map<string, number>();
        const namesMap = new Map<string, Set<string>>();
        (items || []).forEach((it: any) => {
          areaMap.set(it.purchase_id, (areaMap.get(it.purchase_id) || 0) + (it.quantity || 0));
          const set = namesMap.get(it.purchase_id) || new Set<string>();
          set.add((it.projects as any)?.name || 'Projeto');
          namesMap.set(it.purchase_id, set);
        });

        // Misturar no basePurchases quando houver correspondência
        basePurchases.forEach((bp: any) => {
          const pid = purchaseMap.get(bp.id);
          if (pid) {
            bp.id = pid; // usar o id real da purchase
            bp.area_total = areaMap.get(pid) || 0;
            bp.project_names = Array.from(namesMap.get(pid) || new Set<string>());
          }
        });

        // Carregar certificados por purchase_id
        const { data: certRows } = await supabase
          .from('certificates')
          .select('id, certificate_number, area_sqm, pdf_url, issued_at, status, purchase_id, projects(name)')
          .in('purchase_id', ids);

        certificates = (certRows || []).map((c: any) => ({
          id: c.id,
          certificate_number: c.certificate_number,
          area_sqm: c.area_sqm,
          pdf_url: c.pdf_url,
          issued_at: c.issued_at,
          status: c.status,
          project_name: (c.projects as any)?.name || 'Projeto',
          purchase_id: c.purchase_id,
        }));
      }
    } catch (_) {
      // Ignorar se schema não existir
      certificates = [];
    }

    // 3) Activity (últimos eventos simples)
    const activity = [...basePurchases, ...baseDonations]
      .map((e: any) => ({
        type: e.total_amount !== undefined ? 'purchase' : 'donation',
        value: e.total_amount ?? e.amount ?? 0,
        created_at: e.created_at,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    const body = { purchases: basePurchases, donations: baseDonations, certificates, activity };
    return new Response(JSON.stringify(body), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
