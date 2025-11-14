import React, { useState } from 'react';
import { 
  Search, Filter, Download, Mail, Phone, User, 
  CreditCard, Calendar, Award, FileSpreadsheet, X, Eye
} from 'lucide-react';
import { toast } from 'sonner';

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
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Exportar Planilha
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-4">
          {filteredCustomers.length === 0 ? (
            <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-8 text-center shadow-xl">
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => onSelectCustomer(customer)}
                className={`rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-6 shadow-xl cursor-pointer transition-all hover:shadow-2xl ${
                  selectedCustomer?.id === customer.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCustomer(customer);
                    }}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Gasto</p>
                    <p className="font-semibold text-green-600">R$ {customer.totalSpent.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Área Total</p>
                    <p className="font-semibold">{customer.totalM2}m²</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Certificados</p>
                    <p className="font-semibold">{customer.certificates.length}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer Details */}
        <div className="sticky top-4">
          {selectedCustomer ? (
            <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-6 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Detalhes do Cliente</h3>
                <button
                  onClick={() => onSelectCustomer(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Customer Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-semibold">{selectedCustomer.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{selectedCustomer.email}</p>
                  </div>
                </div>

                {selectedCustomer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="font-semibold">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                )}

                {selectedCustomer.cpf && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">CPF</p>
                      <p className="font-semibold">{selectedCustomer.cpf}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600">Total Gasto</p>
                  <p className="text-lg font-bold text-green-600">R$ {selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Área Total</p>
                  <p className="text-lg font-bold">{selectedCustomer.totalM2}m²</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CO2 Compensado</p>
                  <p className="text-lg font-bold text-green-600">{selectedCustomer.totalCO2.toFixed(2)} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compras</p>
                  <p className="text-lg font-bold">{selectedCustomer.sales.length}</p>
                </div>
              </div>

              {/* Certificates */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certificados ({selectedCustomer.certificates.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCustomer.certificates.map((cert: any) => (
                    <div key={cert.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-mono text-sm font-semibold">{cert.certificate_number}</p>
                      <p className="text-xs text-gray-600">{cert.area_sqm}m² - {new Date(cert.issue_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase History */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Histórico de Compras ({selectedCustomer.sales.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCustomer.sales.map((sale: any) => (
                    <div key={sale.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">R$ {sale.total_value.toFixed(2)}</p>
                          <p className="text-xs text-gray-600">{sale.total_m2}m²</p>
                        </div>
                        <p className="text-xs text-gray-600">{new Date(sale.sale_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{sale.payment_method} - {sale.payment_status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-8 text-center shadow-xl">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Selecione um cliente para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
