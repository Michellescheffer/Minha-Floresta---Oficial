import React, { useState } from 'react';
import {
  Search, Filter, Download, Mail, Phone, User,
  CreditCard, Calendar, Award, FileSpreadsheet, X, Eye
} from 'lucide-react';
import { toast } from 'sonner';

import { GlassCard } from './GlassCard';
import { cmsTokens } from './cms/constants';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  sales: any[];
  certificates: any[];
  totalSpent: number;
  totalM2: number;
  totalCO2: number;
}

interface CustomersTabProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
}

export function CustomersTab({ customers, selectedCustomer, onSelectCustomer }: CustomersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.cpf?.includes(searchTerm);

    return matchesSearch;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'CPF', 'Total Gasto', 'Total m²', 'Total CO2', 'Nº Compras', 'Nº Certificados'];
    const rows = filteredCustomers.map(c => [
      c.name,
      c.email,
      c.phone || '',
      c.cpf || '',
      `R$ ${c.totalSpent.toFixed(2)}`,
      c.totalM2,
      `${c.totalCO2.toFixed(2)} kg`,
      c.sales.length,
      c.certificates.length
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Planilha exportada com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Clientes ({customers.length})</h2>
        <button
          onClick={exportToCSV}
          className={cmsTokens.button.primary + " flex items-center gap-2"}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Exportar Planilha
        </button>
      </div>

      {/* Filters - Floating Glass Bar */}
      <div className="sticky top-20 z-30">
        <GlassCard variant="glass" intensity="high" className="p-2 sm:p-3 rounded-2xl flex flex-col sm:flex-row gap-4 items-center shadow-lg border-white/40 backdrop-blur-xl">
          {/* Search */}
          <div className="flex-1 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600/60" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all shadow-inner placeholder-gray-400 text-gray-700 font-medium"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600/60" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full sm:w-48 pl-12 pr-10 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all shadow-inner text-gray-700 font-medium appearance-none cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            <button
              title="Exportar dados"
              onClick={exportToCSV}
              className="p-3 bg-white/50 hover:bg-white text-emerald-600 rounded-xl border border-white/60 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Customers List & Details Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative items-start">
        {/* List Section */}
        <div className={`space-y-4 ${selectedCustomer ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-500`}>
          {filteredCustomers.length === 0 ? (
            <GlassCard variant="glass" className="p-16 text-center flex flex-col items-center justify-center border-dashed border-2 border-emerald-100/50 bg-white/30 rounded-3xl">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-emerald-50/50 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-black/5 ring-1 ring-white/60">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">Nenhum cliente encontrado</p>
              <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca.</p>
            </GlassCard>
          ) : (
            filteredCustomers.map((customer) => (
              <GlassCard
                key={customer.id}
                variant="solid"
                onClick={() => onSelectCustomer(customer)}
                className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group border-l-4 ${selectedCustomer?.id === customer.id
                  ? 'border-l-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10'
                  : 'border-l-transparent hover:border-l-emerald-300'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-emerald-700 font-bold shadow-inner text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-700 transition-colors">{customer.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" />
                        {customer.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-gray-100/80">
                  <div className="bg-gray-50/50 p-2 rounded-lg">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-0.5">Total Gasto</p>
                    <p className="font-bold text-emerald-600">R$ {customer.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50/50 p-2 rounded-lg">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-0.5">Área Total</p>
                    <p className="font-bold text-gray-800">{customer.totalM2} m²</p>
                  </div>
                  <div className="bg-gray-50/50 p-2 rounded-lg">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-0.5">Certificados</p>
                    <p className="font-bold text-blue-600">{customer.certificates.length}</p>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>

        {/* Customer Details - Fixed Side Panel */}
        {selectedCustomer && (
          <div className="lg:col-span-5 relative animate-in slide-in-from-right duration-500">
            <div className="sticky top-24">
              <div className="absolute -inset-4 bg-gradient-to-b from-emerald-500/10 to-blue-500/10 rounded-[2.5rem] blur-2xl -z-10" />

              <GlassCard variant="glass" intensity="high" className="p-0 overflow-hidden rounded-[2rem] border-white/60 shadow-2xl">
                {/* Pattern Header */}
                <div className="h-32 bg-gradient-to-br from-emerald-600 to-teal-700 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
                  <button
                    onClick={() => onSelectCustomer(null)}
                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-8 pb-8 -mt-16 relative">
                  <div className="w-32 h-32 rounded-[2rem] bg-white p-2 shadow-2xl mx-auto mb-6 transform hover:scale-105 transition-transform duration-500">
                    <div className="w-full h-full rounded-[1.8rem] bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-4xl font-bold text-emerald-700 shadow-inner">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedCustomer.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-white/50 py-1 px-3 rounded-full inline-flex mx-auto border border-gray-100">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedCustomer.email}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Detailed Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-center">
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Impacto CO2</p>
                        <p className="text-xl font-bold text-emerald-800">{selectedCustomer.totalCO2.toFixed(1)} <span className="text-sm font-normal">kg</span></p>
                      </div>
                      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-center">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Investimento</p>
                        <p className="text-xl font-bold text-blue-800">R$ {selectedCustomer.totalSpent.toFixed(0)}</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <User className="w-4 h-4 text-emerald-500" /> Detalhes Pessoais
                      </h4>
                      <div className="space-y-3 pl-2">
                        {selectedCustomer.phone && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Phone className="w-4 h-4 text-gray-400" /></div>
                            <span className="font-medium">{selectedCustomer.phone}</span>
                          </div>
                        )}
                        {selectedCustomer.cpf && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><CreditCard className="w-4 h-4 text-gray-400" /></div>
                            <span className="font-medium">{selectedCustomer.cpf}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-emerald-500" /> Últimas Atividades
                      </h4>
                      <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {selectedCustomer.sales.map((sale: any) => (
                          <div key={sale.id} className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <div>
                                <p className="text-xs font-bold text-gray-900">Compra de {sale.total_m2}m²</p>
                                <p className="text-[10px] text-gray-500">{new Date(sale.sale_date).toLocaleDateString('pt-BR')}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-600">R$ {sale.total_value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
