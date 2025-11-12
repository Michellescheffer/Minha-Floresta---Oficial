import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function generatePDF(params: { certificateNumber: string; projectName: string; area: number; holderName?: string; issuedAt?: string; }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const title = 'Certificado de Preservação';
  const subtitle = 'Minha Floresta';
  const issued = params.issuedAt || new Date().toISOString().slice(0, 10);

  // Background
  page.drawRectangle({ x: 0, y: 0, width: page.getWidth(), height: page.getHeight(), color: rgb(0.96, 0.98, 0.96) });

  // Title
  page.drawText(title, { x: 60, y: 760, size: 28, font, color: rgb(0.1, 0.4, 0.2) });
  page.drawText(subtitle, { x: 60, y: 735, size: 16, font: fontReg, color: rgb(0.2, 0.5, 0.25) });

  // Body
  const body = `Certificamos que ${params.holderName || '—'} contribuiu para a preservação do projeto ${params.projectName},\ncorrespondente à área de ${params.area} m², emitido em ${issued}.`;
  page.drawText(body, { x: 60, y: 690, size: 12, font: fontReg, color: rgb(0.1, 0.1, 0.1), lineHeight: 16 });

  // Number
  page.drawText(`Código do Certificado: ${params.certificateNumber}`, { x: 60, y: 640, size: 12, font: fontReg, color: rgb(0.15, 0.15, 0.15) });

  // Footer
  page.drawText('Verifique a autenticidade em: minha-floresta.vercel.app/#verificar-certificado', { x: 60, y: 60, size: 10, font: fontReg, color: rgb(0.2, 0.2, 0.2) });

  const bytes = await pdfDoc.save();
  return new Uint8Array(bytes);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const { certificate_id } = await req.json();
    if (!certificate_id) {
      return new Response(JSON.stringify({ error: 'Missing certificate_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('MF_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRole = Deno.env.get('MF_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // Load certificate
    const { data: cert, error: certErr } = await supabase
      .from('certificates')
      .select('id, certificate_number, area_sqm, issued_at, project_id, purchase_id')
      .eq('id', certificate_id)
      .single();

    if (certErr || !cert) {
      return new Response(JSON.stringify({ error: 'Certificate not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch project name
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', cert.project_id)
      .maybeSingle();

    const projectName = project?.name || 'Projeto';

    // Optional holder name from purchase
    let holderName: string | undefined = undefined;
    try {
      const { data: purch } = await supabase
        .from('purchases')
        .select('buyer_email')
        .eq('id', cert.purchase_id)
        .maybeSingle();
      holderName = purch?.buyer_email || undefined;
    } catch {}

    const pdf = await generatePDF({
      certificateNumber: cert.certificate_number,
      projectName,
      area: cert.area_sqm,
      holderName,
      issuedAt: cert.issued_at,
    });

    // Upload to Storage
    const bucket = Deno.env.get('CERTIFICATES_BUCKET') || 'certificates';
    const path = `${cert.certificate_number}.pdf`;

    const { error: uploadErr } = await supabase
      .storage
      .from(bucket)
      .upload(path, new Blob([pdf.buffer], { type: 'application/pdf' }), { upsert: true, contentType: 'application/pdf' });

    if (uploadErr) {
      return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    const pdfUrl = pub.publicUrl;

    await supabase
      .from('certificates')
      .update({ pdf_url: pdfUrl })
      .eq('id', certificate_id);

    return new Response(JSON.stringify({ success: true, pdf_url: pdfUrl }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
