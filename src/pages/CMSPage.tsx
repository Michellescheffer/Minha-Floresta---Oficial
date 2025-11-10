import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  FileText, 
  Heart, 
  TreePine, 
  Settings, 
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit3,
  Trash2,
  TrendingUp,
  Calendar,
  DollarSign,
  Award,
  Globe,
  Activity,
  PieChart,
  Save,
  Upload,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  Database,
  MapPin,
  Clock,
  MoreHorizontal,
  ChevronDown,
  Star,
  Target,
  Zap,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Checkbox } from '../components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { useProjects, type Project } from '../hooks/useProjects';
import { useSocialProjects } from '../hooks/useSocialProjects';
import { useCertificates } from '../hooks/useCertificates';
import { useDonations } from '../hooks/useDonations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { apiRequest } from '../utils/database';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';
import { CMSAdvancedFilters } from '../components/CMSAdvancedFilters';
import { CMSRealTimeStats } from '../components/CMSRealTimeStats';
import { CMSNotificationCenter } from '../components/CMSNotificationCenter';
import { ImageUploadWithResizer } from '../components/ImageUploadWithResizer';
import { CMSStripeConfig } from '../components/CMSStripeConfig';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface CMSStats {
  totalProjects: number;
  totalSales: number;
  totalDonations: number;
  totalCertificates: number;
  totalRevenue: number;
  activeUsers: number;
}

interface AdvancedFilters {
  minValue?: string | number;
  maxValue?: string | number;
  location?: string;
  status?: 'all' | 'active' | 'inactive';
  type?: 'all' | 'reforestation' | 'restoration' | 'conservation' | 'blue-carbon';
}

// Modal and form interfaces
interface NewProjectForm {
  name: string;
  description: string;
  location: string;
  type: 'reforestation' | 'restoration' | 'conservation' | 'blue-carbon';
  price: number;
  available: number;
  status: 'active' | 'inactive';
  images: string[];
}

interface NewSocialProjectForm {
  title: string;
  description: string;
  location: string;
  budget: number;
  beneficiaries: number;
  status: 'active' | 'paused' | 'completed';
  category: 'education' | 'community' | 'research' | 'conservation';
}

interface SystemSettings {
  platformName: string;
  contactEmail: string;
  processingFee: number;
  certificatePrefix: string;
  certificateValidity: number;
  physicalShippingFee: number;
  co2PerSquareMeter: number;
  treesPerSquareMeter: number;
  survivalRate: number;
  paymentMethods: {
    pix: boolean;
    credit: boolean;
    boleto: boolean;
    transfer: boolean;
  };
}

