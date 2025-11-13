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
      try {
        const meta = (r.metadata || {}) as any;
        const looksLikePurchase = meta?.type === 'purchase' || meta?.items_json || (meta?.project_ids && meta?.item_count);
        return looksLikePurchase && r.status === 'succeeded';
      } catch { return false; }
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

    let baseDonations = donationsLike.map((r: any) => ({
      id: r.stripe_payment_intent_id,
      donor_email: r.email || email,
      amount: r.amount ?? 0,
      project_id: null,
      created_at: r.created_at,
    }));

    // 2) Enriquecimento opcional usando purchases/purchase_items/certificates quando existir
    let certificates: any[] = [];
    try {
      // Mapear PI -> purchase.id usando a lista de intents do email (mais robusto que filtrar por email na tabela purchases)
      const piIds = (purchasesLike as any[]).map(r => r.stripe_payment_intent_id);
      const { data: purchaseRows } = await supabase
        .from('purchases')
        .select('id, stripe_payment_intent_id')
        .in('stripe_payment_intent_id', piIds);

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

        // Fallback: se nenhuma linha em certificates, sintetizar a partir de purchase_items para exibição imediata
        if ((!certificates || certificates.length === 0) && (items || []).length > 0) {
          const firstId = (ids && ids[0]) || 'temp';
          const synth = (items || []).map((it: any, idx: number) => ({
            id: `synth-${firstId}-${idx}`,
            certificate_number: `PENDENTE-${firstId}-${idx}`,
            area_sqm: Math.max(1, Number(it.quantity) || 1),
            pdf_url: null,
            issued_at: new Date().toISOString(),
            status: 'issued',
            project_name: (it.projects as any)?.name || 'Projeto',
            purchase_id: it.purchase_id,
          }));
          certificates = synth;
        }
      }
    } catch (_) {
      // Ignorar se schema não existir
      certificates = [];
    }

    // 2b) Fallback de área e projetos a partir do metadata.items_json quando não houver purchase_items
    try {
      // Construir mapas a partir dos próprios intents
      const projectIds: string[] = [];
      const areaByIntent = new Map<string, number>();
      const projectIdsByIntent = new Map<string, string[]>();
      for (const r of purchasesLike as any[]) {
        const meta = (r.metadata || {}) as any;
        let items: Array<{ project_id: string; quantity: number } > = [];
        if (meta.items_json) {
          try { items = JSON.parse(String(meta.items_json)); } catch { items = []; }
        } else if (meta.project_ids && meta.item_count) {
          const ids = String(meta.project_ids).split(',').filter(Boolean);
          items = ids.map((pid: string) => ({ project_id: pid, quantity: 1 }));
        }
        if (items.length > 0) {
          const totalArea = items.reduce((s, it) => s + Math.max(1, Number(it.quantity) || 0), 0);
          areaByIntent.set(r.stripe_payment_intent_id, totalArea);
          const pids = items.map(it => it.project_id).filter(Boolean);
          projectIdsByIntent.set(r.stripe_payment_intent_id, pids);
          pids.forEach(pid => projectIds.push(pid));
        }
      }
      // Buscar nomes dos projetos quando possível
      let namesById = new Map<string, string>();
      if (projectIds.length > 0) {
        try {
          const { data: prows } = await supabase
            .from('projects')
            .select('id, name')
            .in('id', Array.from(new Set(projectIds)));
          (prows || []).forEach((p: any) => namesById.set(p.id, p.name || 'Projeto'));
        } catch {}
      }
      // Aplicar fallback apenas quando purchaseId real não foi encontrado
      basePurchases.forEach(bp => {
        if (typeof bp.area_total === 'undefined') {
          const a = areaByIntent.get(bp.id);
          if (typeof a === 'number') {
            bp.area_total = a;
          }
          const pids = projectIdsByIntent.get(bp.id) || [];
          const projectNames = pids.map(pid => namesById.get(pid) || 'Projeto');
          if (projectNames.length > 0) bp.project_names = Array.from(new Set(projectNames));
        }
      });
    } catch {}

    // 2c) Fallback final: se ainda não houver certificates, sintetizar a partir dos próprios intents
    try {
      if (!certificates || certificates.length === 0) {
        // Fetch project names for synthetic certificates
        const allProjectIds = new Set<string>();
        for (const r of purchasesLike as any[]) {
          const meta = (r.metadata || {}) as any;
          let items: Array<{ project_id: string; quantity: number }> = [];
          if (meta.items_json) {
            try { items = JSON.parse(String(meta.items_json)); } catch { items = []; }
          } else if (meta.project_ids && meta.item_count) {
            const ids = String(meta.project_ids).split(',').filter(Boolean);
            items = ids.map((pid: string) => ({ project_id: pid, quantity: 1 }));
          }
          items.forEach(it => allProjectIds.add(it.project_id));
        }
        
        const projectNamesMap = new Map<string, string>();
        if (allProjectIds.size > 0) {
          try {
            const { data: projectRows } = await supabase
              .from('projects')
              .select('id, name')
              .in('id', Array.from(allProjectIds));
            if (projectRows) {
              projectRows.forEach((p: any) => projectNamesMap.set(p.id, p.name));
            }
          } catch {}
        }
        
        const synth: any[] = [];
        for (const r of purchasesLike as any[]) {
          const meta = (r.metadata || {}) as any;
          let items: Array<{ project_id: string; quantity: number }> = [];
          if (meta.items_json) {
            try { items = JSON.parse(String(meta.items_json)); } catch { items = []; }
          } else if (meta.project_ids && meta.item_count) {
            const ids = String(meta.project_ids).split(',').filter(Boolean);
            items = ids.map((pid: string) => ({ project_id: pid, quantity: 1 }));
          }
          if (items.length === 0) {
            // Sem itens, sintetiza 1 certificado com área estimada (quando possível)
            synth.push({
              id: `synth-${r.stripe_payment_intent_id}-0`,
              certificate_number: `PENDENTE-${r.stripe_payment_intent_id}-0`,
              area_sqm: 0,
              pdf_url: null,
              issued_at: new Date().toISOString(),
              status: 'issued',
              project_name: 'Projeto de Reflorestamento',
              purchase_id: null,
            });
            continue;
          }
          items.forEach((it: any, idx: number) => {
            synth.push({
              id: `synth-${r.stripe_payment_intent_id}-${idx}`,
              certificate_number: `PENDENTE-${r.stripe_payment_intent_id}-${idx}`,
              area_sqm: Math.max(1, Number(it.quantity) || 1),
              pdf_url: null,
              issued_at: new Date().toISOString(),
              status: 'issued',
              project_name: projectNamesMap.get(it.project_id) || 'Projeto de Reflorestamento',
              purchase_id: null,
            });
          });
        }
        certificates = synth;
      }
    } catch {}

    // 2d) Doações: além dos intents, buscar tabela donations quando existir
    try {
      const { data: donationRows } = await supabase
        .from('donations')
        .select('id, donor_email, email, amount, project_id, created_at')
        .or(`donor_email.eq.${email},email.eq.${email}`)
        .order('created_at', { ascending: false });
      if (Array.isArray(donationRows) && donationRows.length > 0) {
        const mapped = donationRows.map((d: any) => ({
          id: d.id,
          donor_email: d.donor_email || d.email || email,
          amount: d.amount ?? 0,
          project_id: d.project_id ?? null,
          created_at: d.created_at,
        }));
        // Mesclar (evitar duplicatas por id); priorizar registros da tabela donations
        const seen = new Set<string>();
        baseDonations = [...mapped, ...baseDonations.filter(d => { const k = d.id; if (seen.has(k)) return false; seen.add(k); return true; })];
      }
    } catch {}

    // 3) Activity (últimos eventos simples)
    const activity = [...basePurchases, ...baseDonations]
      .map((e: any) => ({
        type: e.total_amount !== undefined ? 'purchase' : 'donation',
        value: e.total_amount ?? e.amount ?? 0,
        created_at: e.created_at,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // 3b) cert_count por purchase
    try {
      const counts = new Map<string, number>();
      for (const c of certificates) {
        const pid = c.purchase_id;
        if (!pid) continue;
        counts.set(pid, (counts.get(pid) || 0) + 1);
      }
      basePurchases.forEach(bp => {
        // Quando bp.id foi trocado para purchase_id real acima, o count casa direto
        const cnt = counts.get(bp.id);
        if (typeof cnt === 'number') (bp as any).cert_count = cnt;
      });
    } catch {}

    const body = { purchases: basePurchases, donations: baseDonations, certificates, activity };
    return new Response(JSON.stringify(body), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
