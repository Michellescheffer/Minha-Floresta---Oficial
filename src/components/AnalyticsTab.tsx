import React, { useState, useEffect } from 'react';
import {
  Calendar, Download, Filter, TrendingUp, DollarSign,
  Users, Award, ShoppingCart, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { GlassCard } from './GlassCard';

const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#6ee7b7'];

interface AnalyticsData {
  sales: any[];
  certificates: any[];
  projects: any[];
  customers: any[];
}

interface Filters {
  startDate: string;
  endDate: string;
  projectId: string;
  status: string;
}

export function AnalyticsTab() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData>({
    sales: [],
    certificates: [],
    projects: [],
    customers: []
  });

  const [filters, setFilters] = useState<Filters>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    projectId: 'all',
    status: 'all'
  });

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalCertificates: 0,
    totalCustomers: 0,
    avgTicket: 0,
    totalM2: 0,
    totalCO2: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Build query with filters
      let salesQuery = supabase
        .from('sales')
        .select('*')
        .gte('sale_date', filters.startDate)
        .lte('sale_date', filters.endDate);

      if (filters.status !== 'all') {
        salesQuery = salesQuery.eq('payment_status', filters.status);
      }

      if (filters.projectId !== 'all') {
        salesQuery = salesQuery.eq('project_id', filters.projectId);
      }

      const [salesRes, certsRes, projectsRes] = await Promise.all([
        salesQuery,
        supabase.from('certificates').select('*'),
        supabase.from('projects').select('*')
      ]);

      const salesData = salesRes.data || [];
      const certsData = certsRes.data || [];
      const projectsData = projectsRes.data || [];

      // Calculate stats
      const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.total_value || 0), 0);
      const totalM2 = salesData.reduce((sum, sale) => sum + (sale.total_m2 || 0), 0);
      const totalCO2 = certsData.reduce((sum, cert) => sum + (cert.co2_offset_kg || 0), 0);
      const uniqueCustomers = new Set(salesData.map(s => s.customer_email)).size;

      setStats({
        totalRevenue,
        totalSales: salesData.length,
        totalCertificates: certsData.length,
        totalCustomers: uniqueCustomers,
        avgTicket: salesData.length > 0 ? totalRevenue / salesData.length : 0,
        totalM2,
        totalCO2
      });

      setData({
        sales: salesData,
        certificates: certsData,
        projects: projectsData,
        customers: []
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Erro ao carregar analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Data', 'Cliente', 'Email', 'Valor', 'Área (m²)',
      'Método Pagamento', 'Status', 'Projeto'
    ];

    const rows = data.sales.map(sale => [
      new Date(sale.sale_date).toLocaleDateString('pt-BR'),
      sale.customer_name,
      sale.customer_email,
      `R$ ${sale.total_value.toFixed(2)}`,
      sale.total_m2,
      sale.payment_method,
      sale.payment_status,
      sale.notes || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${filters.startDate}_${filters.endDate}.csv`;
    link.click();

    toast.success('Relatório exportado com sucesso!');
  };

  // Prepare chart data
  const getSalesOverTime = () => {
    const monthlyData: { [key: string]: { revenue: number; sales: number } } = {};

    data.sales.forEach(sale => {
      const date = new Date(sale.sale_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, sales: 0 };
      }

      monthlyData[monthKey].revenue += sale.total_value;
      monthlyData[monthKey].sales += 1;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        revenue: data.revenue,
        sales: data.sales
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getProjectDistribution = () => {
    const projectSales: { [key: string]: number } = {};

    data.sales.forEach(sale => {
      const project = sale.notes || 'Outros';
      projectSales[project] = (projectSales[project] || 0) + sale.total_value;
    });

    return Object.entries(projectSales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const getPaymentMethodDistribution = () => {
    const methods: { [key: string]: number } = {};

    data.sales.forEach(sale => {
      const method = sale.payment_method || 'Não informado';
      methods[method] = (methods[method] || 0) + 1;
    });

    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Analytics Avançado</h2>
        <div className="flex gap-2">
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <GlassCard variant="solid" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Projeto</label>
            <select
              value={filters.projectId}
              onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              {data.projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 shadow-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Total</span>
          </div>
          <p className="text-3xl font-bold">R$ {stats.totalRevenue.toLocaleString('pt-BR')}</p>
          <p className="text-sm opacity-80 mt-1">Receita Total</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 shadow-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Vendas</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalSales}</p>
          <p className="text-sm opacity-80 mt-1">Ticket Médio: R$ {stats.avgTicket.toFixed(2)}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 shadow-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Certificados</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalCertificates}</p>
          <p className="text-sm opacity-80 mt-1">{stats.totalM2.toLocaleString('pt-BR')} m²</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-6 shadow-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Clientes</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalCustomers}</p>
          <p className="text-sm opacity-80 mt-1">{(stats.totalCO2 / 1000).toFixed(2)} ton CO₂</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <GlassCard variant="solid" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita ao Longo do Tempo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getSalesOverTime()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Receita" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Sales Count Over Time */}
        <GlassCard variant="solid" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getSalesOverTime()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="sales" fill="#10b981" name="Vendas" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Project Distribution */}
        <GlassCard variant="solid" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Projetos por Receita</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getProjectDistribution()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: R$ ${entry.value.toFixed(0)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getProjectDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Payment Methods */}
        <GlassCard variant="solid" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pagamento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getPaymentMethodDistribution()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getPaymentMethodDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Recent Sales Table */}
      <GlassCard variant="solid" className="overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Vendas Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Área</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.sales.slice(0, 10).map((sale) => (
                <tr key={sale.id} className="hover:bg-green-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{sale.customer_name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    R$ {sale.total_value.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{sale.total_m2} m²</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sale.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                        sale.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {sale.payment_status === 'paid' ? 'Pago' :
                        sale.payment_status === 'pending' ? 'Pendente' : 'Cancelado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
