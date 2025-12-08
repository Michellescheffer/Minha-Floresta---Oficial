import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, ShoppingCart, FileText, TreePine, Settings,
  Search, Plus, Edit3, Trash2, TrendingUp, DollarSign, Award,
  Activity, Save, Upload, X, RefreshCw, Image as ImageIcon,
  Eye, Download, Calendar, MapPin, Check, AlertCircle, Filter,
  Mail, Phone, CreditCard, FileSpreadsheet, User, Sparkles,
  LayoutGrid, Info, BadgeCheck, Palette, ChevronRight
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { CustomersTab } from '../components/CustomersTab';
import { DonationsTab } from '../components/DonationsTab';
import { SettingsTab } from '../components/SettingsTab';
import { AnalyticsTab } from '../components/AnalyticsTab';
import { ImageUploadWithResizer } from '../components/ImageUploadWithResizer';

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

interface DashboardStats {
  totalProjects: number;
  totalSales: number;
  totalRevenue: number;
  totalCertificates: number;
  activeUsers: number;
  monthlyGrowth: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  type: string;
  price_per_sqm: number;
  available_area: number;
  total_area: number;
  status: string;
  image?: string;
  image_url?: string;
  gallery_images?: string[];
  created_at: string;
}

interface Certificate {
  id: string;
  certificate_number: string;
  area_sqm: number;
  issue_date: string;
  status: string;
  project_id: string;
  projects?: { name: string };
}

interface SaleData {
  month: string;
  sales: number;
  revenue: number;
}

const cmsTokens = {
  glass: 'rounded-2xl bg-white/85 backdrop-blur-2xl border border-white/30 shadow-xl shadow-emerald-900/5',
  subtleGlass: 'rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-emerald-900/5',
  sectionSpacing: 'px-4 sm:px-6 lg:px-8',
  heading: 'text-xs uppercase tracking-[0.2em] text-emerald-700/70 font-semibold',
  label: 'text-sm text-gray-600 font-medium',
  input: 'w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/60 focus:border-transparent transition-shadow bg-white',
};

