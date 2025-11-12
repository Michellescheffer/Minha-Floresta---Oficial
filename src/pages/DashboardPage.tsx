import { useEffect, useRef, useState } from 'react';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Award, 
  Settings, 
  Download,
  Eye,
  Calendar,
  DollarSign,
  TreePine,
  Target,
  Bell,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Loader2,
  FileText
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
 
import { useAuth } from '../contexts/AuthContext';
import { projectId } from '../utils/supabase/info';
import { useUserPanelData } from '../hooks/useUserPanelData';
import { toast } from 'sonner';

type DashboardTab = 'overview' | 'purchases' | 'donations' | 'certificates' | 'profile';

export function DashboardPage() {
  const { 
    user,
    updateProfile,
    isLoading
  } = useAuth();
  const { purchases, donations, certificates, loading, error, reload } = useUserPanelData();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [reconcileInfo, setReconcileInfo] = useState<{ amount?: number; currency?: string; pi?: string } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    cpf: user?.cpf || '',
    address: user?.address || '',
    preferences: {
      newsletter: user?.preferences?.newsletter || false,
      notifications: user?.preferences?.notifications || false
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen pt-56 sm:pt-52 pb-16 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 via-orange-50/80 to-yellow-50/80"></div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h1 className="text-gray-800 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você precisa estar logado para acessar o dashboard.</p>
        </div>

        {loading && (
          <div className="mb-6 text-gray-600">Carregando seus dados...</div>
        )}
        {error && (
          <div className="mb-6 text-red-600">{error}</div>
        )}
      </div>
    );
  }

  const handleProfileUpdate = async () => {
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        cpf: profileForm.cpf,
        address: profileForm.address,
        preferences: profileForm.preferences
      });
      setIsEditingProfile(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: User },
    { id: 'purchases', label: 'Compras', icon: ShoppingBag },
    { id: 'donations', label: 'Doações', icon: Heart },
    { id: 'certificates', label: 'Certificados', icon: Award },
    { id: 'profile', label: 'Perfil', icon: Settings }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Seleciona a aba inicial via hash query param: #dashboard?p=purchases
  useEffect(() => {
    const hash = window.location.hash || '';
    const [, query = ''] = hash.replace(/^#/, '').split('?');
    const params = new URLSearchParams(query);
    const p = params.get('p');
    const allowed: DashboardTab[] = ['overview','purchases','donations','certificates','profile'];
    if (p && (allowed as string[]).includes(p)) {
      setActiveTab(p as DashboardTab);
    }
  }, []);

  // Se houver session_id na URL, reconcilia imediatamente e recarrega dados (com guarda e limpeza do hash)
  const reconcileRanRef = useRef(false);
  useEffect(() => {
    if (reconcileRanRef.current) return;
    const hash = window.location.hash || '';
    const [path, query = ''] = hash.replace(/^#/, '').split('?');
    const params = new URLSearchParams(query);
    const sessionId = params.get('session_id');
    if (!sessionId) return;

    reconcileRanRef.current = true;
    setActiveTab('purchases');

    // Limpa o session_id do hash imediatamente para evitar reprocesso
    params.delete('session_id');
    const newHash = '#' + path + (params.toString() ? `?${params.toString()}` : '');
    history.replaceState(null, '', window.location.pathname + window.location.search + newHash);

    (async () => {
      try {
        const url = `https://${projectId}.supabase.co/functions/v1/stripe-reconcile?session_id=${encodeURIComponent(sessionId)}`;
        const res = await fetch(url, { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          setReconcileInfo({ amount: data.amount, currency: data.currency, pi: data.payment_intent_id });
          await reload();
        }
      } catch {}
    })();
  }, [reload]);

  return (
    <div className="min-h-screen pt-56 sm:pt-52 pb-16 sm:pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-blue-50/80"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-800 mb-2">
            Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">{user.name}!</span>
          </h1>
          <p className="text-gray-600">Gerencie suas compras, doações e certificados</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {reconcileInfo && (
            <div className="w-full">
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center justify-between">
                <span>
                  Pagamento confirmado
                  {reconcileInfo.amount
                    ? ` • ${new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: (reconcileInfo.currency || 'BRL').toUpperCase(),
                      }).format(reconcileInfo.amount)}`
                    : ''}
                </span>
                <button
                  onClick={() => setActiveTab('certificates')}
                  className="ml-3 px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Ver certificados
                </button>
              </div>
            </div>
          )}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-white/50 hover:bg-white/70 text-gray-700 border border-white/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <GlassCard key={i} className="p-6 animate-pulse">
                  <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </GlassCard>
              ))}
            </div>
          ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassCard className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Investido</p>
                    <p className="text-gray-800 font-semibold">{formatCurrency(purchases.reduce((s, p) => s + (p.total_amount || 0), 0))}</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <TreePine className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Área Adquirida</p>
                    <p className="text-gray-800 font-semibold">{(purchases.reduce((s, p) => s + (p.area_total || 0), 0)).toLocaleString()} m²</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">CO₂ Compensado</p>
                    <p className="text-gray-800 font-semibold">{(certificates.reduce((s, c) => s + Math.round((c.area_sqm || 0) * 22), 0)).toLocaleString()} kg</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Doado</p>
                    <p className="text-gray-800 font-semibold">{formatCurrency(donations.reduce((s, d) => s + (d.amount || 0), 0))}</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Recent Activity */}
            <GlassCard className="p-6">
              <h3 className="text-gray-800 mb-4">Atividade Recente</h3>
              <div className="space-y-4">
                {purchases.slice(0, 3).map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 bg-white/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <ShoppingBag className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">Compra</p>
                        <p className="text-gray-600 text-sm">{formatDate(purchase.created_at)}</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-semibold">{formatCurrency(purchase.total_amount || 0)}</span>
                  </div>
                ))}
                
                {donations.slice(0, 2).map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-4 bg-white/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Heart className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{donation.project_id ? `Doação para projeto ${donation.project_id}` : 'Doação Geral'}</p>
                        <p className="text-gray-600 text-sm">Doação - {formatDate(donation.created_at)}</p>
                      </div>
                    </div>
                    <span className="text-purple-600 font-semibold">{formatCurrency(donation.amount || 0)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        ))}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <GlassCard key={i} className="p-6 animate-pulse">
                  <div className="h-5 w-48 bg-gray-200 rounded mb-3" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((__, j) => (
                      <div key={j} className="h-4 w-24 bg-gray-200 rounded" />
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-800">Suas Compras</h2>
              <span className="text-gray-600">{purchases.length} compra(s)</span>
            </div>

            <div className="space-y-4">
              {purchases.map((purchase) => (
                <GlassCard key={purchase.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-gray-800 font-semibold">{(purchase.project_names || ['Compra']).join(', ')}</h3>
                      <p className="text-gray-600 text-sm">Compra realizada em {formatDate(purchase.created_at)}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">Concluída</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Área</p>
                      <p className="text-gray-800 font-medium">{purchase.area_total || 0} m²</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total</p>
                      <p className="text-gray-800 font-medium">{formatCurrency(purchase.total_amount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Certificados</p>
                      <p className="text-gray-800 font-medium">{certificates.filter(c => c.purchase_id === purchase.id).length}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-700 rounded-lg hover:bg-blue-500/30 transition-colors"
                      onClick={() => setActiveTab('certificates')}
                    >
                      <Eye className="w-4 h-4" />
                      Ver certificados
                    </button>
                  </div>
                </GlassCard>
              ))}

              {purchases.length === 0 && (
                <GlassCard className="p-8 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-gray-700 mb-2">Nenhuma compra ainda</h3>
                  <p className="text-gray-600 mb-4">Comece a compensar sua pegada de carbono!</p>
                  <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all" onClick={() => { window.location.hash = 'loja'; }}>
                    Explorar Projetos
                  </button>
                </GlassCard>
              )}
            </div>
          </div>
        ))}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <GlassCard key={i} className="p-6 animate-pulse">
                  <div className="h-5 w-56 bg-gray-200 rounded mb-4" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </GlassCard>
              ))}
            </div>
          ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-800">Suas Doações</h2>
              <span className="text-gray-600">{donations.length} doação(ões)</span>
            </div>

            <div className="space-y-4">
              {donations.map((donation) => (
                <GlassCard key={donation.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-gray-800 font-semibold">{donation.project_id ? `Projeto ${donation.project_id}` : 'Doação Geral'}</h3>
                      <p className="text-gray-600 text-sm">Doação realizada em {formatDate(donation.created_at)}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">Confirmada</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Heart className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Valor Doado</p>
                        <p className="text-gray-800 font-medium">{formatCurrency(donation.amount)}</p>
                      </div>
                    </div>
                    
                    
                  </div>
                </GlassCard>
              ))}

              {donations.length === 0 && (
                <GlassCard className="p-8 text-center">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-gray-700 mb-2">Nenhuma doação ainda</h3>
                  <p className="text-gray-600 mb-4">Apoie nossos projetos sociais!</p>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all" onClick={() => { window.location.hash = 'doacoes'; }}>
                    Ver Projetos Sociais
                  </button>
                </GlassCard>
              )}
            </div>
          </div>
        ))}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <GlassCard key={i} className="p-6 animate-pulse">
                  <div className="h-5 w-56 bg-gray-200 rounded mb-4" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((__, j) => (
                      <div key={j} className="h-4 w-24 bg-gray-200 rounded" />
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-800">Seus Certificados</h2>
              <span className="text-gray-600">{certificates.length} certificado(s)</span>
            </div>

            <div className="space-y-4">
              {certificates.map((certificate) => (
                <GlassCard key={certificate.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-gray-800 font-semibold">{certificate.project_name || 'Projeto'}</h3>
                      <p className="text-gray-600 text-sm">Código: {certificate.certificate_number}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      certificate.status === 'issued' 
                        ? 'bg-green-100 text-green-700'
                        : certificate.status === 'revoked'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {certificate.status === 'issued' ? 'Emitido' : 
                       certificate.status === 'revoked' ? 'Revogado' : 'Outro'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Área</p>
                      <p className="text-gray-800 font-medium">{certificate.area_sqm} m²</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">CO₂ Compensado</p>
                      <p className="text-gray-800 font-medium">{Math.round((certificate.area_sqm || 0) * 22)} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Emitido em</p>
                      <p className="text-gray-800 font-medium">{formatDate(certificate.issued_at)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Válido até</p>
                      <p className="text-gray-800 font-medium">—</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-700 rounded-lg hover:bg-green-500/30 transition-colors" onClick={() => {
                      window.location.hash = `verificar-certificado?numero=${certificate.certificate_number}`;
                    }}>
                      <Eye className="w-4 h-4" />
                      Visualizar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-700 rounded-lg hover:bg-blue-500/30 transition-colors" onClick={() => {
                      if (certificate.pdf_url) {
                        const link = document.createElement('a');
                        link.href = certificate.pdf_url as string;
                        link.download = `certificado-${certificate.certificate_number}.pdf`;
                        link.click();
                      } else {
                        window.location.hash = `verificar-certificado?numero=${certificate.certificate_number}`;
                      }
                    }}>
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                </GlassCard>
              ))}

              {certificates.length === 0 && (
                <GlassCard className="p-8 text-center">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-gray-700 mb-2">Nenhum certificado ainda</h3>
                  <p className="text-gray-600 mb-4">Realize uma compra para receber seu certificado!</p>
                  <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all">
                    Comprar Agora
                  </button>
                </GlassCard>
              )}
            </div>
          </div>
        ))}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-800">Perfil do Usuário</h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-700 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
              )}
            </div>

            <GlassCard className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-gray-800 mb-4">Informações Pessoais</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Nome Completo
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <p className="text-gray-800 p-3 bg-white/30 rounded-xl">{user.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email
                      </label>
                      <p className="text-gray-800 p-3 bg-gray-100/50 rounded-xl">{user.email}</p>
                      <p className="text-gray-500 text-xs mt-1">Email não pode ser alterado</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Telefone
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="(11) 99999-9999"
                        />
                      ) : (
                        <p className="text-gray-800 p-3 bg-white/30 rounded-xl">{user.phone || 'Não informado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        CPF
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileForm.cpf}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, cpf: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="000.000.000-00"
                        />
                      ) : (
                        <p className="text-gray-800 p-3 bg-white/30 rounded-xl">{user.cpf || 'Não informado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Endereço
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Rua, Número - Cidade, Estado"
                        />
                      ) : (
                        <p className="text-gray-800 p-3 bg-white/30 rounded-xl">{user.address || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Info & Preferences */}
                <div>
                  <h3 className="text-gray-800 mb-4">Informações da Conta</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Membro desde
                      </label>
                      <p className="text-gray-800 p-3 bg-white/30 rounded-xl">{user.created_at ? formatDate(user.created_at as unknown as string) : '-'}</p>
                    </div>

                  </div>

                  <h3 className="text-gray-800 mb-4">Preferências</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Notificações</span>
                      </div>
                      {isEditingProfile ? (
                        <input
                          type="checkbox"
                          checked={profileForm.preferences.notifications}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, notifications: e.target.checked }
                          }))}
                          className="w-4 h-4"
                        />
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.preferences?.notifications ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.preferences?.notifications ? 'Ativo' : 'Inativo'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Newsletter</span>
                      </div>
                      {isEditingProfile ? (
                        <input
                          type="checkbox"
                          checked={profileForm.preferences.newsletter}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, newsletter: e.target.checked }
                          }))}
                          className="w-4 h-4"
                        />
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.preferences?.newsletter ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.preferences?.newsletter ? 'Ativo' : 'Inativo'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditingProfile && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-white/20">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Salvar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileForm({
                        name: user?.name || '',
                        phone: user?.phone || '',
                        cpf: user?.cpf || '',
                        address: user?.address || '',
                        preferences: {
                          newsletter: user?.preferences?.newsletter || false,
                          notifications: user?.preferences?.notifications || false
                        }
                      });
                    }}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}