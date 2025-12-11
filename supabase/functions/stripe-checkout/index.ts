/**
 * 💳 Stripe Checkout - Edge Function
 * Cria Payment Intent para compras e doações
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@14.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, sentry-trace, baggage',
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, serviceKey);

    // ========================================================================
    // 2. VALIDAÇÃO DA REQUEST
    // ========================================================================

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const {
      type,
      items,
      donation_amount,
      donation_project_id,
      user_id,
      email,
      metadata = {},
    } = body;

    // Login exigido no front; no backend, user_id é preferido mas opcional temporariamente
    const fallbackUserId = user_id && user_id !== 'anonymous' ? user_id : (email ? `email:${email}` : 'anonymous');

    // Validação básica
    if (!type || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type !== 'purchase' && type !== 'donation') {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Must be "purchase" or "donation"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // 3. PROCESSAR COMPRA
    // ========================================================================

    if (type === 'purchase') {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Items required for purchase' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validar estoque (relaxado para não bloquear o checkout)
      try {
        for (const item of items) {
          const { data: project, error } = await supabase
            .from('projects')
            .select('available_m2, price_per_m2')
            .eq('id', item.project_id)
            .single();

          if (error || !project) {
            // Log e continua (schema pode diferir neste ambiente)
            console.warn('Stock validation skipped: project not found or schema mismatch', item.project_id);
            continue;
          }

          if (typeof project.available_m2 === 'number' && project.available_m2 < item.quantity) {
            return new Response(
              JSON.stringify({
                error: `Insufficient stock for project ${item.project_id}`,
                available: project.available_m2,
                requested: item.quantity
              }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (e) {
        console.warn('Stock validation error (non-blocking):', e);
      }

      // Calcular total
      const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const amountInCents = Math.round(total * 100);

      const useHosted = Boolean((metadata && (metadata as any).use_hosted) || false);

      // Hosted Checkout for purchases
      if (useHosted) {
        const lineItems = items.map((item: any) => ({
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Compra - Projeto ${item.project_id}`,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: Math.max(1, Math.round(item.quantity)),
        }));

        const successUrl = (metadata && (metadata as any).success_url)
          || `${new URL(req.url).origin}/#checkout-return?p=purchases&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = (metadata && (metadata as any).cancel_url) || `${new URL(req.url).origin}/#loja`;

        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: lineItems,
          success_url: successUrl,
          cancel_url: cancelUrl,
          allow_promotion_codes: false,
          metadata: {
            type: 'purchase',
            user_id: fallbackUserId,
            email,
            item_count: String(items.length),
            project_ids: items.map((i: any) => i.project_id).join(','),
          },
          // Ensure the PaymentIntent generated by Checkout carries our metadata
          payment_intent_data: {
            metadata: {
              type: 'purchase',
              user_id: fallbackUserId,
              email,
              certificate_type: (metadata as any)?.certificate_type || 'digital',
              item_count: String(items.length),
              project_ids: items.map((i: any) => i.project_id).join(','),
              // Persist full items so webhook/reconcile can create purchase_items
              items_json: JSON.stringify(
                items.map((i: any) => ({ project_id: i.project_id, quantity: Math.max(1, Math.round(i.quantity)), price: i.price }))
              ),
            },
          },
        });

        return new Response(
          JSON.stringify({ success: true, session_url: session.url }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Embedded flow: Criar Payment Intent no Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'brl',
        receipt_email: email,
        metadata: {
          type: 'purchase',
          purchase_id: 'none',
          user_id: user_id,
          email,
          certificate_type: metadata.certificate_type || 'digital',
          item_count: String(items.length),
          project_ids: items.map(i => i.project_id).join(','),
        },
      });

      // Salvar em stripe_payment_intents
      const { error: piError } = await supabase
        .from('stripe_payment_intents')
        .insert({
          stripe_payment_intent_id: paymentIntent.id,
          stripe_client_secret: paymentIntent.client_secret,
          purchase_id: null,
          amount: total,
          currency: 'brl',
          status: paymentIntent.status,
          metadata: paymentIntent.metadata,
        });

      if (piError) {
        console.error('Error saving payment intent:', piError);
        // Não falhamos a request por isso
      }

      return new Response(
        JSON.stringify({
          success: true,
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
          purchase_id: null,
          amount: total,
          currency: 'brl',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // 4. PROCESSAR DOAÇÃO
    // ========================================================================

    if (type === 'donation') {
      if (!donation_amount || donation_amount <= 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid donation amount' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const amountInCents = Math.round(donation_amount * 100);
      const useHosted = Boolean((metadata && (metadata as any).use_hosted) || false);
      const successUrl = (metadata && (metadata as any).success_url)
        || `${new URL(req.url).origin}/#checkout-return?p=donations&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = (metadata && (metadata as any).cancel_url) || `${new URL(req.url).origin}/#doacoes`;

      // Hosted Checkout (Stripe Checkout Session)
      if (useHosted) {
        const projectTitle = (metadata && (metadata as any).project_title) || null;
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'brl',
                product_data: {
                  name: donation_project_id
                    ? (projectTitle ? `Doação para ${projectTitle}` : `Doação para projeto ${donation_project_id}`)
                    : 'Doação Geral',
                },
                unit_amount: amountInCents,
              },
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          allow_promotion_codes: false,
          payment_intent_data: {
            metadata: {
              type: 'donation',
              project_id: donation_project_id || 'general',
              user_id: user_id || 'anonymous',
              email,
              donor_name: metadata?.donor_name || '',
              donor_phone: metadata?.donor_phone || '',
              message: metadata?.message || '',
              is_anonymous: String(metadata?.is_anonymous || false),
              source: 'minha_floresta_web',
            }
          },
          metadata: {
            type: 'donation',
            project_id: donation_project_id || 'general',
            user_id: user_id || 'anonymous',
            email,
            donor_name: metadata?.donor_name || '',
            donor_phone: metadata?.donor_phone || '',
            message: metadata?.message || '',
            is_anonymous: String(metadata?.is_anonymous || false),
            source: 'minha_floresta_web',
          },
        });

        return new Response(
          JSON.stringify({ success: true, session_url: session.url }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Embedded (PaymentIntent + Elements)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'brl',
        receipt_email: email,
        metadata: {
          type: 'donation',
          donation_id: 'none',
          user_id: user_id,
          email,
          project_id: donation_project_id || 'general',
          donor_name: metadata?.donor_name || '',
          donor_phone: metadata?.donor_phone || '',
          message: metadata?.message || '',
          is_anonymous: String(metadata?.is_anonymous || false),
        },
      });

      const { error: piError } = await supabase
        .from('stripe_payment_intents')
        .insert({
          stripe_payment_intent_id: paymentIntent.id,
          stripe_client_secret: paymentIntent.client_secret,
          donation_id: null,
          amount: donation_amount,
          currency: 'brl',
          status: paymentIntent.status,
          metadata: paymentIntent.metadata,
        });

      if (piError) {
        console.error('Error saving payment intent:', piError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
          amount: donation_amount,
          currency: 'brl',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Não deveria chegar aqui
    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Stripe Checkout Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
