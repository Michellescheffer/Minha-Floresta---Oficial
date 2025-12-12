import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, Activity, Award, Image as ImageIcon,
  Settings, RefreshCw, TreePine, TrendingUp
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';

// Extracted Components
import { DashboardTab } from '../components/cms/DashboardTab';
import { ProjectsTab } from '../components/cms/ProjectsTab';
import { CertificatesTab } from '../components/cms/CertificatesTab';
import { ImagesTab } from '../components/cms/ImagesTab';

// Existing Components
import { CustomersTab } from '../components/CustomersTab';
import { SocialProjectsTab } from '../components/SocialProjectsTab';
import { SettingsTab } from '../components/SettingsTab';
import { AnalyticsTab } from '../components/AnalyticsTab';

// Shared Types & Constants
import { DashboardStats, Project, Certificate } from '../components/cms/types';

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

  // Site Images
  const [siteImages, setSiteImages] = useState<any[]>([]);
  const [certImages, setCertImages] = useState<any[]>([]);

  // Customers (Placeholder)
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
    if (activeTab === 'analytics') {
      // AnalyticsTab fetches its own data
    }
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
          setCertificates(enrichedData as Certificate[]);
        } else {
          setCertificates(data as Certificate[]);
        }
      } else {
        setCertificates([]);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      setCertificates([]);
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
      // Fetch all sales to aggregate customer data
      const { data: sales, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });

      if (error) throw error;

      if (!sales || sales.length === 0) {
        setCustomers([]);
        return;
      }

      // Aggregate by email (assuming guest checkout or user email)
      const customerMap = new Map();

      sales.forEach((sale: any) => {
        const email = sale.customer_email || sale.user_email || 'unknown';
        if (email === 'unknown') return;

        if (!customerMap.has(email)) {
          customerMap.set(email, {
            id: sale.user_id || email, // Use user_id if available, else email as ID
            name: sale.customer_name || sale.user_name || 'Cliente',
            email: email,
            phone: sale.customer_phone || '',
            cpf: sale.customer_cpf || '',
            sales: [],
            certificates: [], // Will need to link certificates if possible
            totalSpent: 0,
            totalM2: 0,
            totalCO2: 0
          });
        }

        const customer = customerMap.get(email);
        customer.sales.push(sale);
        customer.totalSpent += (sale.total_value || 0);
        customer.totalM2 += (sale.total_m2 || 0);
        // Assuming ~22kg CO2 per m2 as per settings defaults
        customer.totalCO2 += (sale.total_m2 || 0) * 22;
      });

      // Fetch certificates to link to customers
      const { data: certs } = await supabase.from('certificates').select('*');

      if (certs) {
        // Future: Match certificates to customers if user_id is available
        // Currently aggregating only from sales data
      }

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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'projects', label: 'Projetos', icon: TreePine },
    { id: 'donations', label: 'Projetos Sociais', icon: Activity },
    { id: 'certificates', label: 'Certificados', icon: Award },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'images', label: 'Imagens', icon: ImageIcon },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

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
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id
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
            {activeTab === 'dashboard' && (
              <DashboardTab stats={stats} loading={loading} />
            )}

            {activeTab === 'projects' && (
              <ProjectsTab
                projects={projects}
                onDelete={deleteProject}
                onReload={loadProjects}
              />
            )}

            {activeTab === 'donations' && (
              <SocialProjectsTab
                donations={donations}
                onReload={loadDonations}
              />
            )}

            {activeTab === 'certificates' && (
              <CertificatesTab certificates={certificates} />
            )}

            {activeTab === 'customers' && (
              <CustomersTab
                customers={customers}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab />
            )}

            {activeTab === 'images' && (
              <ImagesTab
                siteImages={siteImages}
                certImages={certImages}
                onReload={loadImages}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab />
            )}
          </>
        )}
      </div>
    </div>
  );
}
