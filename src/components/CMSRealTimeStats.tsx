import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  DollarSign, 
  TreePine,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface RealTimeStatsProps {
  stats: {
    totalProjects: number;
    totalSales: number;
    totalRevenue: number;
    activeUsers: number;
    totalCertificates: number;
    totalDonations: number;
  };
}

export function CMSRealTimeStats({ stats }: RealTimeStatsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [realTimeData, setRealTimeData] = useState({
    onlineUsers: Math.floor(Math.random() * 50) + 10,
    pendingTransactions: Math.floor(Math.random() * 5) + 1,
    systemHealth: 98 + Math.random() * 2,
    activeProcesses: Math.floor(Math.random() * 8) + 3
  });

  // Simular dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        onlineUsers: Math.max(5, prev.onlineUsers + Math.floor(Math.random() * 10) - 5),
        pendingTransactions: Math.max(0, prev.pendingTransactions + Math.floor(Math.random() * 3) - 1),
        systemHealth: Math.max(95, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 2)),
        activeProcesses: Math.max(1, Math.min(15, prev.activeProcesses + Math.floor(Math.random() * 3) - 1))
      }));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRealTimeData({
        onlineUsers: Math.floor(Math.random() * 50) + 10,
        pendingTransactions: Math.floor(Math.random() * 5) + 1,
        systemHealth: 98 + Math.random() * 2,
        activeProcesses: Math.floor(Math.random() * 8) + 3
      });
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Usuários Online */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários Online</p>
              <p className="text-2xl font-bold text-blue-600">{realTimeData.onlineUsers}</p>
              <div className="flex items-center gap-1 mt-1">
                <Activity className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">Tempo real</span>
              </div>
            </div>
            <div className="relative">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transações Pendentes */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transações Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{realTimeData.pendingTransactions}</p>
              <Badge 
                variant={realTimeData.pendingTransactions > 3 ? "destructive" : "secondary"} 
                className="text-xs mt-1"
              >
                {realTimeData.pendingTransactions > 3 ? 'Alta' : 'Normal'}
              </Badge>
            </div>
            <div className="relative">
              <RefreshCw className="h-8 w-8 text-yellow-500" />
              {realTimeData.pendingTransactions > 3 && (
                <AlertCircle className="absolute -top-1 -right-1 h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saúde do Sistema */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Saúde do Sistema</p>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {realTimeData.systemHealth.toFixed(1)}%
            </p>
            <Progress 
              value={realTimeData.systemHealth} 
              className="h-2"
            />
            <p className="text-xs text-gray-500">
              Todos os serviços operacionais
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Processos Ativos */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processos Ativos</p>
              <p className="text-2xl font-bold text-purple-600">{realTimeData.activeProcesses}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-purple-600">Executando</span>
              </div>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      {/* Resumo das Estatísticas Principais */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 md:col-span-2 lg:col-span-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Resumo Executivo</CardTitle>
              <CardDescription>Visão geral das métricas principais</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Atualizado: {lastUpdate.toLocaleTimeString()}
              </span>
              <button
                onClick={refresh}
                disabled={isRefreshing}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <RefreshCw className={`h-4 w-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalProjects}</div>
              <div className="text-xs text-gray-600">Projetos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSales}</div>
              <div className="text-xs text-gray-600">Vendas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                R$ {(stats.totalRevenue / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-600">Receita</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.activeUsers}</div>
              <div className="text-xs text-gray-600">Usuários</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.totalCertificates}</div>
              <div className="text-xs text-gray-600">Certificados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.totalDonations}</div>
              <div className="text-xs text-gray-600">Doações</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}