const FORM_SECTIONS = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    description: 'Título, descrição curta e narrativa completa do projeto.',
  },
  {
    id: 'geo',
    title: 'Localização & Categoria',
    description: 'Defina onde o projeto acontece e o tipo de impacto.',
  },
  {
    id: 'metrics',
    title: 'Metas e Métricas',
    description: 'Preço por metro quadrado e disponibilidade da área.',
  },
  {
    id: 'media',
    title: 'Biblioteca Visual',
    description: 'Faça upload das imagens que representam o projeto.',
  },
];

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalCertificates: 0,
    activeUsers: 0,
    monthlyGrowth: 0
  });

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);

  // Certificates
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  // Sales Analytics
  const [salesData, setSalesData] = useState<SaleData[]>([]);

  // Site Images
  const [siteImages, setSiteImages] = useState<any[]>([]);
  const [certImages, setCertImages] = useState<any[]>([]);

  // Customers
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Donations
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'projects') loadProjects();
    if (activeTab === 'donations') loadDonations();
    if (activeTab === 'certificates') loadCertificates();
    if (activeTab === 'customers') loadCustomers();
    if (activeTab === 'analytics') loadSalesData();
    if (activeTab === 'images') loadImages();
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [projectsRes, certsRes] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact' }),
        supabase.from('certificates').select('*', { count: 'exact' })
      ]);

      let salesRows: any[] = [];
      try {
        const { data } = await supabase.from('sales').select('*');
        salesRows = data || [];
      } catch (e) {
        console.warn('Sales table query failed:', e);
      }

      const totalRevenue = salesRows.reduce((sum: number, sale: any) => sum + (sale.total_value || 0), 0);

      setStats({
        totalProjects: projectsRes.count || 0,
        totalSales: salesRows.length,
        totalRevenue,
        totalCertificates: certsRes.count || 0,
        activeUsers: 0,
        monthlyGrowth: 12.5
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Erro ao carregar projetos');
    }
  };

  const loadCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('issue_date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading certificates:', error);
        setCertificates([]);
        return;
      }

      // Load project names separately if needed
      if (data && data.length > 0) {
        const projectIds = [...new Set(data.map(c => c.project_id).filter(Boolean))];
        if (projectIds.length > 0) {
          const { data: projects } = await supabase
            .from('projects')
            .select('id, name')
            .in('id', projectIds);
          
          const projectMap = new Map(projects?.map(p => [p.id, p.name]) || []);
          const enrichedData = data.map(cert => ({
            ...cert,
            projects: cert.project_id ? { name: projectMap.get(cert.project_id) || 'Projeto' } : undefined
          }));
          setCertificates(enrichedData);
        } else {
          setCertificates(data);
        }
      } else {
        setCertificates([]);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      setCertificates([]);
    }
  };

  const loadSalesData = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*');

      if (error) {
        console.error('Error loading sales data:', error);
        setSalesData([]);
        return;
      }

      if (!data || data.length === 0) {
        setSalesData([]);
        return;
      }

      // Group by month
      const monthlyData: { [key: string]: { sales: number; revenue: number } } = {};
      
      data.forEach(sale => {
        const date = new Date(sale.sale_date || sale.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { sales: 0, revenue: 0 };
        }
        
        monthlyData[monthKey].sales += 1;
        monthlyData[monthKey].revenue += (sale.total_value || 0);
      });

      const chartData = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          sales: data.sales,
          revenue: data.revenue
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6); // Last 6 months

      setSalesData(chartData);
    } catch (error) {
      console.error('Error loading sales data:', error);
      setSalesData([]);
    }
  };

  const loadImages = async () => {
    try {
      const [siteRes, certRes] = await Promise.all([
        supabase.from('site_images').select('*').order('display_order'),
        supabase.from('certificate_images').select('*').order('display_order')
      ]);

      setSiteImages(siteRes.data || []);
      setCertImages(certRes.data || []);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      // Get all sales with customer info
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });

      if (salesError) throw salesError;

      // Get all certificates
      const { data: certificates, error: certsError } = await supabase
        .from('certificates')
        .select('*, projects(name)')
        .order('issue_date', { ascending: false });

      if (certsError) throw certsError;

      // Group by customer
      const customerMap = new Map();
      
      sales?.forEach(sale => {
        const key = sale.customer_email;
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            id: sale.customer_id,
            name: sale.customer_name,
            email: sale.customer_email,
            phone: sale.customer_phone,
            cpf: sale.customer_cpf,
            address: sale.customer_address,
            sales: [],
            certificates: [],
            totalSpent: 0,
            totalM2: 0,
            totalCO2: 0
          });
        }
        
        const customer = customerMap.get(key);
        customer.sales.push(sale);
        customer.totalSpent += sale.total_value;
        customer.totalM2 += sale.total_m2;
      });

      // Add certificates to customers
      certificates?.forEach(cert => {
        const customer = customerMap.get(cert.customer_email);
        if (customer) {
          customer.certificates.push(cert);
          customer.totalCO2 += cert.co2_offset_kg;
        }
      });

      setCustomers(Array.from(customerMap.values()));
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Erro ao carregar clientes');
    }
  };

  const loadDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error loading donations:', error);
      toast.error('Erro ao carregar projetos de doação');
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Projeto excluído com sucesso!');
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  const uploadImage = async (file: File, bucket: string = 'images') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${bucket}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen pt-56 sm:pt-52 pb-16 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg shadow-black/5 mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                CMS - Painel Administrativo
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gerencie todos os aspectos da plataforma
              </p>
            </div>
            <button
              onClick={loadDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white border border-white/20 rounded-xl transition-all shadow-lg shadow-black/5"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="backdrop-blur-xl bg-white/50 border-b border-white/20 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'projects', label: 'Projetos', icon: TreePine },
              { id: 'donations', label: 'Doações', icon: Activity },
              { id: 'certificates', label: 'Certificados', icon: Award },
              { id: 'customers', label: 'Clientes', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'images', label: 'Imagens', icon: ImageIcon },
              { id: 'settings', label: 'Configurações', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && activeTab === 'dashboard' ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <DashboardTab stats={stats} loading={loading} />
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <ProjectsTab
                projects={projects}
                onDelete={deleteProject}
                onReload={loadProjects}
              />
            )}

            {/* Donations Tab */}
            {activeTab === 'donations' && (
              <DonationsTab 
                donations={donations}
                onReload={loadDonations}
              />
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <CertificatesTab certificates={certificates} />
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <CustomersTab 
                customers={customers}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
              />
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <AnalyticsTab />
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <ImagesTab
                siteImages={siteImages}
                certImages={certImages}
                onReload={loadImages}
              />
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <SettingsTab />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab({ stats, loading }: { stats: DashboardStats; loading: boolean }) {
  const statCards = [
    {
      title: 'Total de Projetos',
      value: stats.totalProjects,
      icon: TreePine,
      color: 'from-emerald-500 to-teal-500',
      trend: '+12%',
    },
    {
      title: 'Vendas Totais',
      value: stats.totalSales,
      icon: ShoppingCart,
      color: 'from-cyan-500 to-sky-500',
      trend: '+8%',
    },
    {
      title: 'Receita Total',
      value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500',
      trend: '+15%',
    },
    {
      title: 'Certificados Emitidos',
      value: stats.totalCertificates,
      icon: Award,
      color: 'from-orange-500 to-rose-500',
    },
    {
      title: 'Usuários Ativos',
      value: stats.activeUsers,
      icon: Users,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Crescimento Mensal',
      value: `${stats.monthlyGrowth}%`,
      icon: TrendingUp,
      color: 'from-teal-500 to-green-500',
      trend: '↑',
    },
  ];

  const quickActions = [
    {
      title: 'Novo Projeto',
      description: 'Cadastre uma nova iniciativa e publique no site.',
      icon: Plus,
    },
    {
      title: 'Atualizar Hero',
      description: 'Envie novas fotos para o banner principal.',
      icon: ImageIcon,
    },
    {
      title: 'Gerar Certificado',
      description: 'Emita certificados de forma manual.',
      icon: BadgeCheck,
    },
    {
      title: 'Configurar Stripe',
      description: 'Revise as chaves e webhooks de pagamento.',
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} isLoading={loading} />
        ))}
      </div>

      <div className={`${cmsTokens.glass} p-6 grid gap-6 xl:grid-cols-[2fr,3fr]`}>
        <div className="space-y-5">
          <p className={cmsTokens.heading}>Resumo rápido</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <p className="text-sm text-gray-500">Receita acumulada</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.totalRevenue.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <LayoutGrid className="w-5 h-5" />
              </span>
              <div>
                <p className="text-sm text-gray-500">Projetos publicados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 leading-relaxed">
            Acompanhe o desempenho em tempo real e use os atalhos para manter a plataforma
            sempre atualizada. Os números são recalculados ao clicar em “Atualizar”.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              type="button"
              className="group p-4 text-left rounded-2xl border border-white/30 bg-white/70 backdrop-blur hover:-translate-y-0.5 hover:border-emerald-200 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <action.icon className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
              </div>
              <p className="font-semibold text-gray-900">{action.title}</p>
              <p className="text-sm text-gray-500 mt-1">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, trend, isLoading }: any) {
  if (isLoading) {
    return (
      <div className={`${cmsTokens.glass} h-36 animate-pulse`}>
        <div className="h-full w-full bg-gradient-to-r from-white/60 to-white/30 rounded-2xl" />
      </div>
    );
  }

  return (
    <div
      className={`${cmsTokens.glass} relative overflow-hidden p-6 shadow-xl shadow-emerald-900/5 hover:-translate-y-0.5 transition-all`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
      <div className="relative flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && <span className="text-xs font-semibold text-emerald-600">{trend}</span>}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Projects Tab Component
function ProjectsTab({ projects, onDelete, onReload }: { projects: Project[]; onDelete: (id: string) => void; onReload: () => Promise<void>; }) {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const emptyForm = {
    name: '',
    description: '',
    long_description: '',
    location: '',
    type: 'conservation',
    price_per_sqm: 0,
    available_area: 0,
    total_area: 0,
    status: 'active',
    image: '',
    gallery_images: [] as string[]
  };
  const [formData, setFormData] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      long_description: (project as any).long_description || '',
      location: project.location,
      type: project.type,
      price_per_sqm: project.price_per_sqm,
      available_area: project.available_area,
      total_area: project.total_area,
      status: project.status,
      image: project.image || project.image_url || '',
      gallery_images: Array.isArray(project.gallery_images) ? project.gallery_images : []
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProject(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const uploadBase64Image = async (base64Image: string, index: number) => {
    try {
      const response = await fetch(base64Image);
      const blob = await response.blob();
      const contentType = blob.type || 'image/jpeg';
      const extension = contentType.split('/')[1] || 'jpg';
      const fileName = `project-${Date.now()}-${index}.${extension}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, blob, { contentType });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      throw error;
    }
  };

  const processGalleryImages = async () => {
    const uploadedImages: string[] = [];

    for (const [index, image] of formData.gallery_images.entries()) {
      if (!image) continue;
      if (image.startsWith('http')) {
        uploadedImages.push(image);
        continue;
      }

      if (image.startsWith('data:')) {
        const publicUrl = await uploadBase64Image(image, index);
        uploadedImages.push(publicUrl);
      }
    }

    return uploadedImages;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Informe o nome do projeto');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Adicione uma descrição curta');
      return false;
    }
    if (!formData.location.trim()) {
      toast.error('Informe a localização');
      return false;
    }
    if (formData.price_per_sqm <= 0) {
      toast.error('Preço por m² deve ser maior que zero');
      return false;
    }
    if (formData.available_area <= 0) {
      toast.error('Área disponível deve ser maior que zero');
      return false;
    }
    if (formData.total_area <= 0) {
      toast.error('Área total deve ser maior que zero');
      return false;
    }
    if (formData.total_area < formData.available_area) {
      toast.error('Área total não pode ser menor que a disponível');
      return false;
    }
    if (formData.gallery_images.length === 0) {
      toast.error('Adicione pelo menos uma imagem do projeto');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);

    try {
      const gallery_images = await processGalleryImages();

      if (gallery_images.length === 0) {
        toast.error('Não foi possível processar as imagens do projeto');
        setSaving(false);
        return;
      }

      const coverImage = gallery_images[0];
      const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      long_description: formData.long_description.trim(),
      location: formData.location.trim(),
      type: formData.type,
      price_per_sqm: Number(formData.price_per_sqm),
      price_per_m2: Number(formData.price_per_sqm),
      available_area: Number(formData.available_area),
      available_m2: Number(formData.available_area),
      total_area: Number(formData.total_area || formData.available_area),
      total_m2: Number(formData.total_area || formData.available_area),
      status: formData.status,
      image: coverImage,
      main_image: coverImage,
      gallery_images
    };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', editingProject.id);

        if (error) throw error;
        toast.success('Projeto atualizado!');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([payload]);

        if (error) throw error;
        toast.success('Projeto criado!');
      }

      setShowModal(false);
      setEditingProject(null);
      setFormData(emptyForm);
      await onReload();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Erro ao salvar projeto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className={`${cmsTokens.glass} p-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <p className={cmsTokens.heading}>Catálogo de projetos</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-bold text-gray-900">{projects.length}</h2>
            <span className="text-sm text-gray-500">projetos publicados</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Gerencie cards, disponibilidade e storytelling de cada iniciativa em destaque.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onReload}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-emerald-300 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar lista
          </button>
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition"
          >
            Novo projeto
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className={`${cmsTokens.glass} p-12 text-center text-gray-500`}>
          Nenhum projeto cadastrado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {projects.map((project: Project) => (
            <article
              key={project.id}
              className={`${cmsTokens.glass} p-5 flex flex-col gap-4`}
            >
              <div className="flex gap-4">
                <div className="w-28 h-28 rounded-2xl bg-gray-100 overflow-hidden">
                  {(project.image || project.image_url) ? (
                    <img
                      src={project.image || project.image_url}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      Sem imagem
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg text-gray-900">{project.name}</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 capitalize">
                      {project.status === 'active' ? 'ativo' : project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{project.location}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-emerald-50 text-emerald-700 px-3 py-2 font-semibold">
                      R$ {project.price_per_sqm}/m²
                    </div>
                    <div className="rounded-xl bg-gray-100 text-gray-700 px-3 py-2 font-medium">
                      {project.available_area}m² disponíveis
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs text-gray-500">
                  Atualizado em {new Date(project.created_at).toLocaleDateString('pt-BR')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="px-3 py-2 rounded-xl border border-transparent text-sm text-blue-600 hover:bg-blue-50 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(project.id)}
                    className="px-3 py-2 rounded-xl border border-transparent text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {FORM_SECTIONS.map((section) => (
                <div key={section.id} className="space-y-4">
                  <div className="space-y-1">
                    <p className={cmsTokens.heading}>{section.title}</p>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>

                  {section.id === 'basic' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nome do projeto"
                        className={cmsTokens.input}
                        required
                      />
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={`${cmsTokens.input} min-h-[70px]`}
                        placeholder="Descrição breve para o card do site"
                        required
                      />
                      <div>
                        <textarea
                          value={formData.long_description || ''}
                          onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                          className={`${cmsTokens.input} min-h-[160px]`}
                          placeholder="Conte o storytelling completo, metas e etapas do projeto..."
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Este texto aparece na página detalhada do projeto.
                        </p>
                      </div>
                    </div>
                  )}

                  {section.id === 'geo' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ex: Paragominas - PA"
                        className={cmsTokens.input}
                        required
                      />
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className={cmsTokens.input}
                      >
                        <option value="conservation">Conservação</option>
                        <option value="reforestation">Reflorestamento</option>
                        <option value="restoration">Restauração</option>
                      </select>
                    </div>
                  )}

                  {section.id === 'metrics' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'price_per_sqm', label: 'Preço/m²', step: '0.01' },
                        { id: 'available_area', label: 'Área disponível (m²)' },
                        { id: 'total_area', label: 'Área total (m²)' },
                      ].map((field) => (
                        <div key={field.id}>
                          <label className={`${cmsTokens.label} mb-2 block`}>{field.label}</label>
                          <input
                            type="number"
                            step={field.step}
                            value={(formData as any)[field.id]}
                            onChange={(e) => setFormData({
                              ...formData,
                              [field.id]: e.target.value ? Number(e.target.value) : 0
                            })}
                            className={cmsTokens.input}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {section.id === 'media' && (
                    <div className="space-y-4">
                      <ImageUploadWithResizer
                        images={formData.gallery_images}
                        onChange={(images) => setFormData((prev) => ({
                          ...prev,
                          gallery_images: images,
                          image: images[0] || prev.image
                        }))}
                        maxImages={5}
                        maxFileSize={5}
                      />
                      <p className="text-xs text-gray-500">
                        Use imagens com pelo menos 1600px de largura para manter a qualidade no site.
                      </p>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-emerald-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg transition disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Salvando...' : editingProject ? 'Atualizar projeto' : 'Publicar projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Certificates Tab Component
function CertificatesTab({ certificates }: { certificates: Certificate[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Certificados Emitidos</h2>
      
      <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Projeto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Área</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{cert.certificate_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{cert.projects?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cert.area_sqm}m²</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(cert.issue_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      cert.status === 'issued' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Images Tab Component
function ImagesTab({ siteImages, certImages, onReload }: any) {
  const [uploading, setUploading] = useState(false);
  const heroSlots = [
    {
      key: 'hero_primary',
      label: 'Imagem principal',
      description: 'Primeiros 5 segundos – destaque desktop',
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      key: 'hero_secondary',
      label: 'Imagem secundária',
      description: 'Transição intermediária e tablet',
      accent: 'from-blue-500 to-cyan-500',
    },
    {
      key: 'hero_tertiary',
      label: 'Imagem terciária',
      description: 'Fallback mobile / campanhas sazonais',
      accent: 'from-amber-500 to-orange-500',
    },
  ];

  const handleUploadSiteImage = async (file: File, slotKey?: string) => {
    if (!file) return;
    if (!slotKey && siteImages.length >= heroSlots.length) {
      toast.error('Máximo de 3 imagens do Hero permitido');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande! Máximo 5MB');
      return;
    }

    try {
      setUploading(true);
      let fileToUpload = file;
      if (file.size > 1024 * 1024) {
        fileToUpload = await compressImage(file);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `site-${Date.now()}.${fileExt}`;
      const filePath = `site/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, fileToUpload);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(filePath);

      const resolvedKey =
        slotKey || heroSlots[siteImages.length]?.key || `hero_${siteImages.length + 1}`;
      const slotIndex = heroSlots.findIndex((slot) => slot.key === resolvedKey);
      const displayOrder = slotIndex >= 0 ? slotIndex : siteImages.length;

      const { error: dbError } = await supabase
        .from('site_images')
        .upsert(
          [
            {
              key: resolvedKey,
              url: publicUrl,
              alt_text: file.name,
              display_order: displayOrder,
              is_active: true,
            },
          ],
          { onConflict: 'key' },
        );
      if (dbError) throw dbError;

      toast.success('Imagem do site adicionada!');
      onReload();
    } catch (error: any) {
      console.error('Error uploading site image:', error);
      if (error.message?.includes('exceeded')) {
        toast.error('Imagem muito grande! Tente uma menor.');
      } else {
        toast.error('Erro ao enviar imagem');
      }
    } finally {
      setUploading(false);
    }
  };

  // Helper function to compress images
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const maxWidth = 1920;
          const maxHeight = 1080;
          
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleUploadCertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (certImages.length >= 8) {
      toast.error('Máximo de 8 imagens de certificado permitido');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Imagem muito grande! Máximo 5MB');
      return;
    }

    try {
      setUploading(true);

      // Compress if needed
      let fileToUpload = file;
      if (file.size > 1024 * 1024) {
        fileToUpload = await compressImage(file);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `cert-${Date.now()}.${fileExt}`;
      const filePath = `certificates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, fileToUpload);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Insert into certificate_images table
      const { error: dbError } = await supabase
        .from('certificate_images')
        .insert([{
          url: publicUrl,
          alt_text: 'Certificate Image',
          display_order: certImages.length + 1,
          is_active: true
        }]);

      if (dbError) throw dbError;

      toast.success('Imagem de certificado adicionada!');
      onReload();
    } catch (error) {
      console.error('Error uploading cert image:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSiteImage = async (id: string, url: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      // Extract file path from URL
      const urlParts = url.split('/');
      const filePath = urlParts.slice(-2).join('/');

      // Delete from storage
      await supabase.storage.from('images').remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('site_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Imagem excluída!');
      onReload();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Erro ao excluir imagem');
    }
  };

  const handleDeleteCertImage = async (id: string, url: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      // Extract file path from URL
      const urlParts = url.split('/');
      const filePath = urlParts.slice(-2).join('/');

      // Delete from storage
      await supabase.storage.from('images').remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('certificate_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Imagem excluída!');
      onReload();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Erro ao excluir imagem');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className={cmsTokens.heading}>Biblioteca visual</p>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar imagens</h2>
          <p className="text-sm text-gray-500">
            Atualize os banners do site e a galeria usada nos certificados digitais.
          </p>
        </div>
        <button
          type="button"
          onClick={onReload}
          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-emerald-300 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Recarregar
        </button>
      </div>
      {/* Hero slots */}
      <section className={`${cmsTokens.glass} p-6 space-y-6`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Hero Banner</h3>
            <p className="text-sm text-gray-500">
              Escolha até 3 imagens para rotacionar a cada 5 segundos no topo do site.
            </p>
          </div>
          <span className="text-xs text-gray-500">{siteImages.length}/3 slots preenchidos</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {heroSlots.map((slot) => {
            const current = siteImages.find((img: any) => img.key === slot.key);
            return (
              <div
                key={slot.key}
                className="relative rounded-[24px] border border-white/30 bg-white/70 backdrop-blur-xl p-4 flex flex-col gap-4 shadow-md"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${slot.accent} opacity-10 rounded-[24px] pointer-events-none`} />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{slot.label}</p>
                    <p className="text-xs text-gray-500">{slot.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${current ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {current ? 'Em uso' : 'Vazio'}
                  </span>
                </div>
                <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-40">
                  {current ? (
                    <img
                      src={current.url}
                      alt={current.alt_text || slot.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                      <ImageIcon className="w-5 h-5" />
                      Aguardando upload
                    </div>
                  )}
                </div>
                <div className="relative flex gap-2">
                  <label className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg'} transition`}>
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Enviando...' : current ? 'Substituir' : 'Enviar'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadSiteImage(file, slot.key);
                      }}
                    />
                  </label>
                  {current && (
                    <button
                      onClick={() => handleDeleteSiteImage(current.id, current.url)}
                      className="px-3 py-2 rounded-xl border border-transparent text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Certificate gallery */}
      <section className={`${cmsTokens.glass} p-6 space-y-6`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Galeria de certificados ({certImages.length}/8)
            </h3>
            <p className="text-sm text-gray-500">
              As imagens são sorteadas aleatoriamente em cada certificado emitido.
            </p>
          </div>
          <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white ${
            certImages.length >= 8 || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg'
          } transition`}>
            <Upload className="w-4 h-4" />
            {uploading ? 'Enviando...' : 'Adicionar imagem'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading || certImages.length >= 8}
              onChange={handleUploadCertImage}
            />
          </label>
        </div>

        {certImages.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            Nenhuma imagem cadastrada ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {certImages.map((image: any, index: number) => (
              <article
                key={image.id}
                className="rounded-2xl border border-white/30 bg-white/80 backdrop-blur p-3 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium text-gray-900">#{index + 1}</span>
                  <button
                    onClick={() => handleDeleteCertImage(image.id, image.url)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden h-40 bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.alt_text || `Certificado ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => window.open(image.url, '_blank')}
                  />
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {image.alt_text || 'Sem descrição'}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
            </div>
            <span className="text-xs text-gray-500">{siteImages.length}/3 slots preenchidos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {heroSlots.map((slot) => {
              const current = siteImages.find((img: any) => img.key === slot.key);
              return (
                <div
                  key={slot.key}
                  className="relative rounded-[24px] border border-white/30 bg-white/70 backdrop-blur-xl p-4 flex flex-col gap-4 shadow-md"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${slot.accent} opacity-10 rounded-[24px] pointer-events-none`} />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{slot.label}</p>
                      <p className="text-xs text-gray-500">{slot.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${current ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {current ? 'Em uso' : 'Vazio'}
                    </span>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-40">
                    {current ? (
                      <img
                        src={current.url}
                        alt={current.alt_text || slot.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                        <ImageIcon className="w-5 h-5" />
                        Aguardando upload
                      </div>
                    )}
                  </div>
                  <div className="relative flex gap-2">
                    <label className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg'} transition`}>
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Enviando...' : current ? 'Substituir' : 'Enviar'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadSiteImage(file, slot.key);
                        }}
                      />
                    </label>
                    {current && (
                      <button
                        onClick={() => handleDeleteSiteImage(current.id, current.url)}
                        className="px-3 py-2 rounded-xl border border-transparent text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Certificate gallery */}
        <section className={`${cmsTokens.glass} p-6 space-y-6`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Galeria de certificados ({certImages.length}/8)
              </h3>
              <p className="text-sm text-gray-500">
                As imagens são sorteadas aleatoriamente em cada certificado emitido.
              </p>
            </div>
            <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white ${
              certImages.length >= 8 || uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg'
            } transition`}>
              <Upload className="w-4 h-4" />
              {uploading ? 'Enviando...' : 'Adicionar imagem'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading || certImages.length >= 8}
                onChange={handleUploadCertImage}
              />
            </label>
          </div>

          {certImages.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              Nenhuma imagem cadastrada ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {certImages.map((image: any, index: number) => (
                <article
                  key={image.id}
                  className="rounded-2xl border border-white/30 bg-white/80 backdrop-blur p-3 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium text-gray-900">#{index + 1}</span>
                    <button
                      onClick={() => handleDeleteCertImage(image.id, image.url)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden h-40 bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.alt_text || `Certificado ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => window.open(image.url, '_blank')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {image.alt_text || 'Sem descrição'}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
