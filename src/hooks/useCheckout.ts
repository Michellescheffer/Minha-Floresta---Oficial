import { useState } from 'react';

export interface CheckoutData {
  email: string;
  name: string;
  phone: string;
  document: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: 'credit_card' | 'pix' | 'bank_slip';
  cardData?: {
    number: string;
    holder: string;
    expiry: string;
    cvv: string;
  };
  certificateType: 'digital' | 'physical' | 'both';
  total: number;
  items: Array<{
    projectId: string;
    quantity: number;
    price: number;
  }>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  message: string;
  certificateIds?: string[];
}

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (checkoutData: CheckoutData): Promise<PaymentResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate payment processing based on method
      let response: PaymentResponse;
      
      switch (checkoutData.paymentMethod) {
        case 'pix':
          response = {
            success: true,
            transactionId: `PIX_${Date.now()}`,
            paymentUrl: `https://pix.example.com/qr/${Date.now()}`,
            message: 'QR Code PIX gerado com sucesso. Pagamento válido por 15 minutos.',
            certificateIds: generateCertificateIds(checkoutData.items.length)
          };
          break;
          
        case 'bank_slip':
          response = {
            success: true,
            transactionId: `BOLETO_${Date.now()}`,
            paymentUrl: `https://boleto.example.com/${Date.now()}`,
            message: 'Boleto gerado com sucesso. Vencimento em 3 dias úteis.',
            certificateIds: generateCertificateIds(checkoutData.items.length)
          };
          break;
          
        case 'credit_card':
        default:
          // Simulate credit card validation
          if (!checkoutData.cardData || checkoutData.cardData.number.length < 13) {
            throw new Error('Dados do cartão inválidos');
          }
          
          response = {
            success: true,
            transactionId: `CC_${Date.now()}`,
            message: 'Pagamento aprovado com sucesso!',
            certificateIds: generateCertificateIds(checkoutData.items.length)
          };
          break;
      }

      // Save transaction to localStorage for reference
      const transactions = JSON.parse(localStorage.getItem('minha_floresta_transactions') || '[]');
      const transaction = {
        id: response.transactionId,
        data: checkoutData,
        response,
        createdAt: new Date().toISOString(),
        status: 'completed'
      };
      transactions.unshift(transaction);
      localStorage.setItem('minha_floresta_transactions', JSON.stringify(transactions.slice(0, 50))); // Keep last 50

      return response;
    } catch (err) {
      console.error('Error processing payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro no processamento do pagamento';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const validateCEP = async (cep: string): Promise<{
    valid: boolean;
    address?: {
      street: string;
      neighborhood: string;
      city: string;
      state: string;
    };
  }> => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate CEP validation delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Remove non-numeric characters
      const cleanCEP = cep.replace(/\D/g, '');
      
      if (cleanCEP.length !== 8) {
        return { valid: false };
      }

      // Mock address data for demonstration
      const mockAddresses: Record<string, any> = {
        '01310100': {
          street: 'Avenida Paulista',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP'
        },
        '20040020': {
          street: 'Rua Presidente Vargas',
          neighborhood: 'Centro',
          city: 'Rio de Janeiro',
          state: 'RJ'
        },
        '70040010': {
          street: 'Esplanada dos Ministérios',
          neighborhood: 'Zona Cívico-Administrativa',
          city: 'Brasília',
          state: 'DF'
        }
      };

      const address = mockAddresses[cleanCEP];
      
      if (address) {
        return { valid: true, address };
      }

      // For other CEPs, generate a generic valid response
      return {
        valid: true,
        address: {
          street: 'Rua Example',
          neighborhood: 'Centro',
          city: 'Cidade Example',
          state: 'SP'
        }
      };
    } catch (err) {
      console.error('Error validating CEP:', err);
      setError('Erro ao validar CEP');
      return { valid: false };
    } finally {
      setIsLoading(false);
    }
  };

  const calculateShipping = async (cep: string, certificateType: string): Promise<{
    price: number;
    estimatedDays: number;
  }> => {
    try {
      // Simulate shipping calculation delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (certificateType === 'digital') {
        return { price: 0, estimatedDays: 0 };
      }

      // Mock shipping calculation based on CEP
      const cleanCEP = cep.replace(/\D/g, '');
      const region = cleanCEP.substring(0, 2);
      
      let price = 15.00; // Base price
      let estimatedDays = 7; // Base days
      
      // Adjust based on region
      if (['01', '02', '03', '04', '05', '08'].includes(region)) {
        // São Paulo metropolitan area
        price = 10.00;
        estimatedDays = 3;
      } else if (['20', '21', '22', '23', '24', '28'].includes(region)) {
        // Rio de Janeiro metropolitan area
        price = 12.00;
        estimatedDays = 5;
      } else if (region === '70') {
        // Brasília
        price = 18.00;
        estimatedDays = 6;
      }

      return { price, estimatedDays };
    } catch (err) {
      console.error('Error calculating shipping:', err);
      return { price: 20.00, estimatedDays: 10 }; // Fallback
    }
  };

  return {
    isLoading,
    error,
    processPayment,
    validateCEP,
    calculateShipping
  };
}

function generateCertificateIds(count: number): string[] {
  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(`cert_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`);
  }
  return ids;
}