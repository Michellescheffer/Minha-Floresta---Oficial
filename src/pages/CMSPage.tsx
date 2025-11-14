import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, ShoppingCart, FileText, TreePine, Settings,
  Search, Plus, Edit3, Trash2, TrendingUp, DollarSign, Award,
  Activity, Save, Upload, X, RefreshCw, Image as ImageIcon,
  Eye, Download, Calendar, MapPin, Check, AlertCircle
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

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
  image_url: string;
  created_at: string;
}

interface Certificate {
  id: string;
  certificate_number: string;
  area_sqm: number;
  issued_at: string;
  status: string;
  project_id: string;
  projects?: { name: string };
}

interface SaleData {
  month: string;
  sales: number;
  revenue: number;
}

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
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Certificates
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  // Sales Analytics
  const [salesData, setSalesData] = useState<SaleData[]>([]);

  // Site Images
  const [siteImages, setSiteImages] = useState<any[]>([]);
  const [certImages, setCertImages] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'projects') loadProjects();
    if (activeTab === 'certificates') loadCertificates();
    if (activeTab === 'analytics') loadSalesData();
    if (activeTab === 'images') loadImages();
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load real data from Supabase
      const [projectsRes, certsRes, purchasesRes] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact' }),
        supabase.from('certificates').select('*', { count: 'exact' }),
        supabase.from('purchases').select('total_price')
      ]);

      const totalRevenue = purchasesRes.data?.reduce((sum, p) => sum + (p.total_price || 0), 0) || 0;

      setStats({
        totalProjects: projectsRes.count || 0,
        totalSales: purchasesRes.data?.length || 0,
        totalRevenue,
        totalCertificates: certsRes.count || 0,
        activeUsers: 0, // TODO: implement user tracking
        monthlyGrowth: 12.5 // TODO: calculate from historical data
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
        .select('*, projects(name)')
        .order('issued_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
      toast.error('Erro ao carregar certificados');
    }
  };

  const loadSalesData = async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('created_at, total_price, area_sqm');

      if (error) throw error;

      // Group by month
      const monthlyData: { [key: string]: { sales: number; revenue: number } } = {};
      
      data?.forEach(purchase => {
        const date = new Date(purchase.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { sales: 0, revenue: 0 };
        }
        
        monthlyData[monthKey].sales += 1;
        monthlyData[monthKey].revenue += purchase.total_price || 0;
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

  const saveProject = async (project: Partial<Project>) => {
    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(project)
          .eq('id', editingProject.id);

        if (error) throw error;
        toast.success('Projeto atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([project]);

        if (error) throw error;
        toast.success('Projeto criado com sucesso!');
      }

      setShowProjectModal(false);
      setEditingProject(null);
      loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Erro ao salvar projeto');
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
    <div className="min-h-screen pt-56 sm:pt-52 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg shadow-black/5 mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
              { id: 'certificates', label: 'Certificados', icon: Award },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'images', label: 'Imagens', icon: ImageIcon },
              { id: 'settings', label: 'Configurações', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
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
              <DashboardTab stats={stats} />
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <ProjectsTab
                projects={projects}
                onEdit={setEditingProject}
                onDelete={deleteProject}
                onAdd={() => setShowProjectModal(true)}
              />
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <CertificatesTab certificates={certificates} />
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <AnalyticsTab salesData={salesData} />
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
function DashboardTab({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total de Projetos"
          value={stats.totalProjects}
          icon={TreePine}
          color="from-green-500 to-emerald-500"
          trend="+12%"
        />
        <StatCard
          title="Vendas Totais"
          value={stats.totalSales}
          icon={ShoppingCart}
          color="from-blue-500 to-cyan-500"
          trend="+8%"
        />
        <StatCard
          title="Receita Total"
          value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`}
          icon={DollarSign}
          color="from-purple-500 to-pink-500"
          trend="+15%"
        />
        <StatCard
          title="Certificados Emitidos"
          value={stats.totalCertificates}
          icon={Award}
          color="from-orange-500 to-red-500"
        />
        <StatCard
          title="Usuários Ativos"
          value={stats.activeUsers}
          icon={Users}
          color="from-indigo-500 to-purple-500"
        />
        <StatCard
          title="Crescimento Mensal"
          value={`${stats.monthlyGrowth}%`}
          icon={TrendingUp}
          color="from-teal-500 to-green-500"
          trend="↑"
        />
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, trend }: any) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-6 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all group">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <span className="text-sm font-semibold text-green-600">{trend}</span>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// Projects Tab Component
function ProjectsTab({ projects, onEdit, onDelete, onAdd }: any) {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    type: 'reforestation',
    price_per_sqm: 0,
    available_area: 0,
    total_area: 0,
    status: 'active',
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      location: project.location,
      type: project.type,
      price_per_sqm: project.price_per_sqm,
      available_area: project.available_area,
      total_area: project.total_area,
      status: project.status,
      image_url: project.image_url
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      type: 'reforestation',
      price_per_sqm: 0,
      available_area: 0,
      total_area: 0,
      status: 'active',
      image_url: ''
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `project-${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(formData)
          .eq('id', editingProject.id);

        if (error) throw error;
        toast.success('Projeto atualizado!');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([formData]);

        if (error) throw error;
        toast.success('Projeto criado!');
      }

      setShowModal(false);
      window.location.reload(); // Reload to update list
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Erro ao salvar projeto');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Projetos</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhum projeto cadastrado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project: Project) => (
            <div
              key={project.id}
              className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-6 shadow-xl shadow-black/5 hover:shadow-2xl transition-all"
            >
              <div className="flex gap-4">
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{project.location}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-semibold">
                      R$ {project.price_per_sqm}/m²
                    </span>
                    <span className="text-gray-600">
                      {project.available_area}m² disponíveis
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => onDelete(project.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="reforestation">Reflorestamento</option>
                    <option value="restoration">Restauração</option>
                    <option value="conservation">Conservação</option>
                    <option value="blue-carbon">Blue Carbon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço/m²</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_per_sqm}
                    onChange={(e) => setFormData({ ...formData, price_per_sqm: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Área Disponível</label>
                  <input
                    type="number"
                    value={formData.available_area}
                    onChange={(e) => setFormData({ ...formData, available_area: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Área Total</label>
                  <input
                    type="number"
                    value={formData.total_area}
                    onChange={(e) => setFormData({ ...formData, total_area: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem</label>
                <div className="flex items-center gap-4">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-20 h-20 rounded-xl object-cover" />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Enviando...' : 'Escolher Imagem'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  {editingProject ? 'Atualizar' : 'Criar'}
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
                    {new Date(cert.issued_at).toLocaleDateString('pt-BR')}
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

// Analytics Tab Component
function AnalyticsTab({ salesData }: { salesData: SaleData[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Análise de Vendas</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Images Tab Component
function ImagesTab({ siteImages, certImages, onReload }: any) {
  const [uploading, setUploading] = useState(false);

  const handleUploadSiteImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `site-${Date.now()}.${fileExt}`;
      const filePath = `site/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Insert into site_images table
      const { error: dbError } = await supabase
        .from('site_images')
        .insert([{
          key: `hero-${Date.now()}`,
          url: publicUrl,
          alt_text: 'Hero Image',
          display_order: siteImages.length + 1,
          is_active: true
        }]);

      if (dbError) throw dbError;

      toast.success('Imagem do site adicionada!');
      onReload();
    } catch (error) {
      console.error('Error uploading site image:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadCertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (certImages.length >= 8) {
      toast.error('Máximo de 8 imagens de certificado permitido');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `cert-${Date.now()}.${fileExt}`;
      const filePath = `certificates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

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
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Gerenciar Imagens</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Images */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Imagens do Site (Hero)</h3>
            <label className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-xl cursor-pointer hover:shadow-lg transition-all">
              <Upload className="w-4 h-4" />
              {uploading ? 'Enviando...' : 'Adicionar'}
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadSiteImage}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <div className="space-y-3">
            {siteImages.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Nenhuma imagem cadastrada</p>
            ) : (
              siteImages.map((img: any) => (
                <div key={img.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl group">
                  <img src={img.url} alt={img.alt_text || ''} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{img.key}</p>
                    <p className="text-xs text-gray-600">{img.alt_text}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSiteImage(img.id, img.url)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Certificate Images */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Imagens dos Certificados ({certImages.length}/8)
            </h3>
            <label className={`flex items-center gap-2 px-3 py-2 text-white text-sm rounded-xl cursor-pointer transition-all ${
              certImages.length >= 8 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg'
            }`}>
              <Upload className="w-4 h-4" />
              {uploading ? 'Enviando...' : 'Adicionar'}
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCertImage}
                className="hidden"
                disabled={uploading || certImages.length >= 8}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {certImages.length === 0 ? (
              <p className="col-span-2 text-sm text-gray-500 text-center py-8">Nenhuma imagem cadastrada</p>
            ) : (
              certImages.map((img: any) => (
                <div key={img.id} className="relative group">
                  <img src={img.url} alt="" className="w-full h-32 rounded-xl object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteCertImage(img.id, img.url)}
                      className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Configurações</h2>
      
      <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-6 shadow-xl">
        <p className="text-gray-600">Configurações do sistema em desenvolvimento...</p>
      </div>
    </div>
  );
}