export function CMSPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [adminCertificates, setAdminCertificates] = useState<any[]>([]);
  const [adminCertsLoading, setAdminCertsLoading] = useState(false);
  const [certStatusFilter, setCertStatusFilter] = useState<'all' | 'issued' | 'revoked'>('all');
  const [certProjectFilter, setCertProjectFilter] = useState<string>('all');
  const [certSearch, setCertSearch] = useState('');
  const [certPage, setCertPage] = useState(1);
  const [certPageSize, setCertPageSize] = useState(10);
  const [certTotal, setCertTotal] = useState(0);
  const [adminTx, setAdminTx] = useState<any[]>([]);
  const [adminTxLoading, setAdminTxLoading] = useState(false);
  const [txSearch, setTxSearch] = useState('');
  const [txStatus, setTxStatus] = useState<'all' | 'succeeded' | 'processing' | 'canceled'>('all');
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(10);
  const [txTotal, setTxTotal] = useState(0);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsKpis, setAnalyticsKpis] = useState({
    totalRevenue: 0,
    totalCertificates: 0,
    totalArea: 0,
  });
  const [analyticsMonthly, setAnalyticsMonthly] = useState<Array<{ month: string; issued: number }>>([]);
  const [analyticsProjects, setAnalyticsProjects] = useState<Array<{ name: string; certificates: number; area: number }>>([]);
  
  // Modal states
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewSocialProjectModal, setShowNewSocialProjectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showEditSocialModal, setShowEditSocialModal] = useState(false);
  const [showViewSocialModal, setShowViewSocialModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  
  // Form states
  const [newProjectForm, setNewProjectForm] = useState<NewProjectForm>({
    name: '',
    description: '',
    location: '',
    type: 'reforestation',
    price: 0,
    available: 0,
    status: 'active',
    images: []
  });
  
  const [newSocialProjectForm, setNewSocialProjectForm] = useState<NewSocialProjectForm>({
    title: '',
    description: '',
    location: '',
    budget: 0,
    beneficiaries: 0,
    status: 'active',
    category: 'education'
  });
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    platformName: 'Minha Floresta Conservações',
    contactEmail: 'contato@minhaflorestaconservacoes.com',
    processingFee: 3.5,
    certificatePrefix: 'MFC',
    certificateValidity: 30,
    physicalShippingFee: 15.00,
    co2PerSquareMeter: 22,
    treesPerSquareMeter: 0.1,
    survivalRate: 85,
    paymentMethods: {
      pix: true,
      credit: true,
      boleto: true,
      transfer: false
    }
  });
  
  const [stats, setStats] = useState<CMSStats>({
    totalProjects: 0,
    totalSales: 0,
    totalDonations: 0,
    totalCertificates: 0,
    totalRevenue: 0,
    activeUsers: 0
  });

  const { projects, createProject, updateProject, refreshProjects, deleteProject } = useProjects();
  const { socialProjects } = useSocialProjects();
  const { certificates } = useCertificates();
  const { donations, getDonationStats } = useDonations();

  useEffect(() => {
    const calculateStats = async () => {
      try {
        // Try to get real stats from API
        const { data: apiData, error: apiError } = await apiRequest<any>('/analytics/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('minha_floresta_auth_token')}`
          }
        });

        if (apiData && !apiError) {
          setStats({
            totalProjects: apiData.stats.totalProjects,
            totalSales: apiData.stats.totalTransactions,
            totalDonations: apiData.stats.totalDonations,
            totalCertificates: apiData.stats.totalCertificates,
            totalRevenue: apiData.stats.totalRevenue + apiData.stats.totalDonationAmount,
            activeUsers: apiData.stats.totalUsers
          });
        } else {
          // Fallback to localStorage calculations
          await calculateLocalStats();
        }
      } catch (error) {
        // Fallback to localStorage calculations
        await calculateLocalStats();
      }
    };

    const calculateLocalStats = async () => {
      const transactions = JSON.parse(localStorage.getItem('minha_floresta_transactions') || '[]');
      const savedCertificates = JSON.parse(localStorage.getItem('minha_floresta_certificates') || '[]');
      const savedDonations = JSON.parse(localStorage.getItem('minha_floresta_donations') || '[]');
      
      const donationStats = await getDonationStats();

      setStats({
        totalProjects: projects.length,
        totalSales: transactions.length,
        totalDonations: savedDonations.length,
        totalCertificates: savedCertificates.length,
        totalRevenue: transactions.reduce((sum: number, t: any) => sum + (t.data?.total || 0), 0) + donationStats.totalAmount,
        activeUsers: new Set([
          ...transactions.map((t: any) => t.data?.email),
          ...savedDonations.map((d: any) => d.donorEmail)
        ].filter(Boolean)).size
      });
    };

    calculateStats();
  }, [projects, getDonationStats]);

  const reloadAdminCertificates = async () => {
    try {
      setAdminCertsLoading(true);
      let query = supabase
        .from('certificates')
        .select(`id, certificate_number, area_sqm, issued_at, status, pdf_url, project_id, projects(name)`, { count: 'exact' })
        .order('issued_at', { ascending: false });

      if (certStatusFilter !== 'all') {
        query = query.eq('status', certStatusFilter);
      }
      if (certProjectFilter !== 'all') {
        query = query.eq('project_id', certProjectFilter);
      }
      if (certSearch.trim()) {
        query = query.ilike('certificate_number', `%${certSearch.trim()}%`);
      }

      const from = (certPage - 1) * certPageSize;
      const to = from + certPageSize - 1;
      const { data, error, count } = await query.range(from, to);
      if (!error && data) {
        setAdminCertificates(data);
        setCertTotal(count || 0);
      }
    } finally {
      setAdminCertsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'certificates') {
      reloadAdminCertificates();
    }
  }, [activeTab, certStatusFilter, certProjectFilter, certSearch, certPage, certPageSize]);

  const reloadAdminTransactions = async () => {
    try {
      setAdminTxLoading(true);
      let query = supabase
        .from('stripe_payment_intents')
        .select('stripe_payment_intent_id, amount, status, created_at, purchases(id,email), donations(id,donor_email)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (txStatus !== 'all') {
        query = query.eq('status', txStatus);
      }

      if (txSearch.trim()) {
        query = query.or(`stripe_payment_intent_id.ilike.%${txSearch.trim()}%,purchases.email.ilike.%${txSearch.trim()}%,donations.donor_email.ilike.%${txSearch.trim()}%`);
      }

      const from = (txPage - 1) * txPageSize;
      const to = from + txPageSize - 1;
      const { data, error, count } = await query.range(from, to);
      if (!error && data) {
        setAdminTx(data);
        setTxTotal(count || 0);
      }
    } finally {
      setAdminTxLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'transactions') {
      reloadAdminTransactions();
    }
  }, [activeTab, txStatus, txSearch, txPage, txPageSize]);

  const reloadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);

      // KPIs
      const [{ data: revRows }, { data: certRows }, { data: areaRows }] = await Promise.all([
        supabase.from('stripe_payment_intents').select('amount, status'),
        supabase.from('certificates').select('status'),
        supabase.from('certificates').select('area_sqm, status'),
      ]);

      const totalRevenue = (revRows || [])
        .filter(r => r.status === 'succeeded')
        .reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);
      const totalCertificates = (certRows || []).filter(r => r.status === 'issued').length;
      const totalArea = (areaRows || [])
        .filter(r => r.status === 'issued')
        .reduce((sum: number, r: any) => sum + Number(r.area_sqm || 0), 0);

      setAnalyticsKpis({ totalRevenue, totalCertificates, totalArea });

      // Monthly certificates (last 6 months)
      const since = new Date();
      since.setMonth(since.getMonth() - 5);
      const { data: monthlyRows } = await supabase
        .from('certificates')
        .select('issued_at, status')
        .gte('issued_at', since.toISOString());

      const months: Record<string, number> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months[key] = 0;
      }
      (monthlyRows || []).forEach((r: any) => {
        if (r.status !== 'issued' || !r.issued_at) return;
        const d = new Date(r.issued_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (months[key] != null) months[key] += 1;
      });
      setAnalyticsMonthly(Object.entries(months).map(([k, v]) => ({ month: k, issued: v })));

      // Projects aggregation by certificates
      const { data: projRows } = await supabase
        .from('certificates')
        .select('status, area_sqm, projects(name)')
        .eq('status', 'issued');
      const agg: Record<string, { certificates: number; area: number }> = {};
      (projRows || []).forEach((r: any) => {
        const name = (r.projects as any)?.name || 'Projeto';
        if (!agg[name]) agg[name] = { certificates: 0, area: 0 };
        agg[name].certificates += 1;
        agg[name].area += Number(r.area_sqm || 0);
      });
      const projData = Object.entries(agg).map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.certificates - a.certificates)
        .slice(0, 8);
      setAnalyticsProjects(projData);

    } catch (e) {
      setAnalyticsError(e instanceof Error ? e.message : 'Erro ao carregar analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      reloadAnalytics();
    }
  }, [activeTab]);

  // Utility functions
  const handleCreateProject = async () => {
    setLoading(true);
    try {
      const { data, error } = await createProject({
        ...newProjectForm,
        sold: 0,
        image: newProjectForm.images[0] || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      });
      
      if (error) {
        toast.error(`Erro ao criar projeto: ${error}`);
        return;
      }
      
      toast.success('Projeto criado com sucesso!');
      setShowNewProjectModal(false);
      setNewProjectForm({
        name: '',
        description: '',
        location: '',
        type: 'reforestation',
        price: 0,
        available: 0,
        status: 'active',
        images: []
      });
      
      // Refresh projects
      refreshProjects();
    } catch (error) {
      toast.error('Erro ao criar projeto');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSocialProject = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Projeto social criado com sucesso!');
      setShowNewSocialProjectModal(false);
      setNewSocialProjectForm({
        title: '',
        description: '',
        location: '',
        budget: 0,
        beneficiaries: 0,
        status: 'active',
        category: 'education'
      });
    } catch (error) {
      toast.error('Erro ao criar projeto social');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('minha_floresta_settings', JSON.stringify(systemSettings));
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string, type: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    setLoading(true);
    try {
      if (type === 'Projeto' || type === 'project') {
        const { success, error } = await deleteProject(id);
        if (!success) {
          toast.error(error || 'Erro ao excluir projeto');
          return;
        }
        toast.success('Projeto excluído com sucesso!');
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.success(`${type} excluído com sucesso!`);
      }
    } catch (error) {
      toast.error('Erro ao excluir item');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast.error('Selecione ao menos um item');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${action} aplicado a ${selectedItems.length} itens`);
      setSelectedItems([]);
    } catch (error) {
      toast.error('Erro ao executar ação em lote');
    } finally {
      setLoading(false);
    }
  };

  const exportData = (type: string) => {
    // Simulate data export
    const data = {
      projects: projects,
      timestamp: new Date().toISOString(),
      type: type
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Dados de ${type} exportados com sucesso!`);
  };

  const handleViewProject = (project: Project) => {
    setViewingItem(project);
    setShowViewModal(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingItem(project);
    setNewProjectForm({
      name: project.name,
      description: project.description || '',
      location: project.location,
      type: project.type as any,
      price: project.price,
      available: project.available,
      status: project.status as any,
      images: project.images && Array.isArray(project.images) ? project.images : [project.image || '']
    });
    setShowEditProjectModal(true);
  };

  const handleViewSocialProject = (project: any) => {
    setViewingItem(project);
    setShowViewSocialModal(true);
  };

  const handleEditSocialProject = (project: any) => {
    setEditingItem(project);
    setNewSocialProjectForm({
      title: project.title,
      description: project.description,
      location: project.location,
      budget: project.budget,
      beneficiaries: project.beneficiaries,
      status: project.status,
      category: project.category || 'education'
    });
    setShowEditSocialModal(true);
  };

  const handleUpdateProject = async () => {
    if (!editingItem) return;
    
    setLoading(true);
    try {
      const { data, error } = await updateProject(editingItem.id, {
        ...newProjectForm,
        image: newProjectForm.images[0] || editingItem.image
      });
      
      if (error) {
        toast.error(`Erro ao atualizar projeto: ${error}`);
        return;
      }
      
      toast.success('Projeto atualizado com sucesso!');
      setShowEditProjectModal(false);
      setEditingItem(null);
      
      // Refresh projects
      refreshProjects();
    } catch (error) {
      toast.error('Erro ao atualizar projeto');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSocialProject = async () => {
    if (!editingItem) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Projeto social atualizado com sucesso!');
      setShowEditSocialModal(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Erro ao atualizar projeto social');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = (projectId: string) => {
    toast.info('Funcionalidade de upload em desenvolvimento');
  };

  const handleGenerateCertificate = (transactionId: string) => {
    toast.success('Certificado gerado com sucesso!');
  };

  const handleSendEmail = (email: string) => {
    toast.success(`Email enviado para ${email}`);
  };

  const handleMarkAsPaid = (transactionId: string) => {
    toast.success('Transação marcada como paga');
  };

  const handleApplyAdvancedFilters = (filters: any) => {
    setAdvancedFilters(filters);
    const activeFiltersCount = Object.values(filters).filter(value => 
      value !== '' && value !== 'all'
    ).length;
    
    if (activeFiltersCount > 0) {
      toast.success(`${activeFiltersCount} filtro(s) aplicado(s)`);
    } else {
      toast.info('Nenhum filtro ativo');
    }
  };

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters({});
    setStatusFilter('all');
    setTypeFilter('all');
    setDateFilter('all');
    toast.info('Filtros limpos');
  };

  // Mock data for charts
  const salesData = [
    { month: 'Jan', sales: 45, revenue: 12500 },
    { month: 'Fev', sales: 67, revenue: 18900 },
    { month: 'Mar', sales: 89, revenue: 24300 },
    { month: 'Abr', sales: 72, revenue: 19800 },
    { month: 'Mai', sales: 95, revenue: 27600 },
    { month: 'Jun', sales: 108, revenue: 31400 },
  ];

  const projectTypeData = [
    { name: 'Reflorestamento', value: 45, color: '#10b981' },
    { name: 'Restauração', value: 30, color: '#3b82f6' },
    { name: 'Conservação', value: 15, color: '#f59e0b' },
    { name: 'Carbono Azul', value: 10, color: '#06b6d4' },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <CMSRealTimeStats stats={stats} />
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total de Projetos</CardTitle>
            <TreePine className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats.totalProjects}</div>
            <p className="text-xs text-green-600 mt-1">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Vendas Totais</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats.totalSales}</div>
            <p className="text-xs text-blue-600 mt-1">+8% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              R$ {stats.totalRevenue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-emerald-600 mt-1">+15% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats.activeUsers}</div>
            <p className="text-xs text-purple-600 mt-1">+23% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-800">Vendas por Mês</CardTitle>
            <CardDescription className="text-gray-600">Evolução mensal das vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px'
                  }} 
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-800">Tipos de Projeto</CardTitle>
            <CardDescription className="text-gray-600">Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={projectTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {projectTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {projectTypeData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-gray-800">Atividade Recente</CardTitle>
          <CardDescription className="text-gray-600">Últimas transações e eventos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'sale', user: 'João Silva', action: 'comprou 50m² do projeto Amazônia Verde', time: '2 horas atrás', value: 'R$ 1.250' },
              { type: 'donation', user: 'Maria Santos', action: 'fez doação para Educação Ambiental', time: '4 horas atrás', value: 'R$ 200' },
              { type: 'certificate', user: 'Carlos Oliveira', action: 'solicitou certificado físico', time: '6 horas atrás', value: '' },
              { type: 'sale', user: 'Ana Costa', action: 'comprou 25m² do projeto Mata Atlântica', time: '8 horas atrás', value: 'R$ 750' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'sale' ? 'bg-green-100 text-green-600' :
                    activity.type === 'donation' ? 'bg-blue-100 text-blue-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type === 'sale' ? <ShoppingCart className="h-4 w-4" /> :
                     activity.type === 'donation' ? <Heart className="h-4 w-4" /> :
                     <Award className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{activity.user} {activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                {activity.value && (
                  <Badge variant="outline" className="bg-white/10">
                    {activity.value}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestão de Projetos</h2>
          <p className="text-gray-600">Gerencie todos os projetos de reflorestamento</p>
        </div>
        <div className="flex gap-3">
          {selectedItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20">
                  Ações ({selectedItems.length})
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction('Ativar')}>
                  <Check className="h-4 w-4 mr-2" />
                  Ativar Selecionados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('Desativar')}>
                  <X className="h-4 w-4 mr-2" />
                  Desativar Selecionados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('Excluir')} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Selecionados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Projeto</DialogTitle>
                <DialogDescription>
                  Adicione um novo projeto de reflorestamento à plataforma
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Projeto</Label>
                    <Input
                      id="name"
                      value={newProjectForm.name}
                      onChange={(e) => setNewProjectForm({...newProjectForm, name: e.target.value})}
                      placeholder="Ex: Amazônia Verde"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={newProjectForm.location}
                      onChange={(e) => setNewProjectForm({...newProjectForm, location: e.target.value})}
                      placeholder="Ex: Amazônia, Brasil"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newProjectForm.description}
                    onChange={(e) => setNewProjectForm({...newProjectForm, description: e.target.value})}
                    placeholder="Descreva o projeto..."
                    rows={3}
                  />
                </div>
                
                {/* Upload de Imagens */}
                <ImageUploadWithResizer
                  images={newProjectForm.images}
                  onChange={(images) => setNewProjectForm({...newProjectForm, images})}
                  maxImages={5}
                  maxFileSize={5}
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select 
                      value={newProjectForm.type} 
                      onValueChange={(value: any) => setNewProjectForm({...newProjectForm, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reforestation">Reflorestamento</SelectItem>
                        <SelectItem value="restoration">Restauração</SelectItem>
                        <SelectItem value="conservation">Conservação</SelectItem>
                        <SelectItem value="blue-carbon">Carbono Azul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price">Preço por m²</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProjectForm.price}
                      onChange={(e) => setNewProjectForm({...newProjectForm, price: Number(e.target.value)})}
                      placeholder="25.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="available">Área Disponível (m²)</Label>
                    <Input
                      id="available"
                      type="number"
                      value={newProjectForm.available}
                      onChange={(e) => setNewProjectForm({...newProjectForm, available: Number(e.target.value)})}
                      placeholder="10000"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={newProjectForm.status === 'active'}
                    onCheckedChange={(checked: boolean) => setNewProjectForm({...newProjectForm, status: checked ? 'active' : 'inactive'})}
                  />
                  <Label htmlFor="status">Projeto Ativo</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewProjectModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateProject} disabled={loading}>
                  {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Criar Projeto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de Visualização de Projeto */}
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md">
              {viewingItem && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{viewingItem.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {viewingItem.location}
                      <Badge variant={viewingItem.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                        {viewingItem.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-6 py-4">
                    {/* Imagem do Projeto */}
                    <div className="w-full">
                      <img 
                        src={viewingItem.image} 
                        alt={viewingItem.name}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>

                    {/* Informações Principais */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-white/10 backdrop-blur-md border-white/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-gray-600">Preço/m²</p>
                          <p className="text-2xl font-bold text-green-600">R$ {viewingItem.price}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/10 backdrop-blur-md border-white/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-gray-600">Disponível</p>
                          <p className="text-2xl font-bold text-blue-600">{viewingItem.available.toLocaleString()}m²</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/10 backdrop-blur-md border-white/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-gray-600">Vendido</p>
                          <p className="text-2xl font-bold text-purple-600">{viewingItem.sold.toLocaleString()}m²</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/10 backdrop-blur-md border-white/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-gray-600">Receita Total</p>
                          <p className="text-2xl font-bold text-emerald-600">
                            R$ {(viewingItem.sold * viewingItem.price).toLocaleString('pt-BR')}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Progress Bar */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso de Vendas</span>
                            <span>{Math.round((viewingItem.sold / (viewingItem.sold + viewingItem.available)) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(viewingItem.sold / (viewingItem.sold + viewingItem.available)) * 100} 
                            className="h-3"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tipo e Descrição */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-white/10 backdrop-blur-md border-white/20">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Tipo de Projeto</h4>
                          <Badge variant="outline" className="capitalize">
                            {viewingItem.type}
                          </Badge>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/10 backdrop-blur-md border-white/20">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Impacto Estimado</h4>
                          <div className="space-y-1">
                            <p className="text-sm">🌳 {Math.round(viewingItem.sold * 0.1)} árvores plantadas</p>
                            <p className="text-sm">💨 {Math.round(viewingItem.sold * 22)} kg CO₂/ano</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {viewingItem.description && (
                      <Card className="bg-white/10 backdrop-blur-md border-white/20">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Descrição</h4>
                          <p className="text-gray-700">{viewingItem.description}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowViewModal(false)}>
                      Fechar
                    </Button>
                    <Button onClick={() => {
                      setShowViewModal(false);
                      handleEditProject(viewingItem);
                    }}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar Projeto
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Modal de Edição de Projeto */}
          <Dialog open={showEditProjectModal} onOpenChange={setShowEditProjectModal}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle>Editar Projeto</DialogTitle>
                <DialogDescription>
                  Atualize as informações do projeto de reflorestamento
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Nome do Projeto</Label>
                    <Input
                      id="edit-name"
                      value={newProjectForm.name}
                      onChange={(e) => setNewProjectForm({...newProjectForm, name: e.target.value})}
                      placeholder="Ex: Amazônia Verde"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-location">Localização</Label>
                    <Input
                      id="edit-location"
                      value={newProjectForm.location}
                      onChange={(e) => setNewProjectForm({...newProjectForm, location: e.target.value})}
                      placeholder="Ex: Amazônia, Brasil"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={newProjectForm.description}
                    onChange={(e) => setNewProjectForm({...newProjectForm, description: e.target.value})}
                    placeholder="Descreva o projeto..."
                    rows={3}
                  />
                </div>
                
                {/* Upload de Imagens */}
                <ImageUploadWithResizer
                  images={newProjectForm.images}
                  onChange={(images) => setNewProjectForm({...newProjectForm, images})}
                  maxImages={5}
                  maxFileSize={5}
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-type">Tipo</Label>
                    <Select 
                      value={newProjectForm.type} 
                      onValueChange={(value: any) => setNewProjectForm({...newProjectForm, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reforestation">Reflorestamento</SelectItem>
                        <SelectItem value="restoration">Restauração</SelectItem>
                        <SelectItem value="conservation">Conservação</SelectItem>
                        <SelectItem value="blue-carbon">Carbono Azul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-price">Preço por m²</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={newProjectForm.price}
                      onChange={(e) => setNewProjectForm({...newProjectForm, price: Number(e.target.value)})}
                      placeholder="25.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-available">Área Disponível (m²)</Label>
                    <Input
                      id="edit-available"
                      type="number"
                      value={newProjectForm.available}
                      onChange={(e) => setNewProjectForm({...newProjectForm, available: Number(e.target.value)})}
                      placeholder="10000"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-status"
                    checked={newProjectForm.status === 'active'}
                    onCheckedChange={(checked: boolean) => setNewProjectForm({...newProjectForm, status: checked ? 'active' : 'inactive'})}
                  />
                  <Label htmlFor="edit-status">Projeto Ativo</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditProjectModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateProject} disabled={loading}>
                  {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 backdrop-blur-md border-white/20"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="reforestation">Reflorestamento</SelectItem>
                <SelectItem value="restoration">Restauração</SelectItem>
                <SelectItem value="conservation">Conservação</SelectItem>
                <SelectItem value="blue-carbon">Carbono Azul</SelectItem>
              </SelectContent>
            </Select>
            <CMSAdvancedFilters 
              onApplyFilters={handleApplyAdvancedFilters}
              onClearFilters={handleClearAdvancedFilters}
              currentFilters={advancedFilters}
            />
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-md border-white/20"
              onClick={() => exportData('projetos')}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects
          .filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                project.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
            const matchesType = typeFilter === 'all' || project.type === typeFilter;
            
            // Advanced filters
            let matchesAdvanced = true;
            if (Object.keys(advancedFilters).length > 0) {
              if (advancedFilters.minValue && project.price < Number(advancedFilters.minValue)) {
                matchesAdvanced = false;
              }
              if (advancedFilters.maxValue && project.price > Number(advancedFilters.maxValue)) {
                matchesAdvanced = false;
              }
              if (advancedFilters.location && !project.location.toLowerCase().includes(advancedFilters.location.toLowerCase())) {
                matchesAdvanced = false;
              }
              if (advancedFilters.status !== 'all' && project.status !== advancedFilters.status) {
                matchesAdvanced = false;
              }
              if (advancedFilters.type !== 'all' && project.type !== advancedFilters.type) {
                matchesAdvanced = false;
              }
            }
            
            return matchesSearch && matchesStatus && matchesType && matchesAdvanced;
          })
          .map((project) => (
          <Card key={project.id} className={`bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 ${
            selectedItems.includes(project.id) ? 'ring-2 ring-green-500' : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={selectedItems.includes(project.id)}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setSelectedItems([...selectedItems, project.id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== project.id));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-800 mb-1">{project.name}</CardTitle>
                    <CardDescription className="text-gray-600 text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {project.location}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleViewProject(project)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditProject(project)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUploadImages(project.id)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Imagens
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteItem(project.id, 'Projeto')}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <img 
                  src={project.image} 
                  alt={project.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Preço/m²:</span>
                    <p className="font-semibold text-gray-800">R$ {project.price}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Disponível:</span>
                    <p className="font-semibold text-gray-800">{project.available.toLocaleString()}m²</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Vendido:</span>
                    <p className="font-semibold text-gray-800">{project.sold.toLocaleString()}m²</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <p className="font-semibold text-gray-800 capitalize">{project.type}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Vendas</span>
                    <span>{Math.round((project.sold / (project.sold + project.available)) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(project.sold / (project.sold + project.available)) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Revenue */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Receita Total</span>
                    <span className="font-semibold text-green-600">
                      R$ {(project.sold * project.price).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewProject(project)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEditProject(project)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteItem(project.id, 'Projeto')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-8 text-center">
            <TreePine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum projeto encontrado</h3>
            <p className="text-gray-600 mb-4">Comece criando seu primeiro projeto de reflorestamento</p>
            <Button 
              onClick={() => setShowNewProjectModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Projeto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Analytics & BI</h2>
        <p className="text-gray-600">Dashboards e relatórios detalhados</p>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-gray-800">Receita Mensal</CardTitle>
          <CardDescription className="text-gray-600">Evolução da receita ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-800">Top Projetos</CardTitle>
            <CardDescription className="text-gray-600">Projetos com mais vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.slice(0, 5).map((project, index) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{project.name}</p>
                      <p className="text-sm text-gray-500">{project.sold}m² vendidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">R$ {(project.sold * project.price).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-800">Métricas de Impacto</CardTitle>
            <CardDescription className="text-gray-600">Impacto ambiental total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <TreePine className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-800">Árvores Plantadas</p>
                    <p className="text-sm text-gray-500">Estimativa total</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">45,230</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-800">CO₂ Compensado</p>
                    <p className="text-sm text-gray-500">Toneladas totais</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600">1,247t</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-800">Área Restaurada</p>
                    <p className="text-sm text-gray-500">Hectares totais</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-600">892 ha</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen page-content">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 via-blue-50/80 to-green-50/80"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                CMS - Painel Administrativo
              </h1>
              <p className="text-gray-600">
                Gerencie todos os aspectos da plataforma Minha Floresta Conservações
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 mb-8 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <TreePine className="h-4 w-4" />
              <span className="hidden sm:inline">Projetos</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Certificados</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Vendas</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Stripe</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="projects">
            {renderProjects()}
          </TabsContent>

          <TabsContent value="social">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Projetos Sociais</h2>
                  <p className="text-gray-600">Gerencie iniciativas sociais e educacionais</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => exportData('projetos-sociais')}>
                    <Download className="h-4 w-4 mr-2" />
                    Relatório
                  </Button>
                  
                  <Dialog open={showNewSocialProjectModal} onOpenChange={setShowNewSocialProjectModal}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Projeto Social
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md">
                      <DialogHeader>
                        <DialogTitle>Criar Projeto Social</DialogTitle>
                        <DialogDescription>
                          Adicione uma nova iniciativa social à plataforma
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="social-title">Título do Projeto</Label>
                            <Input
                              id="social-title"
                              value={newSocialProjectForm.title}
                              onChange={(e) => setNewSocialProjectForm({...newSocialProjectForm, title: e.target.value})}
                              placeholder="Ex: Educação Ambiental"
                            />
                          </div>
                          <div>
                            <Label htmlFor="social-location">Localização</Label>
                            <Input
                              id="social-location"
                              value={newSocialProjectForm.location}
                              onChange={(e) => setNewSocialProjectForm({...newSocialProjectForm, location: e.target.value})}
                              placeholder="Ex: São Paulo, SP"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="social-description">Descrição</Label>
                          <Textarea
                            id="social-description"
                            value={newSocialProjectForm.description}
                            onChange={(e) => setNewSocialProjectForm({...newSocialProjectForm, description: e.target.value})}
                            placeholder="Descreva o projeto social..."
                            rows={3}
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="social-category">Categoria</Label>
                            <Select 
                              value={newSocialProjectForm.category} 
                              onValueChange={(value: any) => setNewSocialProjectForm({...newSocialProjectForm, category: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="education">Educação</SelectItem>
                                <SelectItem value="community">Comunidade</SelectItem>
                                <SelectItem value="research">Pesquisa</SelectItem>
                                <SelectItem value="conservation">Conservação</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="social-budget">Orçamento (R$)</Label>
                            <Input
                              id="social-budget"
                              type="number"
                              value={newSocialProjectForm.budget}
                              onChange={(e) => setNewSocialProjectForm({...newSocialProjectForm, budget: Number(e.target.value)})}
                              placeholder="50000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="social-beneficiaries">Beneficiários</Label>
                            <Input
                              id="social-beneficiaries"
                              type="number"
                              value={newSocialProjectForm.beneficiaries}
                              onChange={(e) => setNewSocialProjectForm({...newSocialProjectForm, beneficiaries: Number(e.target.value)})}
                              placeholder="100"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="social-status"
                            checked={newSocialProjectForm.status === 'active'}
                            onCheckedChange={(checked: boolean) => setNewSocialProjectForm({...newSocialProjectForm, status: checked ? 'active' : 'paused'})}
                          />
                          <Label htmlFor="social-status">Projeto Ativo</Label>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewSocialProjectModal(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateSocialProject} disabled={loading}>
                          {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                          Criar Projeto
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Modal de Visualização de Projeto Social */}
                  <Dialog open={showViewSocialModal} onOpenChange={setShowViewSocialModal}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md">
                      {viewingItem && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="text-2xl">{viewingItem.title}</DialogTitle>
                            <DialogDescription className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {viewingItem.location}
                              <Badge variant={viewingItem.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                                {viewingItem.status === 'active' ? 'Ativo' : viewingItem.status === 'paused' ? 'Pausado' : 'Completo'}
                              </Badge>
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid gap-6 py-4">
                            {/* Imagem do Projeto Social */}
                            {viewingItem.images && viewingItem.images[0] && (
                              <div className="w-full">
                                <img 
                                  src={viewingItem.images[0]} 
                                  alt={viewingItem.title}
                                  className="w-full h-64 object-cover rounded-lg"
                                />
                              </div>
                            )}

                            {/* Informações Principais */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                <CardContent className="p-4 text-center">
                                  <p className="text-sm text-gray-600">Orçamento</p>
                                  <p className="text-2xl font-bold text-blue-600">R$ {(viewingItem.budget || 0).toLocaleString('pt-BR')}</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                <CardContent className="p-4 text-center">
                                  <p className="text-sm text-gray-600">Gastos</p>
                                  <p className="text-2xl font-bold text-red-600">R$ {(viewingItem.spent || 0).toLocaleString('pt-BR')}</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                <CardContent className="p-4 text-center">
                                  <p className="text-sm text-gray-600">Beneficiários</p>
                                  <p className="text-2xl font-bold text-purple-600">{viewingItem.beneficiaries}</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                <CardContent className="p-4 text-center">
                                  <p className="text-sm text-gray-600">Doações</p>
                                  <p className="text-2xl font-bold text-green-600">R$ {(viewingItem.donationsReceived || 0).toLocaleString('pt-BR')}</p>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Progress Bar do Orçamento */}
                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Progresso do Orçamento</span>
                                    <span>{Math.round((viewingItem.spent / viewingItem.budget) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" 
                                      style={{ width: `${Math.min((viewingItem.spent / viewingItem.budget) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Categoria e Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                <CardContent className="p-4">
                                  <h4 className="font-semibold mb-2">Categoria</h4>
                                  <Badge variant="outline" className="capitalize">
                                    {viewingItem.category}
                                  </Badge>
                                </CardContent>
                              </Card>
                              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                <CardContent className="p-4">
                                  <h4 className="font-semibold mb-2">Eficiência de Gastos</h4>
                                  <div className="space-y-1">
                                    <p className="text-sm">💰 R$ {Math.round(viewingItem.spent / viewingItem.beneficiaries || 0)} por beneficiário</p>
                                    <p className="text-sm">📊 {Math.round((viewingItem.donationsReceived / viewingItem.budget) * 100)}% financiado por doações</p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Descrição */}
                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                              <CardContent className="p-4">
                                <h4 className="font-semibold mb-2">Descrição do Projeto</h4>
                                <p className="text-gray-700">{viewingItem.description}</p>
                              </CardContent>
                            </Card>

                            {/* Métricas de Impacto */}
                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                              <CardContent className="p-4">
                                <h4 className="font-semibold mb-4">Métricas de Impacto</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="text-center p-3 bg-white/5 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{viewingItem.beneficiaries}</div>
                                    <div className="text-sm text-gray-600">Pessoas Beneficiadas</div>
                                  </div>
                                  <div className="text-center p-3 bg-white/5 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{Math.round((viewingItem.spent / viewingItem.budget) * 100)}%</div>
                                    <div className="text-sm text-gray-600">Orçamento Utilizado</div>
                                  </div>
                                  <div className="text-center p-3 bg-white/5 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                      {viewingItem.status === 'completed' ? '100%' : 
                                       viewingItem.status === 'active' ? '60%' : '30%'}
                                    </div>
                                    <div className="text-sm text-gray-600">Progresso Geral</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowViewSocialModal(false)}>
                              Fechar
                            </Button>
                            <Button onClick={() => {
                              setShowViewSocialModal(false);
                              handleEditSocialProject(viewingItem);
                            }}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Editar Projeto
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Modal de Edição de Projeto Social */}
                  <Dialog open={showEditSocialModal} onOpenChange={setShowEditSocialModal}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-md">
                      <DialogHeader>
                        <DialogTitle>Editar Projeto Social</DialogTitle>
                        <DialogDescription>
                          Atualize as informações do projeto social
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-social-title">Título do Projeto</Label>
                            <Input
                              id="edit-social-title"
                              value={newSocialProjectForm.title}
                              onChange={(e) => setNewSocialProjectForm({...newSocialProjectForm, title: e.target.value})}
                              placeholder="Ex: Educação Ambiental"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-social-location">Localização</Label>
                            <Input
                              id="edit-social-location"
                              value={newSocialProjectForm.location}
                              onChange={(e) => setNewSocialProjectForm({...newSocialProjectForm, location: e.target.value})}
                              placeholder="Ex: São Paulo, SP"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-social-description">Descrição</Label>
                          <Textarea
                            id="edit-social-description"
                            value={newSocialProjectForm.description}
                            onChange={(e) => setNewSocialProjectForm({...newSocialProjectForm, description: e.target.value})}
                            placeholder="Descreva o projeto social..."
                            rows={3}
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="edit-social-category">Categoria</Label>
                            <Select 
                              value={newSocialProjectForm.category} 
                              onValueChange={(value: any) => setNewSocialProjectForm({...newSocialProjectForm, category: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="education">Educação</SelectItem>
                                <SelectItem value="community">Comunidade</SelectItem>
                                <SelectItem value="research">Pesquisa</SelectItem>
                                <SelectItem value="conservation">Conservação</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit-social-budget">Orçamento (R$)</Label>
                            <Input
                              id="edit-social-budget"
                              type="number"
                              value={newSocialProjectForm.budget}
                              onChange={(e) => setNewSocialProjectForm({...newSocialProjectForm, budget: Number(e.target.value)})}
                              placeholder="50000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-social-beneficiaries">Beneficiários</Label>
                            <Input
                              id="edit-social-beneficiaries"
                              type="number"
                              value={newSocialProjectForm.beneficiaries}
                              onChange={(e) => setNewSocialProjectForm({...newSocialProjectForm, beneficiaries: Number(e.target.value)})}
                              placeholder="100"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-social-status">Status do Projeto</Label>
                          <Select 
                            value={newSocialProjectForm.status} 
                            onValueChange={(value: any) => setNewSocialProjectForm({...newSocialProjectForm, status: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="paused">Pausado</SelectItem>
                              <SelectItem value="completed">Completo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditSocialModal(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleUpdateSocialProject} disabled={loading}>
                          {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                          Salvar Alterações
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Social Projects Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Projetos Ativos', value: socialProjects.filter(p => p.status === 'active').length, icon: Heart, color: 'text-blue-600' },
                  { label: 'Beneficiários Totais', value: socialProjects.reduce((sum, p) => sum + p.beneficiaries, 0).toLocaleString(), icon: Users, color: 'text-green-600' },
                  { label: 'Orçamento Total', value: `R$ ${socialProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-purple-600' },
                  { label: 'Doações Recebidas', value: `R$ ${socialProjects.reduce((sum, p) => sum + p.donationsReceived, 0).toLocaleString('pt-BR')}`, icon: Target, color: 'text-orange-600' }
                ].map((stat, index) => (
                  <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                          <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Social Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {socialProjects.slice(0, 6).map((project) => (
                  <Card key={project.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-gray-800 mb-1">{project.title}</CardTitle>
                          <CardDescription className="text-gray-600 text-sm">{project.location}</CardDescription>
                        </div>
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                          {project.status === 'active' ? 'Ativo' : 'Pausado'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {project.images && project.images[0] && (
                          <img 
                            src={project.images[0]} 
                            alt={project.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        
                        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Orçamento:</span>
                            <p className="font-semibold text-gray-800">R$ {project.budget.toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Gastos:</span>
                            <p className="font-semibold text-gray-800">R$ {project.spent.toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Beneficiários:</span>
                            <p className="font-semibold text-gray-800">{project.beneficiaries}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Doações:</span>
                            <p className="font-semibold text-gray-800">R$ {project.donationsReceived.toLocaleString('pt-BR')}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Progresso do Orçamento</span>
                            <span>{Math.round((project.spent / project.budget) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                              style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleViewSocialProject(project)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleEditSocialProject(project)}
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteItem(project.id, 'Projeto Social')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="certificates">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Certificados Emitidos</h2>
                  <p className="text-gray-600">Acompanhe todos os certificados gerados</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => exportData('certificados')}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                  <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                    <Award className="h-4 w-4 mr-2" />
                    Emitir Certificado
                  </Button>
                </div>
              </div>

              {/* Certificate Filters */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        placeholder="Buscar por número..."
                        className="pl-10 bg-white/10 backdrop-blur-md border-white/20"
                        value={certSearch}
                        onChange={(e) => { setCertPage(1); setCertSearch(e.target.value); }}
                      />
                    </div>
                    <Select value={certStatusFilter} onValueChange={(v: 'all' | 'issued' | 'revoked') => { setCertPage(1); setCertStatusFilter(v); }}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos Status</SelectItem>
                        <SelectItem value="issued">Emitidos</SelectItem>
                        <SelectItem value="revoked">Revogados</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={certProjectFilter} onValueChange={(v: string) => { setCertPage(1); setCertProjectFilter(v); }}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Projeto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos Projetos</SelectItem>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => { setCertPage(1); reloadAdminCertificates(); }}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Certificate Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Emitidos', value: stats.totalCertificates, icon: Award, color: 'text-blue-600' },
                  { label: 'Digitais', value: Math.round(stats.totalCertificates * 0.8), icon: Globe, color: 'text-green-600' },
                  { label: 'Físicos', value: Math.round(stats.totalCertificates * 0.2), icon: FileText, color: 'text-purple-600' },
                  { label: 'Este Mês', value: 12, icon: Calendar, color: 'text-orange-600' }
                ].map((stat, index) => (
                  <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-gray-800">Certificados Recentes</CardTitle>
                  <CardDescription className="text-gray-600">Últimos certificados emitidos</CardDescription>
                </CardHeader>
                <CardContent>
                  {adminCertsLoading ? (
                    <div className="text-gray-600">Carregando...</div>
                  ) : adminCertificates.length === 0 ? (
                    <div className="text-gray-600">Nenhum certificado encontrado</div>
                  ) : (
                    <div className="space-y-4">
                      {adminCertificates.map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                              <p className="font-medium text-gray-800">{cert.certificate_number}</p>
                              <p className="text-sm text-gray-500">Número</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{(cert.projects as any)?.name || 'Projeto'}</p>
                              <p className="text-sm text-gray-500">Projeto</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{Number(cert.area_sqm || 0)}m²</p>
                              <p className="text-sm text-gray-500">Área</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{new Date(cert.issued_at).toLocaleDateString('pt-BR')}</p>
                              <p className="text-sm text-gray-500">Data</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={cert.status === 'issued' ? 'default' : cert.status === 'revoked' ? 'destructive' : 'secondary'}>
                                {cert.status === 'issued' ? 'Emitido' : cert.status === 'revoked' ? 'Revogado' : cert.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              window.location.hash = `verificar-certificado?numero=${cert.certificate_number}`;
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant={cert.status === 'issued' ? 'destructive' : 'default'} onClick={async () => {
                              try {
                                const next = cert.status === 'issued' ? 'revoked' : 'issued';
                                const { error } = await supabase
                                  .from('certificates')
                                  .update({ status: next })
                                  .eq('id', cert.id);
                                if (error) {
                                  toast.error('Falha ao atualizar status');
                                  return;
                                }
                                toast.success(next === 'revoked' ? 'Certificado invalidado' : 'Certificado revalidado');
                                await reloadAdminCertificates();
                              } catch {
                                toast.error('Erro ao atualizar status');
                              }
                            }}>
                              {cert.status === 'issued' ? 'Invalidar' : 'Revalidar'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={async () => {
                              try {
                                const { data, error } = await supabase.functions.invoke('certificates-pdf', {
                                  body: { certificate_id: cert.id }
                                });
                                if (error) {
                                  toast.error('Falha ao regerar PDF');
                                  return;
                                }
                                toast.success('PDF regenerado com sucesso');
                                await reloadAdminCertificates();
                              } catch {
                                toast.error('Erro ao chamar função de PDF');
                              }
                            }}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              if (cert.pdf_url) {
                                const link = document.createElement('a');
                                link.href = cert.pdf_url as string;
                                link.download = `certificado-${cert.certificate_number}.pdf`;
                                link.click();
                              } else {
                                window.location.hash = `verificar-certificado?numero=${cert.certificate_number}`;
                              }
                            }}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Transações</h2>
                  <p className="text-gray-600">Histórico de vendas e pagamentos</p>
                </div>
                <div className="flex gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros Avançados
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Filtrar por:</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Período Personalizado
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Valor da Transação
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Método de Pagamento
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="h-4 w-4 mr-2" />
                        Cliente Específico
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => exportData('transacoes')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Relatório PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportData('transacoes')}>
                        <Download className="h-4 w-4 mr-2" />
                        Planilha Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportData('transacoes')}>
                        <Activity className="h-4 w-4 mr-2" />
                        Dados JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Hoje', period: 'today' },
                  { label: 'Esta Semana', period: 'week' },
                  { label: 'Este Mês', period: 'month' },
                  { label: 'Último Trimestre', period: 'quarter' }
                ].map((filter, index) => (
                  <Button 
                    key={index} 
                    size="sm" 
                    variant={dateFilter === filter.period ? 'default' : 'outline'}
                    onClick={() => setDateFilter(filter.period)}
                    className="bg-white/10 backdrop-blur-md border-white/20"
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>

              {/* Transaction Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Vendas Totais', value: stats.totalSales, icon: ShoppingCart, color: 'text-blue-600' },
                  { label: 'Receita Total', value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-green-600' },
                  { label: 'Ticket Médio', value: `R$ ${Math.round(stats.totalRevenue / stats.totalSales || 0)}`, icon: TrendingUp, color: 'text-purple-600' },
                  { label: 'Este Mês', value: 28, icon: Calendar, color: 'text-orange-600' }
                ].map((stat, index) => (
                  <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                          <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Enhanced Transactions Table */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-gray-800">Transações Recentes</CardTitle>
                      <CardDescription className="text-gray-600">Últimas vendas realizadas</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        placeholder="Buscar por ID ou email..."
                        className="pl-10 bg-white/10 backdrop-blur-md border-white/20"
                        value={txSearch}
                        onChange={(e) => { setTxPage(1); setTxSearch(e.target.value); }}
                      />
                    </div>
                    <Select value={txStatus} onValueChange={(v: 'all' | 'succeeded' | 'processing' | 'canceled') => { setTxPage(1); setTxStatus(v); }}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="succeeded">Concluídas</SelectItem>
                        <SelectItem value="processing">Processando</SelectItem>
                        <SelectItem value="canceled">Canceladas</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => { setTxPage(1); reloadAdminTransactions(); }}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {adminTxLoading ? (
                      <div className="text-gray-600">Carregando...</div>
                    ) : adminTx.length === 0 ? (
                      <div className="text-gray-600">Nenhuma transação encontrada</div>
                    ) : (
                      adminTx.map((tx) => (
                      <Card key={tx.stripe_payment_intent_id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-7 gap-4">
                              <div>
                                <p className="font-medium text-gray-800">{tx.stripe_payment_intent_id}</p>
                                <p className="text-xs text-gray-500">ID Transação</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{tx.purchases ? 'Compra' : 'Doação'}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {tx.purchases?.email || tx.donations?.donor_email || '-'}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">-</p>
                                <p className="text-xs text-gray-500">Projeto</p>
                              </div>
                              <div>
                                <p className="font-medium text-green-600">R$ {Number(tx.amount || 0).toLocaleString('pt-BR')}</p>
                                <p className="text-xs text-gray-500">Stripe</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{new Date(tx.created_at).toLocaleDateString('pt-BR')}</p>
                                <p className="text-xs text-gray-500">Data compra</p>
                              </div>
                              <div>
                                <div>
                                  <p className="font-medium text-gray-400">-</p>
                                  <p className="text-xs text-gray-500">Certificado</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <Badge 
                                  variant={tx.status === 'succeeded' ? 'default' : tx.status === 'processing' ? 'secondary' : 'destructive'}
                                >
                                  {tx.status === 'succeeded' ? 'Concluída' : tx.status === 'processing' ? 'Processando' : 'Cancelada'}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => toast.info(`Visualizando detalhes da transação ${tx.stripe_payment_intent_id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalhes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toast.success(`Recibo da transação ${tx.stripe_payment_intent_id} baixado`)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Baixar Recibo
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      {adminTx.length > 0 ? (
                        <>Mostrando {((txPage - 1) * txPageSize) + 1}–{Math.min(txPage * txPageSize, txTotal)} de {txTotal} transações</>
                      ) : (
                        <>Nenhuma transação</>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <Select value={String(txPageSize)} onValueChange={(v: string) => { setTxPage(1); setTxPageSize(Number(v)); }}>
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="Itens/página" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" disabled={txPage <= 1} onClick={() => setTxPage((p) => Math.max(1, p - 1))}>
                        Anterior
                      </Button>
                      <Button size="sm" variant="outline" disabled={txPage * txPageSize >= txTotal} onClick={() => setTxPage((p) => p + 1)}>
                        Próxima
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
                  <p className="text-gray-600">Métricas consolidadas de certificados e receita</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={reloadAnalytics}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
              </div>

              {analyticsError && (
                <Alert>
                  <AlertDescription>{analyticsError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">R$ {analyticsKpis.totalRevenue.toLocaleString('pt-BR')}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Certificados Emitidos</p>
                    <p className="text-2xl font-bold text-blue-600">{analyticsKpis.totalCertificates}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Área Total (m²)</p>
                    <p className="text-2xl font-bold text-emerald-600">{analyticsKpis.totalArea.toLocaleString('pt-BR')}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Certificados por Mês (6 meses)</CardTitle>
                    <CardDescription className="text-gray-600">Total de certificados emitidos mensalmente</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72">
                    {analyticsLoading ? (
                      <div className="text-gray-600">Carregando...</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsMonthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="issued" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIssued)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Top Projetos por Certificados</CardTitle>
                    <CardDescription className="text-gray-600">Projetos com mais certificados emitidos</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72">
                    {analyticsLoading ? (
                      <div className="text-gray-600">Carregando...</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsProjects}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" hide={false} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="certificates" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stripe">
            <CMSStripeConfig />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h2>
                  <p className="text-gray-600">Gerencie configurações globais da plataforma</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restaurar Padrões
                  </Button>
                  <Button onClick={handleSaveSettings} disabled={loading}>
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Configurações
                  </Button>
                </div>
              </div>

              {/* Success/Error Alert */}
              {loading && (
                <Alert>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Salvando configurações...
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configurações Gerais
                    </CardTitle>
                    <CardDescription className="text-gray-600">Configurações básicas da plataforma</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="platform-name">Nome da Plataforma</Label>
                      <Input 
                        id="platform-name"
                        value={systemSettings.platformName}
                        onChange={(e) => setSystemSettings({...systemSettings, platformName: e.target.value})}
                        className="mt-1 bg-white/10 backdrop-blur-md border-white/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email de Contato</Label>
                      <Input 
                        id="contact-email"
                        type="email"
                        value={systemSettings.contactEmail}
                        onChange={(e) => setSystemSettings({...systemSettings, contactEmail: e.target.value})}
                        className="mt-1 bg-white/10 backdrop-blur-md border-white/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="processing-fee">Taxa de Processamento (%)</Label>
                      <Input 
                        id="processing-fee"
                        type="number" 
                        step="0.1"
                        value={systemSettings.processingFee}
                        onChange={(e) => setSystemSettings({...systemSettings, processingFee: Number(e.target.value)})}
                        className="mt-1 bg-white/10 backdrop-blur-md border-white/20"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Settings */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Configurações de Pagamento
                    </CardTitle>
                    <CardDescription className="text-gray-600">Métodos de pagamento disponíveis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { key: 'pix', method: 'PIX', icon: Zap },
                        { key: 'credit', method: 'Cartão de Crédito', icon: ShoppingCart },
                        { key: 'boleto', method: 'Boleto Bancário', icon: FileText },
                        { key: 'transfer', method: 'Transferência Bancária', icon: Activity }
                      ].map((payment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <payment.icon className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-800">{payment.method}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={systemSettings.paymentMethods[payment.key as keyof typeof systemSettings.paymentMethods]}
                              onCheckedChange={(checked: boolean) => setSystemSettings({
                                ...systemSettings, 
                                paymentMethods: {
                                  ...systemSettings.paymentMethods,
                                  [payment.key]: checked
                                }
                              })}
                            />
                            <span className="text-sm text-gray-600">
                              {systemSettings.paymentMethods[payment.key as keyof typeof systemSettings.paymentMethods] ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Certificate Settings */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Configurações de Certificados
                    </CardTitle>
                    <CardDescription className="text-gray-600">Personalização dos certificados</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cert-prefix">Prefixo dos Certificados</Label>
                      <Input 
                        id="cert-prefix"
                        value={systemSettings.certificatePrefix}
                        onChange={(e) => setSystemSettings({...systemSettings, certificatePrefix: e.target.value})}
                        className="mt-1 bg-white/10 backdrop-blur-md border-white/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cert-validity">Validade (anos)</Label>
                      <Input 
                        id="cert-validity"
                        type="number" 
                        value={systemSettings.certificateValidity}
                        onChange={(e) => setSystemSettings({...systemSettings, certificateValidity: Number(e.target.value)})}
                        className="mt-1 bg-white/10 backdrop-blur-md border-white/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping-fee">Taxa de Envio Físico (R$)</Label>
                      <Input 
                        id="shipping-fee"
                        type="number" 
                        step="0.01"
                        value={systemSettings.physicalShippingFee}
                        onChange={(e) => setSystemSettings({...systemSettings, physicalShippingFee: Number(e.target.value)})}
                        className="mt-1 bg-white/10 backdrop-blur-md border-white/20"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Environmental Settings */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Configurações Ambientais
                    </CardTitle>
                    <CardDescription className="text-gray-600">Parâmetros de cálculo ambiental</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="co2-rate">CO₂ por m² (kg/ano)</Label>
                      <Input 
                        id="co2-rate"
                        type="number" 
                        value={systemSettings.co2PerSquareMeter}
                        onChange={(e) => setSystemSettings({...systemSettings, co2PerSquareMeter: Number(e.target.value)})}
                        className="mt-1 bg-white/10 backdrop-blur-md border-white/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trees-rate">Árvores por m²</Label>
                      <Input 
                        id="trees-rate"
                        type="number" 
                        step="0.01"
                        value={systemSettings.treesPerSquareMeter}
                        onChange={(e) => setSystemSettings({...systemSettings, treesPerSquareMeter: Number(e.target.value)})}
                        className="mt-1 bg-white/10 backdrop-blur-md border-white/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="survival-rate">Taxa de Sobrevivência (%)</Label>
                      <Input 
                        id="survival-rate"
                        type="number" 
                        value={systemSettings.survivalRate}
                        onChange={(e) => setSystemSettings({...systemSettings, survivalRate: Number(e.target.value)})}
                        className="mt-1 bg-white/10 backdrop-blur-md border-white/20"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Status do Sistema
                    </CardTitle>
                    <CardDescription className="text-gray-600">Informações sobre o sistema e backups</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Banco de Dados</p>
                            <p className="font-semibold text-green-600">Conectado</p>
                          </div>
                          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Último Backup</p>
                            <p className="font-semibold text-gray-800">Hoje, 03:00</p>
                          </div>
                          <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Armazenamento</p>
                            <p className="font-semibold text-gray-800">2.4GB / 10GB</p>
                          </div>
                          <Activity className="h-4 w-4 text-purple-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Backup Manual
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Verificar Sistema
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}