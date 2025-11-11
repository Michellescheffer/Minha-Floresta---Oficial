/**
 * 💳 useStripeCheckout Hook
 * Gerencia checkout com Stripe para compras e doações
 */

import { useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { 
  STRIPE_PUBLIC_KEY,
  STRIPE_ENDPOINTS,
  StripeCheckoutParams,
  StripeCheckoutResponse,
  getStripeErrorMessage,
  isStripeConfigured 
} from '../utils/supabase/stripeConfig';
import { publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../services/supabaseClient';

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = () => {
  if (!stripePromise && isStripeConfigured()) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

export interface UseStripeCheckoutReturn {
  clientSecret: string | null;
  isLoading: boolean;
  error: string | null;
  createPaymentIntent: (params: StripeCheckoutParams) => Promise<StripeCheckoutResponse>;
  confirmPayment: (
    stripe: Stripe,
    elements: StripeElements,
    returnUrl: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetCheckout: () => void;
}

export function useStripeCheckout(): UseStripeCheckoutReturn {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cria Payment Intent no Stripe
   */
  const createPaymentIntent = async (
    params: StripeCheckoutParams
  ): Promise<StripeCheckoutResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar se Stripe está configurado APENAS para fluxo embutido
      const isHostedFlow = Boolean((params as any)?.metadata?.use_hosted);
      if (!isHostedFlow && !isStripeConfigured()) {
        throw new Error('Stripe não está configurado. Contate o administrador.');
      }

      // Obter JWT do usuário quando autenticado; fallback para anon
      const { data: sessionData } = await supabase.auth.getSession();
      const bearer = sessionData?.session?.access_token || publicAnonKey;

      // Fazer request para Edge Function (backend exige JWT)
      const response = await fetch(STRIPE_ENDPOINTS.createCheckout, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearer}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar pagamento');
      }

      const data: StripeCheckoutResponse = await response.json();

      // Hosted Checkout (doação ou compra): se vier session_url, apenas retornar (redireciono no caller)
      if ((data as any).session_url) {
        return data;
      }

      // Embedded: requer client_secret
      if (!data.success || !data.client_secret) {
        throw new Error(data.error || 'Erro ao obter dados de pagamento');
      }

      setClientSecret(data.client_secret);
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error creating payment intent:', err);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Confirma pagamento com Stripe
   */
  const confirmPayment = async (
    stripe: Stripe,
    elements: StripeElements,
    returnUrl: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!stripe || !elements) {
        throw new Error('Stripe não está carregado');
      }

      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      if (confirmError) {
        const errorMessage = getStripeErrorMessage(confirmError.code);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Se chegou aqui, o pagamento foi confirmado
      // O usuário será redirecionado para return_url
      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao confirmar pagamento';
      setError(errorMessage);
      console.error('Error confirming payment:', err);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset estado do checkout
   */
  const resetCheckout = () => {
    setClientSecret(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    clientSecret,
    isLoading,
    error,
    createPaymentIntent,
    confirmPayment,
    resetCheckout,
  };
}

/**
 * Hook para obter instância do Stripe
 */
export function useStripe() {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const promise = getStripe();
    if (!promise) {
      // Stripe não configurado ou fluxo hospedado sem necessidade de Stripe no client
      setIsLoading(false);
      return () => { mounted = false; };
    }
    promise.then(stripeInstance => {
      if (!mounted) return;
      setStripe(stripeInstance);
      setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return { stripe, isLoading };
}
