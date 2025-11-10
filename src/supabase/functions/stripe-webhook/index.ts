/**
 * 🔔 Stripe Webhook - Edge Function
 * Processa eventos do Stripe (payment_intent.succeeded, etc)
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@14.5.0';
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ========================================================================
    // 1. INICIALIZAÇÃO
    // ========================================================================
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // 2. VALIDAR ASSINATURA
    // ========================================================================

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // 3. IDEMPOTÊNCIA - Verificar se evento já foi processado
    // ========================================================================

    const { data: existingEvent } = await supabase
      .from('stripe_events')
      .select('processed')
      .eq('stripe_event_id', event.id)
      .maybeSingle();

    if (existingEvent?.processed) {
      console.log(`Event ${event.id} already processed, skipping`);
      return new Response(
        JSON.stringify({ received: true, message: 'Event already processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Salvar evento
    await supabase
      .from('stripe_events')
      .upsert({
        stripe_event_id: event.id,
        event_type: event.type,
        event_data: event.data,
        processed: false,
      });

    // ========================================================================
    // 4. PROCESSAR EVENTO
    // ========================================================================

    console.log(`Processing event: ${event.type}`);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, supabase);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, supabase);
          break;

        case 'charge.refunded':
          await handleChargeRefunded(event.data.object as Stripe.Charge, supabase);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
          break;

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabase);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Marcar como processado
      await supabase
        .from('stripe_events')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('stripe_event_id', event.id);

      return new Response(
        JSON.stringify({ received: true, type: event.type }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (processingError) {
      console.error(`Error processing event ${event.id}:`, processingError);

      // Salvar erro
      await supabase
        .from('stripe_events')
        .update({
          error: processingError instanceof Error ? processingError.message : 'Unknown error',
          retry_count: (existingEvent?.retry_count || 0) + 1,
        })
        .eq('stripe_event_id', event.id);

      // Retornar 200 para evitar retries do Stripe
      return new Response(
        JSON.stringify({ received: true, error: 'Processing failed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Webhook Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * payment_intent.succeeded
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);

  const metadata = paymentIntent.metadata;
  const type = metadata.type;

  // Atualizar stripe_payment_intents
  await supabase
    .from('stripe_payment_intents')
    .update({ status: 'succeeded' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (type === 'purchase') {
    const purchaseId = metadata.purchase_id;

    // Atualizar purchase
    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        payment_status: 'paid',
        payment_date: new Date().toISOString(),
        stripe_charge_id: paymentIntent.latest_charge,
      })
      .eq('id', purchaseId);

    if (updateError) {
      console.error('Error updating purchase:', updateError);
      throw updateError;
    }

    // Buscar purchase_items
    const { data: purchaseItems } = await supabase
      .from('purchase_items')
      .select('project_id, quantity')
      .eq('purchase_id', purchaseId);

    if (purchaseItems) {
      // Atualizar estoque
      for (const item of purchaseItems) {
        await supabase.rpc('decrement_project_stock', {
          project_id: item.project_id,
          amount: item.quantity,
        });
      }

      // Gerar certificados
      const certificateType = metadata.certificate_type || 'digital';
      
      for (const item of purchaseItems) {
        const certificate_number = generateCertificateNumber();
        const certificateData = {
          purchase_id: purchaseId,
          project_id: item.project_id,
          area_sqm: item.quantity,
          certificate_number,
          certificate_type: certificateType,
          issued_at: new Date().toISOString(),
          status: 'issued',
        } as const;

        const { data: inserted, error: certErr } = await supabase
          .from('certificates')
          .insert(certificateData)
          .select('id, project_id, area_sqm, certificate_number')
          .single();

        if (certErr) {
          console.error('Failed to insert certificate:', certErr);
          continue;
        }

        try {
          // Generate a simple PDF certificate
          const pdfBytes = await generateCertificatePDF({
            certificateNumber: inserted.certificate_number,
            projectName: await getProjectName(supabase, inserted.project_id),
            area: inserted.area_sqm,
          });

          // Upload to Supabase Storage
          const bucket = Deno.env.get('CERTIFICATES_BUCKET') || 'certificates';
          const path = `${inserted.certificate_number}.pdf`;
          const uploadRes = await supabase
            .storage
            .from(bucket)
            .upload(path, new Blob([pdfBytes.buffer], { type: 'application/pdf' }), { upsert: true, contentType: 'application/pdf' });

          if ((uploadRes as any).error) {
            console.error('Failed to upload certificate PDF:', (uploadRes as any).error);
          } else {
            const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
            const pdfUrl = pub.publicUrl;
            await supabase
              .from('certificates')
              .update({ pdf_url: pdfUrl })
              .eq('id', inserted.id);
          }
        } catch (e) {
          console.error('Error generating/uploading PDF:', e);
        }
      }

      // Send email with certificate codes and verification links (optional)
      const email = paymentIntent.receipt_email || metadata.email;
      if (email && Deno.env.get('RESEND_API_KEY')) {
        try {
          const { data: certs } = await supabase
            .from('certificates')
            .select('certificate_number, pdf_url')
            .eq('purchase_id', purchaseId);
          const items = (certs || []).map((c: any) => `• Código: ${c.certificate_number}\n  Verificar: ${originUrl()}/verificar-certificado?numero=${c.certificate_number}\n  PDF: ${c.pdf_url || 'gerando...'}`).join('\n\n');
          await sendEmail(email, 'Seus Certificados - Minha Floresta',
            `Obrigado pela sua compra!\n\nAqui estão os detalhes dos seus certificados:\n\n${items}\n\n`);
        } catch (e) {
          console.error('Failed to send certificate email:', e);
        }
      }
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      action: 'purchase_completed',
      table_name: 'purchases',
      record_id: purchaseId,
      details: {
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
      },
    });

  } else if (type === 'donation') {
    const donationId = metadata.donation_id;

    if (donationId && donationId !== 'none') {
      // Atualizar donation existente (fluxos legados)
      await supabase
        .from('donations')
        .update({
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
        })
        .eq('id', donationId);

      await supabase.from('audit_logs').insert({
        action: 'donation_completed',
        table_name: 'donations',
        record_id: donationId,
        details: {
          payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
        },
      });

      // Tentar incrementar social_projects.funds_raised se conhecermos o projeto
      const projectId = metadata.project_id && metadata.project_id !== 'general' ? metadata.project_id : null;
      if (projectId) {
        try {
          await supabase.rpc('increment_decimal_column', {
            table_name: 'social_projects',
            id_column: 'id',
            target_id: projectId,
            column_name: 'funds_raised',
            increment_by: paymentIntent.amount / 100,
          });
        } catch (_) {
          // Fallback: update direto
          await supabase
            .from('social_projects')
            .update({ funds_raised: (supabase as any).sql`COALESCE(funds_raised,0)+${paymentIntent.amount/100}` })
            .eq('id', projectId);
        }
      }
    } else {
      // Criar donation nova (fluxo atual sem pré-insert)
      const amount = paymentIntent.amount / 100;
      const email = metadata.email || paymentIntent.receipt_email || null;
      const projectId = metadata.project_id && metadata.project_id !== 'general' ? metadata.project_id : null;

      const insertPayload: any = {
        user_id: metadata.user_id || null,
        project_id: projectId,
        amount,
        currency: paymentIntent.currency || 'brl',
        payment_method: 'stripe',
        payment_status: 'paid',
        payment_date: new Date().toISOString(),
        donor_name: metadata.donor_name || null,
        donor_email: email,
        is_anonymous: metadata.is_anonymous === 'true' || metadata.is_anonymous === true,
        message: metadata.message || null,
        stripe_payment_intent_id: paymentIntent.id,
      };

      const { data: created, error: insertErr } = await supabase
        .from('donations')
        .insert(insertPayload)
        .select('id, project_id')
        .single();

      if (insertErr) {
        console.error('Failed to insert donation:', insertErr);
      } else {
        await supabase.from('audit_logs').insert({
          action: 'donation_created',
          table_name: 'donations',
          record_id: created.id,
          details: {
            payment_intent_id: paymentIntent.id,
            amount,
            project_id: created.project_id || 'general',
          },
        });

        // Incrementar funds_raised do projeto social, se aplicável
        if (created.project_id) {
          try {
            await supabase.rpc('increment_decimal_column', {
              table_name: 'social_projects',
              id_column: 'id',
              target_id: created.project_id,
              column_name: 'funds_raised',
              increment_by: amount,
            });
          } catch (_) {
            // Fallback: update direto somando no lado do app (pode não funcionar sem SQL literal)
            const { data: proj } = await supabase
              .from('social_projects')
              .select('funds_raised')
              .eq('id', created.project_id)
              .single();
            const current = proj?.funds_raised || 0;
            await supabase
              .from('social_projects')
              .update({ funds_raised: Number(current) + amount })
              .eq('id', created.project_id);
          }
        }
      }
    }
  }
}

/**
 * payment_intent.payment_failed
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  console.log(`Payment failed: ${paymentIntent.id}`);

  const metadata = paymentIntent.metadata;
  const type = metadata.type;

  // Atualizar stripe_payment_intents
  await supabase
    .from('stripe_payment_intents')
    .update({ status: 'failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (type === 'purchase') {
    await supabase
      .from('purchases')
      .update({ payment_status: 'failed' })
      .eq('id', metadata.purchase_id);
  } else if (type === 'donation') {
    await supabase
      .from('donations')
      .update({ payment_status: 'failed' })
      .eq('id', metadata.donation_id);
  }
}

/**
 * charge.refunded
 */
