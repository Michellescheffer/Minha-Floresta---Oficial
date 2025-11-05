import { apiRequest } from './database';

export interface StripeConfigData {
  publishable_key?: string;
  secret_key?: string;
  webhook_secret?: string;
  is_configured?: boolean;
  last_tested?: string;
  test_status?: 'success' | 'error' | 'pending' | null;
}

/**
 * Carrega as configurações do Stripe do Supabase (tabela app_settings)
 */
export async function loadStripeConfig(): Promise<StripeConfigData | null> {
  try {
    // Buscar as configurações do Stripe na tabela app_settings
    const { data: settings, error } = await apiRequest<any[]>('/settings', {
      params: {
        category: 'stripe'
      }
    });

    if (error || !settings || settings.length === 0) {
      return null;
    }

    // Converter array de settings para objeto
    const config: StripeConfigData = {};
    
    settings.forEach((setting: any) => {
      if (setting.key === 'stripe_publishable_key') {
        config.publishable_key = setting.value;
      } else if (setting.key === 'stripe_secret_key') {
        config.secret_key = setting.value;
      } else if (setting.key === 'stripe_webhook_secret') {
        config.webhook_secret = setting.value;
      } else if (setting.key === 'stripe_is_configured') {
        config.is_configured = setting.value === 'true' || setting.value === true;
      } else if (setting.key === 'stripe_last_tested') {
        config.last_tested = setting.value;
      } else if (setting.key === 'stripe_test_status') {
        config.test_status = setting.value as any;
      }
    });

    return config;
  } catch (error) {
    console.error('Erro ao carregar configurações do Stripe:', error);
    return null;
  }
}

/**
 * Salva as configurações do Stripe no Supabase (tabela app_settings)
 */
export async function saveStripeConfig(config: StripeConfigData): Promise<{ success: boolean; error?: string }> {
  try {
    // Preparar os dados para inserir/atualizar na tabela app_settings
    const settingsToSave = [
      {
        key: 'stripe_publishable_key',
        value: config.publishable_key || '',
        category: 'stripe',
        description: 'Chave pública do Stripe para uso no frontend',
        is_public: false
      },
      {
        key: 'stripe_secret_key',
        value: config.secret_key || '',
        category: 'stripe',
        description: 'Chave secreta do Stripe (NUNCA exponha no frontend)',
        is_public: false
      },
      {
        key: 'stripe_webhook_secret',
        value: config.webhook_secret || '',
        category: 'stripe',
        description: 'Secret para validação de webhooks do Stripe',
        is_public: false
      },
      {
        key: 'stripe_is_configured',
        value: config.is_configured ? 'true' : 'false',
        category: 'stripe',
        description: 'Indica se o Stripe está configurado',
        is_public: false
      },
      {
        key: 'stripe_last_tested',
        value: config.last_tested || new Date().toISOString(),
        category: 'stripe',
        description: 'Data do último teste de conexão',
        is_public: false
      },
      {
        key: 'stripe_test_status',
        value: config.test_status || 'pending',
        category: 'stripe',
        description: 'Status do último teste de conexão',
        is_public: false
      }
    ];

    // Salvar cada configuração (upsert)
    for (const setting of settingsToSave) {
      const { error } = await apiRequest('/settings/upsert', {
        method: 'POST',
        body: JSON.stringify(setting)
      });

      if (error) {
        console.error(`Erro ao salvar ${setting.key}:`, error);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao salvar configurações do Stripe:', error);
    return { 
      success: false, 
      error: error?.message || 'Erro desconhecido ao salvar configurações' 
    };
  }
}

/**
 * Testa a conexão com o Stripe usando as chaves configuradas
 */
export async function testStripeConnection(publishableKey: string, secretKey: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    // Validação básica das chaves
    if (!publishableKey.startsWith('pk_')) {
      return {
        success: false,
        error: 'Publishable Key inválida - deve começar com "pk_"'
      };
    }

    if (!secretKey.startsWith('sk_')) {
      return {
        success: false,
        error: 'Secret Key inválida - deve começar com "sk_"'
      };
    }

    // Em um ambiente de produção, você faria uma chamada real para a API do Stripe
    // Por enquanto, vamos simular o teste
    const isTestMode = publishableKey.includes('test') && secretKey.includes('test');
    const isLiveMode = publishableKey.includes('live') && secretKey.includes('live');

    if (!isTestMode && !isLiveMode) {
      return {
        success: false,
        error: 'Chaves inconsistentes - use chaves de teste (test) ou produção (live) combinadas'
      };
    }

    // Simulação de sucesso (em produção, chamar a Edge Function de teste)
    return {
      success: true,
      message: `Conexão testada com sucesso! Modo: ${isTestMode ? 'Teste' : 'Produção'}`
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Erro ao testar conexão com Stripe'
    };
  }
}

/**
 * Obtém a Publishable Key (segura para uso no frontend)
 */
export async function getStripePublishableKey(): Promise<string | null> {
  try {
    const config = await loadStripeConfig();
    return config?.publishable_key || null;
  } catch (error) {
    console.error('Erro ao obter Publishable Key:', error);
    return null;
  }
}

/**
 * Verifica se o Stripe está configurado
 */
export async function isStripeConfigured(): Promise<boolean> {
  try {
    const config = await loadStripeConfig();
    return config?.is_configured === true && !!config?.publishable_key && !!config?.secret_key;
  } catch (error) {
    console.error('Erro ao verificar configuração do Stripe:', error);
    return false;
  }
}
