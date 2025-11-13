import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const method = req.method.toUpperCase();

    const supabaseUrl = Deno.env.get('MF_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRole = Deno.env.get('MF_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // AuthZ: require service role or pre-shared token in header if you want to harden further

    const body = method === 'POST' ? await req.json().catch(() => ({})) : {};
    const purchaseId = body.purchase_id || url.searchParams.get('purchase_id');
    const email = body.email || url.searchParams.get('email');
    const processRecent = (body.process_recent || url.searchParams.get('process_recent')) === 'true';
    const recentDays = Number(body.recent_days || url.searchParams.get('recent_days') || 60);
    const limit = Number(body.limit || url.searchParams.get('limit') || 200);

    const endpointGenerate = `${supabaseUrl}/functions/v1/certificate-generate`;
    const genHeaders = {
      'Authorization': `Bearer ${supabaseServiceRole}`,
      'Content-Type': 'application/json',
    } as Record<string, string>;

    async function ensureForPurchase(pid: string) {
      // Load items
      const { data: items } = await supabase
        .from('purchase_items')
        .select('project_id, quantity')
        .eq('purchase_id', pid);

      if (!items || items.length === 0) return { purchase_id: pid, created: 0, generated_pdf: 0 };

      // Existing certs
      const { data: certs } = await supabase
        .from('certificates')
        .select('id, project_id, pdf_url')
        .eq('purchase_id', pid);

      const hasCertForProject = new Set<string>((certs || []).map((c: any) => String(c.project_id)));
      let created = 0;

      for (const it of items) {
        const projId = String((it as any).project_id);
        if (!hasCertForProject.has(projId)) {
          const certNumber = `MF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
          const { error: insErr } = await supabase
            .from('certificates')
            .insert({
              purchase_id: pid,
              project_id: projId,
              area_sqm: Math.max(1, Number((it as any).quantity) || 1),
              certificate_number: certNumber,
              certificate_type: 'digital',
              issued_at: new Date().toISOString(),
              status: 'issued',
            });
          if (!insErr) {
            hasCertForProject.add(projId);
            created += 1;
          }
        }
      }

      // Generate PDFs for any missing
      const { data: certsAfter } = await supabase
        .from('certificates')
        .select('id, pdf_url')
        .eq('purchase_id', pid);

      const toGen = (certsAfter || []).filter((c: any) => !c.pdf_url);
      let generatedPdf = 0;
      if (toGen.length > 0) {
        const tasks = toGen.map((c: any) => fetch(endpointGenerate, { method: 'POST', headers: genHeaders, body: JSON.stringify({ certificate_id: c.id }) }));
        const res = await Promise.allSettled(tasks);
        generatedPdf = res.filter(r => r.status === 'fulfilled').length;
      }

      return { purchase_id: pid, created, generated_pdf: generatedPdf };
    }

    let targets: Array<{ id: string }>; 

    if (purchaseId) {
      targets = [{ id: String(purchaseId) }];
    } else if (email) {
      // 1) Ensure purchases exist by reading stripe_payment_intents for this email
      const { data: intents } = await supabase
        .from('stripe_payment_intents')
        .select('stripe_payment_intent_id, amount, currency, status, metadata, email')
        .eq('email', email)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(limit);

      const toProcess = (intents || []).filter((pi: any) => {
        try {
          const meta = (pi.metadata || {}) as any;
          return meta.type === 'purchase' || meta.items_json || (meta.project_ids && meta.item_count);
        } catch { return false; }
      });

      // Create purchases if missing
      for (const pi of toProcess) {
        const piId = pi.stripe_payment_intent_id as string;
        const { data: existingPurchase } = await supabase
          .from('purchases')
          .select('id')
          .eq('stripe_payment_intent_id', piId)
          .maybeSingle();
        if (!existingPurchase) {
          const meta = (pi.metadata || {}) as any;
          const { data: created, error: createErr } = await supabase
            .from('purchases')
            .insert({
              user_id: meta.user_id || null,
              total_amount: pi.amount ?? 0,
              currency: pi.currency || 'brl',
              payment_method: 'stripe',
              payment_status: 'succeeded',
              payment_date: new Date().toISOString(),
              stripe_payment_intent_id: piId,
              buyer_email: pi.email || email,
            })
            .select('id')
            .single();

          const purchase_id = created?.id as string | undefined;
          if (purchase_id && !createErr) {
            // Build items from metadata
            let items: Array<{ project_id: string; quantity: number; price?: number }> = [];
            if (meta.items_json) {
              try { items = JSON.parse(String(meta.items_json)); } catch { items = []; }
            } else if (meta.project_ids && meta.item_count) {
              const ids = String(meta.project_ids).split(',').filter(Boolean);
              items = ids.map((pid: string) => ({ project_id: pid, quantity: 1 }));
            }
            if (items.length > 0) {
              const rows = items.map((it) => ({ purchase_id, project_id: it.project_id, quantity: Math.max(1, Number(it.quantity) || 1), unit_price: it.price ?? null }));
              await supabase.from('purchase_items').insert(rows);
              // Insert certificates now (basic)
              for (const it of rows) {
                const certNumber = `MF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
                await supabase.from('certificates').insert({
                  purchase_id,
                  project_id: it.project_id,
                  area_sqm: it.quantity,
                  certificate_number: certNumber,
                  certificate_type: 'digital',
                  issued_at: new Date().toISOString(),
                  status: 'issued',
                });
              }
            }
          }
        }
      }

      // 2) Now gather purchases by email
      const { data: purchasesByEmail } = await supabase
        .from('purchases')
        .select('id')
        .eq('buyer_email', email)
        .order('created_at', { ascending: false })
        .limit(limit);
      targets = (purchasesByEmail || []).map((p: any) => ({ id: p.id }));
    } else if (processRecent) {
      const since = new Date(Date.now() - recentDays * 24 * 60 * 60 * 1000).toISOString();
      const { data: recents } = await supabase
        .from('purchases')
        .select('id')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(limit);
      targets = (recents || []).map((p: any) => ({ id: p.id }));
    } else {
      // Default: purchases with missing certificates (heuristic)
      const { data: maybeMissing } = await supabase
        .from('purchases')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(limit);
      targets = (maybeMissing || []).map((p: any) => ({ id: p.id }));
    }

    const results = [] as any[];
    for (const t of targets) {
      const r = await ensureForPurchase(t.id);
      results.push(r);
    }

    return new Response(JSON.stringify({ processed: results.length, results }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('certificate-backfill error', e);
    return new Response(JSON.stringify({ error: 'server_error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