async function handleChargeRefunded(
  charge: Stripe.Charge,
  supabase: any
) {
  console.log(`Charge refunded: ${charge.id}`);

  const paymentIntentId = charge.payment_intent as string;

  // Buscar purchase
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();

  if (purchase) {
    // Atualizar purchase
    await supabase
      .from('purchases')
      .update({
        payment_status: 'refunded',
        refund_id: charge.refunds?.data[0]?.id,
        refund_amount: charge.amount_refunded / 100,
        refund_date: new Date().toISOString(),
      })
      .eq('id', purchase.id);

    // Invalidar certificados
    await supabase
      .from('certificates')
      .update({ status: 'revoked', revoked_at: new Date().toISOString() })
      .eq('purchase_id', purchase.id);

    // Devolver ao estoque
    const { data: purchaseItems } = await supabase
      .from('purchase_items')
      .select('project_id, quantity')
      .eq('purchase_id', purchase.id);

    if (purchaseItems) {
      for (const item of purchaseItems) {
        await supabase.rpc('increment_project_stock', {
          project_id: item.project_id,
          amount: item.quantity,
        });
      }
    }
  }
}

/**
 * customer.subscription.created/updated
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: any
) {
  console.log(`Subscription updated: ${subscription.id}`);

  const metadata = subscription.metadata;

  await supabase
    .from('stripe_subscriptions')
    .upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      user_id: metadata.user_id,
      project_id: metadata.project_id,
      amount: subscription.items.data[0].price.unit_amount! / 100,
      currency: subscription.currency,
      interval: metadata.interval || 'monthly',
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      metadata,
    });
}

/**
 * customer.subscription.deleted
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any
) {
  console.log(`Subscription deleted: ${subscription.id}`);

  await supabase
    .from('stripe_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

/**
 * invoice.payment_succeeded (para subscriptions)
 */
