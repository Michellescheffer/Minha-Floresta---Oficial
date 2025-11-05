/**
 * 🌱 Minha Floresta Conservações - Página de Teste de Limpeza
 * 
 * Página temporária para executar limpeza dos bancos de dados
 * antes de iniciar a Fase 2
 */

import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { DatabaseCleanupPanel } from '../components/DatabaseCleanupPanel';
import { Button } from '../components/ui/button';
import { useCleanup } from '../hooks/useCleanup';
import { useSupabase } from '../contexts/SupabaseContext';
import { 
  Database, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export const CleanupTestPage: React.FC = () => {
  const { cleanAllData, getDataStatus, testConnection, forceCleanIndexedDB } = useCleanup();
  const { isConnected: supabaseConnected } = useSupabase();
  const [isExecuting, setIsExecuting] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isForceCleaningDB, setIsForceCleaningDB] = useState(false);

  // =====================================
  // 🔄 CHECK PENDING CLEANUP ON LOAD
  // =====================================

  React.useEffect(() => {
    const checkPendingCleanup = async () => {
      const pendingCleanup = localStorage.getItem('pending-indexeddb-cleanup');
      if (pendingCleanup === 'true') {
        localStorage.removeItem('pending-indexeddb-cleanup');
        
        toast.info('🔄 Executando limpeza pendente após recarregamento...', {
          duration: 3000
        });
        
        // Aguardar um momento para o app carregar completamente
        setTimeout(async () => {
          try {
            await forceCleanIndexedDB();
            toast.success('🎉 Limpeza pendente concluída!', {
              description: 'IndexedDB foi limpo após recarregamento.',
              duration: 5000
            });
          } catch (error) {
            console.error('❌ Erro na limpeza pendente:', error);
            toast.error('❌ Erro na limpeza pendente', {
              description: error.message
            });
          }
        }, 2000);
      }
    };

    checkPendingCleanup();
  }, [forceCleanIndexedDB]);

  // =====================================
  // 🧹 EXECUTE CLEANUP
  // =====================================

  const checkConnection = async () => {
    try {
      const connected = await testConnection();
      setIsConnected(connected);
      
      if (connected) {
        toast.success('🔌 Conexão estabelecida!', {
          description: 'Servidor está respondendo corretamente.'
        });
      } else {
        toast.error('❌ Sem conexão', {
          description: 'Não foi possível conectar ao servidor.'
        });
      }
    } catch (error) {
      console.error('❌ Erro no teste de conexão:', error);
      setIsConnected(false);
      toast.error('❌ Erro na conexão', {
        description: error.message
      });
    }
  };

  const executeQuickCleanup = async () => {
    setIsExecuting(true);
    setCleanupResult(null);

    try {
      console.log('🧹 Iniciando limpeza rápida...');
      
      const result = await cleanAllData({
        includeSupabase: true,
        includeLocalStorage: true,
        confirmDeletion: false // Pular confirmação para teste
      });

      setCleanupResult(result);
      
      if (result.success) {
        toast.success(`🎉 Limpeza concluída! ${result.totalRemoved} registros removidos.`, {
          description: 'Banco de dados limpo com sucesso.',
          duration: 5000
        });
      } else {
        toast.error('❌ Erro na limpeza', {
          description: 'Verifique os logs para mais detalhes.'
        });
      }

    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
      toast.error('❌ Erro crítico na limpeza', {
        description: error.message
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeForceCleanDB = async () => {
    setIsForceCleaningDB(true);

    try {
      console.log('🔥 Iniciando limpeza forçada do IndexedDB...');
      
      await forceCleanIndexedDB();
      
      toast.success('🔥 Limpeza forçada concluída!', {
        description: 'IndexedDB foi limpo com métodos agressivos.',
        duration: 5000
      });

    } catch (error) {
      console.error('❌ Erro na limpeza forçada:', error);
      toast.error('❌ Erro na limpeza forçada', {
        description: error.message
      });
    } finally {
      setIsForceCleaningDB(false);
    }
  };

  // =====================================
  // 🎨 RENDER
  // =====================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-emerald-50 py-20">
      <div className="container mx-auto px-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 rounded-xl bg-red-500/20 backdrop-blur-md border border-red-400/30">
              <Database className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Limpeza de Banco de Dados
              </h1>
              <p className="text-gray-600 mt-2">
                Ferramenta de teste para limpar dados antes da Fase 2
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Status Card */}
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-white">Status Atual</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Sistema:</span>
                <span className="text-green-400">✓ Supabase-Only</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Conexão Supabase:</span>
                <span className={supabaseConnected ? "text-green-400" : "text-orange-400"}>
                  {supabaseConnected ? "✓ Online" : "⚠ Offline"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Servidor:</span>
                <span className={
                  isConnected === null ? "text-gray-400" : 
                  isConnected ? "text-green-400" : "text-red-400"
                }>
                  {isConnected === null ? "⚪ Desconhecido" : 
                   isConnected ? "✓ Conectado" : "❌ Offline"}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={checkConnection}
              variant="outline"
              size="sm"
              className="w-full mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Testar Conexão
            </Button>
          </GlassCard>

          {/* Quick Cleanup */}
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-white">Limpeza Rápida</h3>
            </div>
            
            <p className="text-white/70 text-sm mb-4">
              Execute limpeza completa sem confirmações (apenas para teste).
            </p>
            
            <Button 
              onClick={executeQuickCleanup}
              disabled={isExecuting}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Agora
                </>
              )}
            </Button>
          </GlassCard>

          {/* Warning */}
          <GlassCard className="p-6 border-amber-400/30">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-semibold text-white">Atenção</h3>
            </div>
            
            <div className="space-y-2 text-sm text-amber-200">
              <p>• Esta ação remove TODOS os dados</p>
              <p>• Operação irreversível</p>
              <p>• Use apenas para desenvolvimento</p>
              <p>• Fase 2 iniciará com banco limpo</p>
            </div>
          </GlassCard>
        </div>

        {/* Advanced Tools */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            🔧 Ferramentas Avançadas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Force Clean IndexedDB */}
            <GlassCard className="p-6 border-orange-400/30">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-white">Limpeza Forçada IndexedDB</h3>
              </div>
              
              <p className="text-white/70 text-sm mb-4">
                Use quando a limpeza normal do IndexedDB falhar devido a conexões bloqueadas.
              </p>
              
              <div className="space-y-2 text-xs text-orange-200 mb-4">
                <p>• Fecha todas as conexões ativas</p>
                <p>• Múltiplas tentativas agressivas</p>
                <p>• Pode solicitar recarregamento da página</p>
                <p>• Limpa cache e storage APIs</p>
              </div>
              
              <Button 
                onClick={executeForceCleanDB}
                disabled={isForceCleaningDB}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isForceCleaningDB ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Forçando Limpeza...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Forçar Limpeza IndexedDB
                  </>
                )}
              </Button>
            </GlassCard>

            {/* Status Info */}
            <GlassCard className="p-6 border-blue-400/30">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-white">Status do Sistema</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Página Atual:</span>
                  <span className="text-white">Limpeza de Teste</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Modo:</span>
                  <span className="text-yellow-400">Desenvolvimento</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">IndexedDB Status:</span>
                  <span className={isForceCleaningDB ? "text-orange-400" : "text-green-400"}>
                    {isForceCleaningDB ? "🔥 Limpando" : "✅ Pronto"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Última Execução:</span>
                  <span className="text-white/60 text-xs">
                    {cleanupResult?.timestamp 
                      ? new Date(cleanupResult.timestamp).toLocaleTimeString('pt-BR')
                      : 'Nunca'
                    }
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Results */}
        {cleanupResult && (
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-400" />
              Resultado da Limpeza
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supabase Results */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Supabase
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-white/70">Projetos:</span>
                    <span className="text-white">{cleanupResult.details?.supabase?.projects || 0}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-white/70">Certificados:</span>
                    <span className="text-white">{cleanupResult.details?.supabase?.certificates || 0}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-white/70">Carrinho:</span>
                    <span className="text-white">{cleanupResult.details?.supabase?.cart_items || 0}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-white/70">Compras:</span>
                    <span className="text-white">{cleanupResult.details?.supabase?.purchases || 0}</span>
                  </div>
                </div>
              </div>

              {/* KV Store Results */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  KV Store
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-white/70">Projetos:</span>
                    <span className="text-white">{cleanupResult.details?.kv_store?.projects || 0}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-white/70">Certificados:</span>
                    <span className="text-white">{cleanupResult.details?.kv_store?.certificates || 0}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-white/70">Doações:</span>
                    <span className="text-white">{cleanupResult.details?.kv_store?.donations || 0}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-white/70">Imagens:</span>
                    <span className="text-white">{cleanupResult.details?.kv_store?.images || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Total Removido:</span>
                <span className="text-2xl font-bold text-green-400">
                  {cleanupResult.details?.total_removed || 0} registros
                </span>
              </div>
              <p className="text-white/60 text-sm mt-1">
                {cleanupResult.timestamp && new Date(cleanupResult.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
          </GlassCard>
        )}

        {/* Full Cleanup Panel */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            Painel de Limpeza Completo
          </h2>
          <DatabaseCleanupPanel />
        </div>

        {/* Navigation */}
        <div className="text-center pt-8">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CleanupTestPage;