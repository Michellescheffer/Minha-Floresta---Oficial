/**
 * Certificates Get - Edge Function
 * - GET ?number=ABC returns a single certificate with pdf_url and project name
 * - GET ?user_id=UUID returns list of certificates for user
 */
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
    const number = url.searchParams.get('number');
    const userId = url.searchParams.get('user_id');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (number) {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          id,
          purchase_id,
          project_id,
          area_sqm,
          certificate_number,
          certificate_type,
          issued_at,
          status,
          pdf_url,
          projects(name)
        `)
        .eq('certificate_number', number)
        .maybeSingle();

      if (error || !data) {
        return json({ error: 'not_found' }, 404);
      }

      return json({ certificate: data }, 200);
    }

    if (userId) {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          id,
          purchase_id,
          project_id,
          area_sqm,
          certificate_number,
          certificate_type,
          issued_at,
          status,
          pdf_url,
          projects(name)
        `)
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });

      if (error) {
        return json({ error: 'query_error' }, 400);
      }

      return json({ certificates: data || [] }, 200);
    }

    return json({ error: 'missing_params' }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: 'server_error' }, 500);
  }
});

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
