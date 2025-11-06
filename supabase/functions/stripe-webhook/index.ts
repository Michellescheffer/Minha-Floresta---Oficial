/**
 * 🔔 Stripe Webhook - Edge Function
 * Processa eventos do Stripe para confirmar pagamentos, persistir doações
 * e atualizar progresso de projetos sociais
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@14.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const sig = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!sig || !webhookSecret) {
      return new Response(JSON.stringify({ error: 'Missing signature or secret' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Idempotency via stripe_events table
    try {
      const { error: evtErr } = await supabase.from('stripe_events').insert({
        id: event.id,
        type: event.type,
        payload: event as any,
      });
      if (evtErr && !String(evtErr.message || '').includes('duplicate key')) {
        console.error('stripe_events insert error', evtErr);
      }
    } catch (e) {
      // continue
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const amount = (pi.amount_received ?? pi.amount ?? 0) / 100;
      const metadata = (pi.metadata || {}) as Record<string, string>;

      const donationId = metadata['donation_id'];
      const projectId = metadata['project_id'] && metadata['project_id'] !== 'general' ? metadata['project_id'] : null;
      const donorName = metadata['donor_name'] || '';
      const donorPhone = metadata['donor_phone'] || '';
      const donorEmail = metadata['email'] || pi.receipt_email || '';
      const message = metadata['message'] || '';
      const isAnonymous = (metadata['is_anonymous'] || 'false') === 'true';

      // 1) Persist donation if not already persisted
      if (!donationId || donationId === 'none') {
        const { data: donation, error: dErr } = await supabase
          .from('donations')
          .insert({
            project_id: projectId,
            donor_name: isAnonymous ? null : donorName || null,
            donor_email: donorEmail || null,
            donor_phone: donorPhone || null,
            message: message || null,
            amount,
            status: 'paid',
            is_anonymous: isAnonymous,
            stripe_payment_intent_id: pi.id,
          })
          .select('*')
          .single();

        if (dErr) {
          console.error('donations insert error', dErr);
        }

        // 2) Update social_projects.funds_raised when applicable
        if (projectId && amount > 0) {
          const { error: upErr } = await supabase.rpc('increment_project_funds', {
            p_project_id: projectId,
            p_amount: amount,
          });

          if (upErr) {
            // fallback update
            await supabase
              .from('social_projects')
              .update({ funds_raised: (amount as number) + 0 })
              .eq('id', projectId);
          }
        }
      }

      // 3) Update payment intents table if exists
      try {
        await supabase
          .from('stripe_payment_intents')
          .update({ status: pi.status })
          .eq('stripe_payment_intent_id', pi.id);
      } catch {}
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
