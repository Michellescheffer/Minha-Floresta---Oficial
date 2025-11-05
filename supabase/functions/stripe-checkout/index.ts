/**
 * 💳 Stripe Checkout - Edge Function
 * Cria Payment Intent para compras e doações
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@14.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

      // Validar estoque
      for (const item of items) {
        const { data: project, error } = await supabase
          .from('projects')
          .select('available_m2, price_per_m2')
          .eq('id', item.project_id)
          .single();

        if (error || !project) {
          return new Response(
            JSON.stringify({ error: `Project ${item.project_id} not found` }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (project.available_m2 < item.quantity) {
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

      // Calcular total
      const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const amountInCents = Math.round(total * 100);

      // Criar Payment Intent no Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'brl',
        receipt_email: email,
        metadata: {
          type: 'purchase',
          purchase_id: 'none',
          user_id: user_id || 'anonymous',
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

      // Criar registro de doação (status: pending)
      const { data: donation, error: donationError } = await supabase
        .from('donations')
        .insert({
          user_id: user_id || null,
          project_id: donation_project_id || null,
          amount: donation_amount,
          currency: 'brl',
          payment_method: 'stripe',
          payment_status: 'pending',
          donor_name: metadata.donor_name || null,
          donor_email: email,
          is_anonymous: metadata.is_anonymous || false,
          is_recurring: false,
          message: metadata.message || null,
        })
        .select()
        .single();

      if (donationError || !donation) {
        console.error('Error creating donation:', donationError);
        return new Response(
          JSON.stringify({ error: 'Failed to create donation record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Criar Payment Intent no Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'brl',
        receipt_email: email,
        metadata: {
          type: 'donation',
          donation_id: donation.id,
          user_id: user_id || 'anonymous',
          email,
          project_id: donation_project_id || 'general',
          is_anonymous: String(metadata.is_anonymous || false),
        },
      });

      // Salvar em stripe_payment_intents
      const { error: piError } = await supabase
        .from('stripe_payment_intents')
        .insert({
          stripe_payment_intent_id: paymentIntent.id,
          stripe_client_secret: paymentIntent.client_secret,
          donation_id: donation.id,
          amount: donation_amount,
          currency: 'brl',
          status: paymentIntent.status,
          metadata: paymentIntent.metadata,
        });

      if (piError) {
        console.error('Error saving payment intent:', piError);
      }

      // Atualizar donation com stripe_payment_intent_id
      await supabase
        .from('donations')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('id', donation.id);

      return new Response(
        JSON.stringify({
          success: true,
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
          donation_id: donation.id,
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
