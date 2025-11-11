import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@14.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

type ReconcileResponse = {
  payment_intent_id: string | null;
  status?: string | null;
  email?: string | null;
  created?: number | null;
  amount?: number | null;
  currency?: string | null;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    const piId = url.searchParams.get('payment_intent_id');

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseUrl = Deno.env.get('MF_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRole = Deno.env.get('MF_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    let payment_intent_id: string | null = piId || null;
    let email: string | null = null;
    let status: string | null = null;
    let created: number | null = null;

    // Resolve from session if needed
    if (!payment_intent_id && sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const pi = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null;
      payment_intent_id = pi;
      email = session.customer_details?.email || session.customer_email || null;
      status = session.payment_status || null;
      created = session.created || null;
    }

    if (!payment_intent_id) {
      return new Response(JSON.stringify({ error: 'Missing session_id or payment_intent_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch PI to get metadata/amount/currency/status
    const pi = await stripe.paymentIntents.retrieve(payment_intent_id);
    const amount = (pi.amount_received ?? pi.amount ?? 0) / 100;
    const currency = pi.currency || 'brl';
    status = pi.status || status;
    if (!email) {
      // try to infer email from charges or receipt
      const charge = typeof pi.latest_charge === 'string' ? await stripe.charges.retrieve(pi.latest_charge) : null;
      email = charge?.billing_details?.email || pi.receipt_email || email || null;
    }

    // Upsert into stripe_payment_intents
    const { data: existing } = await supabase
      .from('stripe_payment_intents')
      .select('id')
      .eq('stripe_payment_intent_id', payment_intent_id)
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('stripe_payment_intents')
        .update({ status: pi.status, amount, currency, email: email ?? null, metadata: pi.metadata || {} })
        .eq('stripe_payment_intent_id', payment_intent_id);
    } else {
      await supabase
        .from('stripe_payment_intents')
        .insert({
          stripe_payment_intent_id: payment_intent_id,
          stripe_client_secret: pi.client_secret ?? null,
          purchase_id: null,
          donation_id: null,
          amount,
          currency,
          status: pi.status,
          email: email ?? null,
          metadata: pi.metadata || {},
        });
    }

    const body: ReconcileResponse = {
      payment_intent_id,
      status,
      email,
      created,
      amount,
      currency,
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('stripe-reconcile error', e);
    return new Response(JSON.stringify({ error: 'server_error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
