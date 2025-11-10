/**
 * Stripe Session Resolver - Edge Function
 * GET ?session_id=cs_test_... -> { payment_intent_id, email }
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.5.0';

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
    const sessionId = url.searchParams.get('session_id');
    if (!sessionId) {
      return json({ error: 'missing_session_id' }, 400);
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null;
    const email = session.customer_details?.email || session.customer_email || null;

    if (!paymentIntentId) {
      return json({ error: 'no_payment_intent' }, 404);
    }

    return json({ payment_intent_id: paymentIntentId, email }, 200);
  } catch (e) {
    console.error('stripe-session error', e);
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
