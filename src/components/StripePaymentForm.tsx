/**
 * 💳 Stripe Payment Form Component
 * Formulário de pagamento integrado com Stripe Elements
 */

import React, { useState } from 'react';
import { 
  PaymentElement,
  useStripe,
  useElements 
} from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { formatBRL } from '../utils/supabase/stripeConfig';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  returnUrl: string;
  buttonText?: string;
  showAmount?: boolean;
}

export function StripePaymentForm({
  amount,
  onSuccess,
  onError,
  returnUrl,
  buttonText = 'Pagar Agora',
  showAmount = true,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Submit the form to validate fields
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message || 'Erro ao validar dados');
      }

      // Confirm the payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'always',
      });

      if (confirmError) {
        throw new Error(confirmError.message || 'Erro ao processar pagamento');
      }

      // Pagamento confirmado
      onSuccess();
      // Garantir navegação se o Stripe não redirecionar por algum motivo
      try { window.location.href = returnUrl; } catch {}

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setErrorMessage(errorMsg);
      onError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
          <CreditCard className="w-8 h-8" />
        </div>
        {showAmount && (
          <div>
            <p className="text-sm text-gray-600">Total a pagar</p>
            <p className="text-3xl text-gray-900">{formatBRL(amount)}</p>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Element */}
        <div className="glass-card p-6 rounded-2xl">
          <PaymentElement
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card'],
            }}
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Lock className="w-4 h-4" />
          <span>Pagamento seguro via Stripe</span>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl disabled:opacity-50"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processando...
            </span>
          ) : (
            <span>{buttonText}</span>
          )}
        </Button>

        {/* Footer Info */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>📜 Certificado digital disponível imediatamente</p>
          <p>🔒 Seus dados estão protegidos e criptografados</p>
        </div>
      </form>
    </div>
  );
}

/**
 * Wrapper com Stripe Elements Provider
 */
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLIC_KEY, STRIPE_CONFIG } from '../utils/supabase/stripeConfig';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface StripePaymentFormWrapperProps extends StripePaymentFormProps {
  clientSecret: string;
}

export function StripePaymentFormWrapper({
  clientSecret,
  ...props
}: StripePaymentFormWrapperProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: STRIPE_CONFIG.appearance,
        locale: STRIPE_CONFIG.locale,
      }}
    >
      <StripePaymentForm {...props} />
    </Elements>
  );
}
