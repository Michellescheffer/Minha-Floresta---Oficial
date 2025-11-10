// deno-lint-ignore-file
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  CERTIFICATES_BUCKET?: string;
}

export const handler = async (req: Request): Promise<Response> => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const { SUPABASE_URL, SUPABASE_ANON_KEY, CERTIFICATES_BUCKET } = Deno.env.toObject() as Env;
    const bucket = CERTIFICATES_BUCKET || 'certificates';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: req.headers.get('Authorization') || '' }}});

    const body = await req.json().catch(() => ({}));
    const { certificate_id, certificate_number } = body as { certificate_id?: string; certificate_number?: string };

    if (!certificate_id && !certificate_number) {
      return new Response(JSON.stringify({ error: 'certificate_id or certificate_number is required' }), { status: 400 });
    }

    const { data: cert, error: certErr } = await supabase
      .from('certificates')
      .select(`id, certificate_number, area_sqm, issued_at, status, project_id, projects(name)`) 
      .match(certificate_id ? { id: certificate_id } : { certificate_number })
      .maybeSingle();

    if (certErr || !cert) {
      return new Response(JSON.stringify({ error: certErr?.message || 'Certificate not found' }), { status: 404 });
    }

    const pdfBytes = await generateCertificatePdf({
      certificateNumber: cert.certificate_number,
      projectName: (cert.projects as any)?.name || 'Projeto',
      areaSqm: Number(cert.area_sqm || 0),
      issuedAt: cert.issued_at || new Date().toISOString(),
      status: cert.status || 'issued',
    });

    const filePath = `${cert.certificate_number}.pdf`;
    const { error: uploadErr } = await supabase
      .storage
      .from(bucket)
      .upload(filePath, new Blob([pdfBytes]), { contentType: 'application/pdf', upsert: true });

    if (uploadErr) {
      return new Response(JSON.stringify({ error: uploadErr.message || 'Failed to upload PDF' }), { status: 500 });
    }

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(filePath);
    const pdfUrl = pub.publicUrl;

    const { error: updateErr } = await supabase
      .from('certificates')
      .update({ pdf_url: pdfUrl })
      .eq('id', cert.id);

    if (updateErr) {
      return new Response(JSON.stringify({ error: updateErr.message || 'Failed to update certificate' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, pdf_url: pdfUrl }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unexpected error' }), { status: 500 });
  }
};

async function generateCertificatePdf({ certificateNumber, projectName, areaSqm, issuedAt, status }: { certificateNumber: string; projectName: string; areaSqm: number; issuedAt: string; status: string; }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({ x: 40, y: 40, width: page.getWidth() - 80, height: page.getHeight() - 80, borderColor: rgb(0.2, 0.6, 0.4), borderWidth: 2 });
  page.drawText('Certificado de Conservação', { x: 70, y: 760, size: 22, font, color: rgb(0.1, 0.5, 0.3) });
  page.drawText(`Número: ${certificateNumber}`, { x: 70, y: 720, size: 14, font });
  page.drawText(`Projeto: ${projectName}`, { x: 70, y: 695, size: 14, font });
  page.drawText(`Área: ${areaSqm} m²`, { x: 70, y: 670, size: 14, font });
  page.drawText(`Emitido em: ${new Date(issuedAt).toLocaleDateString('pt-BR')}`, { x: 70, y: 645, size: 14, font });
  page.drawText(`Status: ${status}`, { x: 70, y: 620, size: 14, font });

  const bytes = await pdfDoc.save();
  return bytes;
}

Deno.serve(handler);
