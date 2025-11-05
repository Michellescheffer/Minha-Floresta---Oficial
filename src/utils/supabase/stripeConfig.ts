/**
 * 💳 Stripe Configuration
 * Configurações centralizadas do Stripe para Minha Floresta Conservações
 */

import { projectId } from './info';

// ============================================================================
// STRIPE KEYS
// ============================================================================

/**
 * Publishable Key (Frontend)
 * Segura para uso no navegador
 */
export const STRIPE_PUBLIC_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PUBLIC_KEY) || 
  'pk_test_YOUR_KEY_HERE';

/**
 * Edge Function URL para Stripe
 */
export const STRIPE_EDGE_FUNCTION_URL = `https://${projectId}.supabase.co/functions/v1`;

// ============================================================================
// ENDPOINTS
// ============================================================================

export const STRIPE_ENDPOINTS = {
  // Criar Payment Intent
  createCheckout: `${STRIPE_EDGE_FUNCTION_URL}/stripe-checkout`,
  
  // Webhooks
  webhook: `${STRIPE_EDGE_FUNCTION_URL}/stripe-webhook`,
  
  // Subscriptions
  createSubscription: `${STRIPE_EDGE_FUNCTION_URL}/stripe-subscription/create`,
  cancelSubscription: `${STRIPE_EDGE_FUNCTION_URL}/stripe-subscription/cancel`,
  updateSubscription: `${STRIPE_EDGE_FUNCTION_URL}/stripe-subscription/update`,
  
  // Refunds (Admin)
  processRefund: `${STRIPE_EDGE_FUNCTION_URL}/stripe-refund`,
} as const;

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

export const STRIPE_CONFIG = {
  // Moeda padrão
  currency: 'brl' as const,
  
  // Locale para formatação
  locale: 'pt-BR' as const,
  
  // Appearance customization para Stripe Elements
  appearance: {
    theme: 'none' as const,
    variables: {
      colorPrimary: '#10b981', // Verde da marca
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
    rules: {
      '.Input': {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      '.Input:focus': {
        border: '1px solid rgba(16, 185, 129, 0.5)',
        boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
      },
      '.Label': {
        fontWeight: '600',
        color: '#1f2937',
      },
    },
  },
  
  // Elementos habilitados
  elements: {
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      },
    ],
  },
} as const;

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export const SUPPORTED_PAYMENT_METHODS = {
  card: {
    enabled: true,
    label: 'Cartão de Crédito/Débito',
    icon: 'CreditCard',
    fees: {
      percentage: 3.99,
      fixed: 0.39, // BRL
    },
  },
  // PIX e Boleto requerem integração adicional no Brasil
  // Stripe não suporta nativamente - considerar Mercado Pago no futuro
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formata valor em centavos para Stripe
 * Stripe trabalha com centavos (integers)
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Formata centavos do Stripe para reais
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Formata valor em BRL
 */
export function formatBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

/**
 * Calcula taxa do Stripe
 */
export function calculateStripeFee(amount: number): {
  subtotal: number;
  fee: number;
  total: number;
} {
  const { percentage, fixed } = SUPPORTED_PAYMENT_METHODS.card.fees;
  const fee = (amount * percentage / 100) + fixed;
  
  return {
    subtotal: amount,
    fee: Number(fee.toFixed(2)),
    total: Number((amount + fee).toFixed(2)),
  };
}

/**
 * Valida se Stripe está configurado
 */
export function isStripeConfigured(): boolean {
  return STRIPE_PUBLIC_KEY !== 'pk_test_YOUR_KEY_HERE' && 
         STRIPE_PUBLIC_KEY.startsWith('pk_');
}

// ============================================================================
// METADATA BUILDERS
// ============================================================================

/**
 * Cria metadata para Payment Intent de compra
 */
export function buildPurchaseMetadata(params: {
  userId?: string;
  email: string;
  certificateType: 'digital' | 'physical' | 'both';
  itemCount: number;
  projectIds: string[];
}): Record<string, string> {
  return {
    type: 'purchase',
    user_id: params.userId || 'anonymous',
    email: params.email,
    certificate_type: params.certificateType,
    item_count: String(params.itemCount),
    project_ids: params.projectIds.join(','),
    source: 'minha_floresta_web',
  };
}

/**
 * Cria metadata para Payment Intent de doação
 */
export function buildDonationMetadata(params: {
  userId?: string;
  email: string;
  projectId?: string;
  isRecurring: boolean;
}): Record<string, string> {
  return {
    type: 'donation',
    user_id: params.userId || 'anonymous',
    email: params.email,
    project_id: params.projectId || 'general',
    is_recurring: String(params.isRecurring),
    source: 'minha_floresta_web',
  };
}

/**
 * Cria metadata para Subscription
 */
export function buildSubscriptionMetadata(params: {
  userId: string;
  projectId: string;
  interval: 'monthly' | 'quarterly' | 'yearly';
}): Record<string, string> {
  return {
    type: 'subscription',
    user_id: params.userId,
    project_id: params.projectId,
    interval: params.interval,
    source: 'minha_floresta_web',
  };
}

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const STRIPE_ERROR_MESSAGES: Record<string, string> = {
  // Card errors
  card_declined: 'Cartão recusado. Tente outro cartão ou método de pagamento.',
  insufficient_funds: 'Fundos insuficientes. Tente outro cartão.',
  invalid_card_number: 'Número do cartão inválido.',
  invalid_expiry_date: 'Data de validade inválida.',
  invalid_cvc: 'Código de segurança (CVC) inválido.',
  expired_card: 'Cartão expirado. Use outro cartão.',
  incorrect_cvc: 'Código de segurança incorreto.',
  
  // Processing errors
  processing_error: 'Erro ao processar pagamento. Tente novamente.',
  rate_limit: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  
  // Network errors
  api_error: 'Erro de conexão. Verifique sua internet e tente novamente.',
  
  // Default
  generic_error: 'Ocorreu um erro inesperado. Tente novamente ou contate o suporte.',
};

/**
 * Traduz código de erro do Stripe
 */
export function getStripeErrorMessage(code?: string): string {
  if (!code) return STRIPE_ERROR_MESSAGES.generic_error;
  return STRIPE_ERROR_MESSAGES[code] || STRIPE_ERROR_MESSAGES.generic_error;
}

// ============================================================================
// TIPOS TYPESCRIPT
// ============================================================================

export interface StripeCheckoutParams {
  type: 'purchase' | 'donation';
  items?: Array<{
    project_id: string;
    quantity: number;
    price: number;
  }>;
  donation_amount?: number;
  donation_project_id?: string;
  user_id?: string;
  email: string;
  metadata?: {
    certificate_type?: 'digital' | 'physical' | 'both';
    shipping_address?: any;
    [key: string]: any;
  };
}

export interface StripeCheckoutResponse {
  success: boolean;
  client_secret?: string;
  payment_intent_id?: string;
  amount?: number;
  currency?: string;
  error?: string;
}

export interface StripeSubscriptionParams {
  user_id: string;
  email: string;
  project_id: string;
  amount: number;
  interval: 'monthly' | 'quarterly' | 'yearly';
  payment_method_id?: string;
}

export interface StripeRefundParams {
  purchase_id: string;
  reason: 'requested_by_customer' | 'fraudulent' | 'duplicate';
  amount?: number;
}
