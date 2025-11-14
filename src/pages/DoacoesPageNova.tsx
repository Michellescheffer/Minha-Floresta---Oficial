import { Heart, ArrowLeft, CheckCircle, TrendingUp, Users, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import { GlassCard } from '../components/GlassCard';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';

interface DonationProject {
  id: string;
  title: string;
  description: string;
  long_description?: string;
  goal_amount: number;
  current_amount: number;
  image_url?: string;
  status: 'active' | 'paused' | 'completed';
  start_date: string;
  end_date?: string;
}

export function DoacoesPageNova() {
  const { setCurrentPage } = useApp();
  const [projects, setProjects] = useState<DonationProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<DonationProject | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Donation form
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorCpf, setDonorCpf] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { createPaymentIntent } = useStripeCheckout();
  const predefinedAmounts = [50, 100, 250, 500, 1000];

  // Load donation projects from Supabase
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('donation_projects')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading donation projects:', error);
      toast.error('Erro ao carregar projetos de doação');
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    const amount = selectedAmount || Number(customAmount);
    
    if (amount <= 0) {
      toast.error('Por favor, selecione um valor válido para a doação.');
      return;
    }

    if (!donorEmail.trim()) {
      toast.error('Por favor, informe seu e-mail.');
      return;
    }

    if (!isAnonymous && !donorName.trim()) {
      toast.error('Por favor, informe seu nome ou marque como doação anônima.');
      return;
    }

    if (!selectedProject) {
      toast.error('Por favor, selecione um projeto.');
      return;
    }

    try {
      setIsProcessing(true);

      const resp = await createPaymentIntent({
        type: 'donation',
        donation_amount: amount,
        donation_project_id: selectedProject.id,
        email: donorEmail,
        metadata: {
          donor_name: isAnonymous ? 'Anônimo' : donorName,
          donor_cpf: donorCpf,
          message: message,
          is_anonymous: isAnonymous,
          use_hosted: true,
          project_title: selectedProject.title,
          success_url: `${window.location.origin}/#checkout-return?p=donation&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/#doacoes`,
        },
      } as any);

      // Redirect to Stripe Checkout
      if (resp.success && (resp as any).session_url) {
        window.location.href = (resp as any).session_url as string;
        return;
      }

      throw new Error(resp.error || 'Erro ao iniciar pagamento');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao processar doação');
    } finally {
      setIsProcessing(false);
    }
  };

  const getProgress = (project: DonationProject) => {
    return Math.min((project.current_amount / project.goal_amount) * 100, 100);
  };

  // Show project selection
  if (!selectedProject) {
    return (
      <div className="min-h-screen pt-52 sm:pt-48 pb-16 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-teal-50/80"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full mb-4">
              <Heart className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">Projetos de Doação</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Faça a Diferença
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Escolha um projeto e contribua para um futuro mais sustentável
            </p>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : projects.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum projeto disponível no momento
              </h3>
              <p className="text-gray-600 mb-6">
                Novos projetos serão adicionados em breve
              </p>
              <button
                onClick={() => setCurrentPage('home')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Voltar para Home
              </button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <GlassCard key={project.id} className="p-6 hover:shadow-2xl transition-all cursor-pointer group">
                  {/* Project Image */}
                  {project.image_url && (
                    <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                  )}

                  {/* Project Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Arrecadado</span>
                      <span className="font-semibold text-green-600">
                        {getProgress(project).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${getProgress(project)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">
                        R$ {project.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-gray-900 font-semibold">
                        R$ {project.goal_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-green-50/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600">Meta</p>
                        <p className="text-sm font-semibold text-gray-900">
                          R$ {(project.goal_amount / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600">Impacto</p>
                        <p className="text-sm font-semibold text-gray-900">Alto</p>
                      </div>
                    </div>
                  </div>

                  {/* Donate Button */}
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-105"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">Doar Agora</span>
                  </button>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show donation form for selected project
  return (
    <div className="min-h-screen pt-52 sm:pt-48 pb-16 sm:pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-pink-50/80"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <button
            onClick={() => setSelectedProject(null)}
            className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Escolher outro projeto</span>
          </button>
          
          <div className="inline-flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full mb-4">
            <Heart className="w-4 h-4 text-green-600" />
            <span className="text-green-700">Doação para {selectedProject.title}</span>
          </div>
          
          <p className="text-gray-600">Preencha os dados e finalize sua doação</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Donation Form */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Dados da Doação</h3>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-3">Valor da Doação</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedAmount === amount
                        ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    R$ {amount}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  placeholder="Outro valor"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>
            </div>

            {/* Donor Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  disabled={isAnonymous}
                  placeholder="Seu nome"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">E-mail</label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">CPF (opcional)</label>
                <input
                  type="text"
                  value={donorCpf}
                  onChange={(e) => setDonorCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Mensagem (opcional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Deixe uma mensagem de apoio..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none"
                />
              </div>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-gray-700">Fazer doação anônima</span>
              </label>
            </div>

            {/* Donate Button */}
            <button
              onClick={handleDonate}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  <span>Doar R$ {(selectedAmount || Number(customAmount) || 0).toFixed(2)}</span>
                </>
              )}
            </button>
          </GlassCard>

          {/* Project Summary */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo do Projeto</h3>

            {selectedProject.image_url && (
              <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                <img
                  src={selectedProject.image_url}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h4 className="text-lg font-bold text-gray-900 mb-3">
              {selectedProject.title}
            </h4>
            <p className="text-gray-600 mb-6">
              {selectedProject.long_description || selectedProject.description}
            </p>

            {/* Progress */}
            <div className="mb-6 p-4 bg-green-50/50 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progresso</span>
                <span className="font-semibold text-green-600">
                  {getProgress(selectedProject).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
                  style={{ width: `${getProgress(selectedProject)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  R$ {selectedProject.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-gray-900 font-semibold">
                  Meta: R$ {selectedProject.goal_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Impact */}
            <div className="p-4 bg-blue-50/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">Impacto da sua doação</h5>
                  <p className="text-sm text-gray-600">
                    Sua contribuição ajudará diretamente na execução deste projeto e na construção de um futuro mais sustentável.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
