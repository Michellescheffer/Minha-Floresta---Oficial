import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Key, 
  Shield, 
  Check, 
  X, 
  RefreshCw, 
  Save, 
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { apiRequest } from '../utils/database';
import { loadStripeConfig, saveStripeConfig, testStripeConnection } from '../utils/stripeConfigApi';

interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  isConfigured: boolean;
  lastTested: string | null;
  testStatus: 'success' | 'error' | 'pending' | null;
}

export function CMSStripeConfig() {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  
  const [config, setConfig] = useState<StripeConfig>({
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    isConfigured: false,
    lastTested: null,
    testStatus: null
  });

  // Carregar configuração existente
  useEffect(() => {
    loadStripeConfigData();
  }, []);

  const loadStripeConfigData = async () => {
    try {
      // Tentar carregar do Supabase (app_settings)
      const settings = await loadStripeConfig();
      
      if (settings && settings.publishable_key) {
        setConfig({
          publishableKey: settings.publishable_key || '',
          secretKey: settings.secret_key || '',
          webhookSecret: settings.webhook_secret || '',
          isConfigured: settings.is_configured || false,
          lastTested: settings.last_tested || null,
          testStatus: settings.test_status || null
        });
      } else {
        // Fallback para localStorage
        const localConfig = localStorage.getItem('minha_floresta_stripe_config');
        if (localConfig) {
          const parsedConfig = JSON.parse(localConfig);
          setConfig(parsedConfig);
        }
      }
    } catch (error) {
      // Fallback para localStorage em caso de erro
      const localConfig = localStorage.getItem('minha_floresta_stripe_config');
      if (localConfig) {
        const parsedConfig = JSON.parse(localConfig);
        setConfig(parsedConfig);
      }
    }
  };

  const handleSaveConfig = async () => {
    // Validações
    if (!config.publishableKey.trim()) {
      toast.error('Publishable Key é obrigatória');
      return;
    }

    if (!config.publishableKey.startsWith('pk_')) {
      toast.error('Publishable Key deve começar com "pk_"');
      return;
    }

    if (!config.secretKey.trim()) {
      toast.error('Secret Key é obrigatória');
      return;
    }

    if (!config.secretKey.startsWith('sk_')) {
      toast.error('Secret Key deve começar com "sk_"');
      return;
    }

    if (config.webhookSecret && !config.webhookSecret.startsWith('whsec_')) {
      toast.error('Webhook Secret deve começar com "whsec_"');
      return;
    }

    setLoading(true);

    try {
      // Tentar salvar no Supabase usando a API
      const result = await saveStripeConfig({
        publishable_key: config.publishableKey,
        secret_key: config.secretKey,
        webhook_secret: config.webhookSecret,
        is_configured: true,
        last_tested: new Date().toISOString(),
        test_status: config.testStatus
      });

      // Salvar também no localStorage como backup
      const configToSave = {
        ...config,
        isConfigured: true,
        lastTested: new Date().toISOString()
      };
      
      localStorage.setItem('minha_floresta_stripe_config', JSON.stringify(configToSave));
      setConfig(configToSave);

      if (result.success) {
        toast.success('Configurações do Stripe salvas com sucesso!', {
          description: 'As chaves foram armazenadas com segurança no Supabase.'
        });
      } else {
        toast.warning('Configurações salvas localmente', {
          description: 'Não foi possível salvar no Supabase. Configure o backend.'
        });
      }
    } catch (error) {
      // Fallback para localStorage
      const configToSave = {
        ...config,
        isConfigured: true,
        lastTested: new Date().toISOString()
      };
      
      localStorage.setItem('minha_floresta_stripe_config', JSON.stringify(configToSave));
      setConfig(configToSave);

      toast.warning('Configurações salvas localmente', {
        description: 'Configure o backend para persistir no banco de dados.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!config.publishableKey || !config.secretKey) {
      toast.error('Preencha as chaves antes de testar');
      return;
    }

    setTesting(true);

    try {
      // Testar conexão usando a API
      const result = await testStripeConnection(config.publishableKey, config.secretKey);

      if (result.success) {
        const updatedConfig = {
          ...config,
          testStatus: 'success' as const,
          lastTested: new Date().toISOString()
        };
        
        setConfig(updatedConfig);
        localStorage.setItem('minha_floresta_stripe_config', JSON.stringify(updatedConfig));
        
        // Salvar também o status do teste no Supabase
        await saveStripeConfig({
          publishable_key: config.publishableKey,
          secret_key: config.secretKey,
          webhook_secret: config.webhookSecret,
          is_configured: true,
          last_tested: new Date().toISOString(),
          test_status: 'success'
        });
        
        toast.success('Conexão com Stripe testada com sucesso!', {
          description: result.message || 'As chaves estão funcionando corretamente.'
        });
      } else {
        throw new Error(result.error || 'Erro ao testar conexão');
      }
    } catch (error: any) {
      const updatedConfig = {
        ...config,
        testStatus: 'error' as const,
        lastTested: new Date().toISOString()
      };
      
      setConfig(updatedConfig);
      localStorage.setItem('minha_floresta_stripe_config', JSON.stringify(updatedConfig));
      
      toast.error('Erro ao testar conexão', {
        description: error?.message || 'Verifique se as chaves estão corretas.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClearConfig = () => {
    if (!confirm('Tem certeza que deseja limpar todas as configurações do Stripe?')) {
      return;
    }

    const emptyConfig: StripeConfig = {
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
      isConfigured: false,
      lastTested: null,
      testStatus: null
    };

    setConfig(emptyConfig);
    localStorage.removeItem('minha_floresta_stripe_config');
    toast.info('Configurações do Stripe removidas');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-gray-800">
            <CreditCard className="h-6 w-6 text-blue-600" />
            Configuração do Stripe
          </h2>
          <p className="text-gray-600 mt-1">
            Configure as chaves de API do Stripe para processar pagamentos
          </p>
        </div>
        
        <div className="flex gap-3">
          {config.isConfigured && (
            <Button 
              variant="outline" 
              onClick={handleClearConfig}
              className="bg-white/10 backdrop-blur-md border-white/20"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
          <Button 
            onClick={handleTestConnection} 
            disabled={testing || !config.publishableKey || !config.secretKey}
            variant="outline"
            className="bg-white/10 backdrop-blur-md border-white/20"
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Testar Conexão
          </Button>
          <Button 
            onClick={handleSaveConfig} 
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                config.isConfigured && config.testStatus === 'success' 
                  ? 'bg-green-100' 
                  : config.isConfigured 
                    ? 'bg-yellow-100' 
                    : 'bg-gray-100'
              }`}>
                {config.isConfigured && config.testStatus === 'success' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : config.isConfigured ? (
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-gray-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {config.isConfigured && config.testStatus === 'success'
                    ? 'Stripe Configurado e Testado'
                    : config.isConfigured
                      ? 'Stripe Configurado (Teste Pendente)'
                      : 'Stripe Não Configurado'}
                </p>
                <p className="text-sm text-gray-600">
                  {config.lastTested 
                    ? `Último teste: ${new Date(config.lastTested).toLocaleString('pt-BR')}`
                    : 'Nenhum teste realizado'}
                </p>
              </div>
            </div>
            
            {config.isConfigured && (
              <Badge 
                variant={config.testStatus === 'success' ? 'default' : 'secondary'}
                className={
                  config.testStatus === 'success' 
                    ? 'bg-green-500' 
                    : 'bg-yellow-500'
                }
              >
                {config.publishableKey.includes('test') ? 'Modo Teste' : 'Modo Produção'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documentação Rápida */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Onde obter as chaves:</strong> Acesse o{' '}
          <a 
            href="https://dashboard.stripe.com/apikeys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline inline-flex items-center gap-1 hover:text-blue-700"
          >
            Stripe Dashboard <ExternalLink className="h-3 w-3" />
          </a>
          {' '}→ Developers → API keys. Use as chaves de <strong>teste</strong> (começam com pk_test_ / sk_test_) para desenvolvimento.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6">
        {/* Publishable Key */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              Publishable Key
            </CardTitle>
            <CardDescription className="text-gray-600">
              Chave pública para uso no frontend (segura para expor)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="publishable-key">Publishable Key (pk_...)</Label>
              <Input
                id="publishable-key"
                type="text"
                value={config.publishableKey}
                onChange={(e) => setConfig({ ...config, publishableKey: e.target.value })}
                placeholder="pk_test_51AbCdEf..."
                className="mt-1 bg-white/10 backdrop-blur-md border-white/20 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta chave será usada no frontend para criar Payment Intents
              </p>
            </div>
            
            {config.publishableKey && (
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                {config.publishableKey.startsWith('pk_') ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Formato válido</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">Deve começar com "pk_"</span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Secret Key */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Secret Key
            </CardTitle>
            <CardDescription className="text-gray-600">
              Chave secreta para uso no backend (NUNCA exponha no frontend)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="secret-key">Secret Key (sk_...)</Label>
              <div className="relative mt-1">
                <Input
                  id="secret-key"
                  type={showSecretKey ? 'text' : 'password'}
                  value={config.secretKey}
                  onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
                  placeholder="sk_test_51AbCdEf..."
                  className="bg-white/10 backdrop-blur-md border-white/20 font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showSecretKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Esta chave será usada nas Edge Functions do Supabase
              </p>
            </div>

            {config.secretKey && (
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                {config.secretKey.startsWith('sk_') ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Formato válido</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">Deve começar com "sk_"</span>
                  </>
                )}
              </div>
            )}

            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                <strong>IMPORTANTE:</strong> Esta chave dá acesso total à sua conta Stripe. 
                Nunca compartilhe ou exponha no código frontend.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Webhook Secret */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Webhook Secret (Opcional)
            </CardTitle>
            <CardDescription className="text-gray-600">
              Secret para validar webhooks do Stripe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhook-secret">Webhook Secret (whsec_...)</Label>
              <div className="relative mt-1">
                <Input
                  id="webhook-secret"
                  type={showWebhookSecret ? 'text' : 'password'}
                  value={config.webhookSecret}
                  onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
                  placeholder="whsec_..."
                  className="bg-white/10 backdrop-blur-md border-white/20 font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showWebhookSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Obtenha no Stripe Dashboard após criar o endpoint de webhook
              </p>
            </div>

            {config.webhookSecret && (
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                {config.webhookSecret.startsWith('whsec_') ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Formato válido</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">Deve começar com "whsec_"</span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instruções de Deploy */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-gray-800">📚 Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                1
              </div>
              <div>
                <p className="font-medium text-gray-800">Configurar Edge Functions no Supabase</p>
                <p className="text-sm text-gray-600">
                  Execute no terminal: <code className="bg-white px-2 py-1 rounded text-xs">supabase secrets set STRIPE_SECRET_KEY=sk_test_...</code>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                2
              </div>
              <div>
                <p className="font-medium text-gray-800">Deploy das Edge Functions</p>
                <p className="text-sm text-gray-600">
                  Execute: <code className="bg-white px-2 py-1 rounded text-xs">supabase functions deploy stripe-checkout</code>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                3
              </div>
              <div>
                <p className="font-medium text-gray-800">Configurar Webhook no Stripe</p>
                <p className="text-sm text-gray-600">
                  URL: <code className="bg-white px-2 py-1 rounded text-xs">https://[seu-projeto].supabase.co/functions/v1/stripe-webhook</code>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-blue-200">
            <a 
              href="https://github.com/seu-repo/docs/STRIPE_SETUP_GUIDE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Ver documentação completa do Stripe
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