async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: any
) {
  console.log(`Invoice paid: ${invoice.id}`);

  if (!invoice.subscription) return;

  // Buscar subscription
  const { data: subscription } = await supabase
    .from('stripe_subscriptions')
    .select('*')
    .eq('stripe_subscription_id', invoice.subscription)
    .maybeSingle();

  if (subscription) {
    // Criar donation recorrente
    await supabase.from('donations').insert({
      user_id: subscription.user_id,
      project_id: subscription.project_id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      payment_method: 'stripe',
      payment_status: 'paid',
      payment_date: new Date().toISOString(),
      is_recurring: true,
      stripe_subscription_id: subscription.stripe_subscription_id,
      stripe_payment_intent_id: invoice.payment_intent as string,
    });

    // Atualizar total_donated
    await supabase
      .from('stripe_subscriptions')
      .update({
        total_donated: subscription.total_donated + (invoice.amount_paid / 100),
      })
      .eq('id', subscription.id);
  }
}

/**
 * Gera número único de certificado
 */
function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `MFC-${timestamp}-${random}`.toUpperCase();
}

async function getProjectName(supabase: any, projectId: string): Promise<string> {
  const { data } = await supabase
    .from('projects')
    .select('name')
    .eq('id', projectId)
    .maybeSingle();
  return data?.name || 'Projeto';
}

async function generateCertificatePDF({ certificateNumber, projectName, area }: { certificateNumber: string; projectName: string; area: number; }): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const titleSize = 24;
  const textSize = 12;
  page.drawText('Certificado de Preservação', { x: 50, y: 780, size: titleSize, font, color: rgb(0.1, 0.5, 0.2) });
  page.drawText(`Código: ${certificateNumber}`, { x: 50, y: 740, size: textSize, font });
  page.drawText(`Projeto: ${projectName}`, { x: 50, y: 720, size: textSize, font });
  page.drawText(`Área preservada: ${area} m²`, { x: 50, y: 700, size: textSize, font });
  page.drawText('Obrigado por contribuir para a preservação da nossa floresta!', { x: 50, y: 660, size: textSize, font });
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

function originUrl(): string {
  const fallback = 'https://minhaflorestaconservacoes.com';
  return Deno.env.get('PUBLIC_SITE_URL') || fallback;
}

async function sendEmail(to: string, subject: string, text: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Minha Floresta <no-reply@minhafloresta.com>',
      to: [to],
      subject,
      text,
    }),
  });
}
