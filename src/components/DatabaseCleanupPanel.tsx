/**
 * 🌱 Minha Floresta Conservações - Painel de Limpeza do Banco
 * 
 * Interface administrativa para limpeza completa dos dados
 * com confirmações de segurança e feedback visual
 */

import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useCleanup, CleanupResults } from '../hooks/useCleanup';
import { useSupabase } from '../contexts/SupabaseContext';
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  HardDrive,
  Cloud,
  RefreshCw,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export const DatabaseCleanupPanel: React.FC = () => {
  // =====================================
  // 🪝 HOOKS & STATE
  // =====================================

  const { cleanAllData, cleanProjects, cleanCache, getDataStatus } = useCleanup();
  const { isConnected } = useSupabase();
  
  const [isLoading, setIsLoading] = useState(false);
  const [cleanupProgress, setCleanupProgress] = useState(0);
  const [lastCleanup, setLastCleanup] = useState<CleanupResults | null>(null);
  const [dataStatus, setDataStatus] = useState({
    hasData: false,
    counts: {
      projects: 0,
      certificates: 0,
      donations: 0,
      calculations: 0
    }
  });

  // =====================================
  // 🔄 EFFECTS
  // =====================================

  useEffect(() => {
    loadDataStatus();
  }, []);

  // =====================================
  // 📊 DATA STATUS
  // =====================================

  const loadDataStatus = async () => {
    try {
      const status = await getDataStatus();
      setDataStatus(status);
    } catch (error) {
      console.error('Erro ao carregar status dos dados:', error);
    }
  };

  // =====================================
  // 🧹 CLEANUP HANDLERS
  // =====================================

  const handleCompleteCleanup = async () => {
    setIsLoading(true);
    setCleanupProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setCleanupProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const results = await cleanAllData({
        includeSupabase: true,
        includeKvStore: true,
        includeIndexedDB: true,
        includeLocalStorage: true,
        confirmDeletion: true
      });

      clearInterval(progressInterval);
      setCleanupProgress(100);
      setLastCleanup(results);

      // Atualizar status
      await loadDataStatus();

      toast.success(
        `🎉 Limpeza completa realizada! ${results.details.total_removed} registros removidos.`,
        {
          description: 'Todos os dados foram removidos com sucesso.',
          duration: 5000
        }
      );

    } catch (error) {
      toast.error('❌ Erro na limpeza', {
        description: error.message,
        duration: 5000
      });
      console.error('Erro na limpeza:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setCleanupProgress(0), 2000);
    }
  };

  const handleProjectsCleanup = async () => {
    setIsLoading(true);

    try {
      await cleanProjects();
      await loadDataStatus();
      
      toast.success('✅ Projetos removidos com sucesso!', {
        description: 'Todos os projetos foram deletados.'
      });

    } catch (error) {
      toast.error('❌ Erro ao remover projetos', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCacheCleanup = async () => {
    setIsLoading(true);

    try {
      await cleanCache();
      await clearHybridCache();
      
      toast.success('✅ Cache limpo com sucesso!', {
        description: 'Todo o cache local foi removido.'
      });

    } catch (error) {
      toast.error('❌ Erro ao limpar cache', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================
  // 🎨 RENDER HELPERS
  // =====================================

  const getDataStatusBadge = () => {
    if (dataStatus.hasData) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">
          <Database className="w-3 h-3 mr-1" />
          Com dados
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Limpo
        </Badge>
      );
    }
  };

  const getSyncStatusBadge = () => {
    if (syncStatus.isOnline) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
          <Cloud className="w-3 h-3 mr-1" />
          Online
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-400/30">
          <HardDrive className="w-3 h-3 mr-1" />
          Offline
        </Badge>
      );
    }
  };

  // =====================================
  // 🎨 RENDER
  // =====================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Painel de Limpeza do Banco
              </h2>
              <p className="text-white/60">
                Gerenciar e limpar dados do sistema híbrido
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {getDataStatusBadge()}
            {getSyncStatusBadge()}
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start space-x-3 p-4 rounded-lg bg-amber-500/10 border border-amber-400/30">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <p className="text-amber-400 font-medium mb-1">
              Atenção: Operação Irreversível
            </p>
            <p className="text-amber-400/80 text-sm">
              As operações de limpeza removem dados permanentemente. 
              Certifique-se de que não há dados importantes antes de continuar.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Status dos Dados */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Status dos Dados
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">
              {dataStatus.counts.projects}
            </div>
            <div className="text-white/60 text-sm">Projetos</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">
              {dataStatus.counts.certificates}
            </div>
            <div className="text-white/60 text-sm">Certificados</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">
              {dataStatus.counts.donations}
            </div>
            <div className="text-white/60 text-sm">Doações</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">
              {dataStatus.counts.calculations}
            </div>
            <div className="text-white/60 text-sm">Cálculos</div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadDataStatus}
            disabled={isLoading}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </GlassCard>

      {/* Progress */}
      {isLoading && cleanupProgress > 0 && (
        <GlassCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Processando limpeza...</span>
              <span className="text-white/70">{cleanupProgress}%</span>
            </div>
            <Progress value={cleanupProgress} className="w-full" />
          </div>
        </GlassCard>
      )}

      {/* Cleanup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Limpeza Completa */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">Limpeza Completa</h3>
              <p className="text-white/60 text-sm">Remove todos os dados</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="text-sm text-white/80">Remove:</div>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• Todos os projetos</li>
              <li>• Todos os certificados</li>
              <li>• Todos os carrinhos</li>
              <li>• Cache e IndexedDB</li>
              <li>• LocalStorage</li>
            </ul>
          </div>

          <Button
            onClick={handleCompleteCleanup}
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpeza Completa
          </Button>
        </GlassCard>

        {/* Limpeza de Projetos */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">Apenas Projetos</h3>
              <p className="text-white/60 text-sm">Remove somente projetos</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="text-sm text-white/80">Remove:</div>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• Projetos de reflorestamento</li>
              <li>• Projetos sociais</li>
              <li>• Imagens associadas</li>
            </ul>
          </div>

          <Button
            onClick={handleProjectsCleanup}
            disabled={isLoading}
            variant="outline"
            className="w-full border-orange-400/30 text-orange-400 hover:bg-orange-500/10"
          >
            <Database className="w-4 h-4 mr-2" />
            Limpar Projetos
          </Button>
        </GlassCard>

        {/* Limpeza de Cache */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">Apenas Cache</h3>
              <p className="text-white/60 text-sm">Limpa cache local</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="text-sm text-white/80">Remove:</div>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• IndexedDB local</li>
              <li>• LocalStorage</li>
              <li>• Cache do navegador</li>
            </ul>
          </div>

          <Button
            onClick={handleCacheCleanup}
            disabled={isLoading}
            variant="outline"
            className="w-full border-blue-400/30 text-blue-400 hover:bg-blue-500/10"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Limpar Cache
          </Button>
        </GlassCard>
      </div>

      {/* Last Cleanup Results */}
      {lastCleanup && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
            Última Limpeza Realizada
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supabase Results */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Cloud className="w-4 h-4 mr-2" />
                Supabase
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Projetos:</span>
                  <span className="text-white">{lastCleanup.details.supabase.projects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Certificados:</span>
                  <span className="text-white">{lastCleanup.details.supabase.certificates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Carrinho:</span>
                  <span className="text-white">{lastCleanup.details.supabase.cart_items}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Compras:</span>
                  <span className="text-white">{lastCleanup.details.supabase.purchases}</span>
                </div>
              </div>
            </div>

            {/* KV Store Results */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center">
                <HardDrive className="w-4 h-4 mr-2" />
                KV Store
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Projetos:</span>
                  <span className="text-white">{lastCleanup.details.kv_store.projects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Certificados:</span>
                  <span className="text-white">{lastCleanup.details.kv_store.certificates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Doações:</span>
                  <span className="text-white">{lastCleanup.details.kv_store.donations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Imagens:</span>
                  <span className="text-white">{lastCleanup.details.kv_store.images}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Total Removido:</span>
              <span className="text-green-400 font-bold text-lg">
                {lastCleanup.details.total_removed} registros
              </span>
            </div>
            <div className="text-white/60 text-sm mt-1">
              {new Date(lastCleanup.timestamp).toLocaleString('pt-BR')}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default DatabaseCleanupPanel;