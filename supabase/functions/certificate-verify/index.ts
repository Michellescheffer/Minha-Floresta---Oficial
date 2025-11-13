import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const url = new URL(req.url);
    const raw = url.searchParams.get('certificate_number') || url.searchParams.get('numero');
    if (!raw) {
      return new Response(JSON.stringify({ error: 'Missing certificate_number' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const code = raw.replace(/\s+/g, '').toUpperCase();

    const supabaseUrl = Deno.env.get('MF_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRole = Deno.env.get('MF_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const { data: cert, error } = await supabase
      .from('certificates')
      .select('id, certificate_number, area_sqm, issued_at, status, pdf_url, project_id, purchase_id, projects(name), purchases(buyer_email)')
      .ilike('certificate_number', code)
      .maybeSingle();

    if (error || !cert) {
      return new Response(JSON.stringify({ found: false }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const issueDate = cert.issued_at || new Date().toISOString();
    const validityYears = 30;
    const validUntil = new Date(new Date(issueDate).getTime() + validityYears * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const body = {
      found: true,
      id: cert.id,
      certificate_number: cert.certificate_number,
      area_sqm: cert.area_sqm,
      issued_at: issueDate,
      status: cert.status || 'active',
      pdf_url: cert.pdf_url || null,
      project_id: cert.project_id || null,
      purchase_id: cert.purchase_id || null,
      project_name: (cert.projects as any)?.name || 'Projeto',
      buyer_email: (cert.purchases as any)?.buyer_email || null,
      valid_until: validUntil,
    };

    return new Response(JSON.stringify(body), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
