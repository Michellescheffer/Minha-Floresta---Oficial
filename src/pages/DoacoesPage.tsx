import { Heart, Target, Users, Zap, HandHeart, Building2, ArrowLeft, CheckCircle, MapPin, Calendar, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import { GlassCard } from '../components/GlassCard';
import { useApp } from '../contexts/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function DoacoesPage() {
  const { socialProjects, selectedDonationProject, setSelectedDonationProject, addDonation, setCurrentPage } = useApp();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  // Fluxo hospedado: sem seleção de método/experiência
  const [isGeneralDonation, setIsGeneralDonation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { createPaymentIntent, error: stripeError, isLoading } = useStripeCheckout();

  const predefinedAmounts = [50, 100, 250, 500, 1000];

  // Focus on selected project if coming from social projects page
  const targetProject = selectedDonationProject;
  
  useEffect(() => {
    if (targetProject) {
      // Scroll to donation form or highlight the project
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [targetProject]);

  const handleDonate = async () => {
    const amount = selectedAmount || Number(customAmount);
    
    if (amount <= 0) {
      alert('Por favor, selecione um valor válido para a doação.');
      return;
    }

    if ((!isAnonymous && !donorName.trim()) || !donorEmail.trim()) {
      alert('Por favor, preencha seu e-mail e, se não for anônimo, o nome.');
      return;
    }

    // Permitir doação geral quando não há projeto selecionado

    // Fluxo hospedado do Stripe: sem seletores de método locais

    try {
      setIsProcessing(true);
      setShowCheckout(true);

      const resp = await createPaymentIntent({
        type: 'donation',
        donation_amount: amount,
        donation_project_id: isGeneralDonation ? undefined : targetProject?.id,
        email: donorEmail,
        metadata: {
          donor_name: isAnonymous ? 'Anonymous' : donorName,
          is_anonymous: isAnonymous,
          use_hosted: true,
          project_title: !isGeneralDonation ? (targetProject?.title || undefined) : undefined,
          success_url: `${window.location.origin}/#checkout-success`,
          cancel_url: `${window.location.origin}/#doacoes`,
        },
      } as any);

      // Hosted Checkout: redirecionar se vier session_url
      if (resp.success && (resp as any).session_url) {
        window.location.href = (resp as any).session_url as string;
        return;
      }

      if (!resp.success || !resp.client_secret) {
        throw new Error(resp.error || 'Erro ao iniciar pagamento');
      }

      setClientSecret(resp.client_secret);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao iniciar pagamento');
      setShowCheckout(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeDonationProjects = socialProjects.filter(p => p.allowDonations && p.status === 'active');

  const getCurrentAmount = () => selectedAmount || Number(customAmount) || 0;

  // Detect general=1 in hash (e.g., #doacoes?general=1) and set general donation
  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.includes('general=1')) {
      setIsGeneralDonation(true);
    }
  }, []);

  // If no project is selected and not general donation, redirect to Projetos Sociais
  useEffect(() => {
    if (!targetProject && !isGeneralDonation) {
      setCurrentPage('projetos-sociais');
    }
  }, [targetProject, isGeneralDonation, setCurrentPage]);

  if (!targetProject && !isGeneralDonation) return null;

  // Show donation form (for selected project or general donation)
  return (
    <div className="min-h-screen pt-52 sm:pt-48 pb-16 sm:pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-pink-50/80"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
            <GlassCard className="p-6 bg-green-50/95 border-green-200">
              <div className="flex items-center space-x-3 text-green-800">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-medium">Doação Realizada com Sucesso!</h4>
                  <p className="text-sm text-green-700">Obrigado por contribuir para um futuro melhor.</p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <button
            onClick={() => {
              setSelectedDonationProject(null);
              setIsGeneralDonation(false);
            }}
            className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Escolher outro destino</span>
          </button>
          
          <div className="inline-flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full mb-4">
            <Heart className="w-4 h-4 text-green-600" />
            <span className="text-green-700">{isGeneralDonation ? 'Doação Geral' : `Doação para ${targetProject?.title}`}</span>
          </div>
          
          <p className="text-gray-600">Defina o valor, informe seu e-mail e finalize no Stripe.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Donation Form */}
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <HandHeart className="w-6 h-6 text-green-600" />
              <h3 className="text-gray-800">Doação</h3>
            </div>

            {!isGeneralDonation && targetProject && (
              <div className="mb-6">
                <div className="inline-flex items-center space-x-2 bg-green-600/10 px-4 py-2 rounded-full">
                  <Heart className="w-4 h-4 text-green-700" />
                  <span className="text-green-800 font-medium">Projeto selecionado:</span>
                  <span className="text-green-900 font-semibold">{targetProject.title}</span>
                </div>
              </div>
            )}
            
            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-4">Selecione o valor</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                      selectedAmount === amount
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-white/30 hover:border-green-300'
                    }`}
                  >
                    R$ {amount}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  placeholder="Outro valor"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* Payment Info - Hosted Only */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-3">Como você pagará</label>
              <div className="p-4 rounded-lg border-2 border-purple-500 bg-purple-50 text-purple-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5" />
                  <div className="text-sm">
                    <div className="font-medium">Página segura do Stripe</div>
                    <div className="text-purple-700/90">Você será redirecionado para concluir o pagamento com segurança.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Info */
            }
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="anonymous" className="text-gray-700 text-sm">
                  Fazer doação anônima
                </label>
              </div>
              
              {!isAnonymous && (
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  required
                />
              )}
              
              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="E-mail"
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                required
              />
            </div>

            {/* Payment Method - removido: fluxo hospedado */}

            {/* Donation Summary */}
            {getCurrentAmount() > 0 && (
              <div className="mb-6 p-4 bg-green-50/80 rounded-lg border border-green-200 text-sm">
                <div className="flex justify-between"><span className="text-green-700">Valor</span><span className="font-medium text-green-800">R$ {getCurrentAmount().toFixed(2)}</span></div>
                {!isGeneralDonation && (
                  <div className="flex justify-between"><span className="text-green-700">Projeto</span><span className="font-medium text-green-800">{targetProject?.title}</span></div>
                )}
              </div>
            )}

            <button
              onClick={handleDonate}
              disabled={isProcessing || isLoading || getCurrentAmount() <= 0}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing || isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Redirecionando...</span>
                </>
              ) : (
                <>
                  <HandHeart className="w-5 h-5" />
                  <span>Ir para Página Segura do Stripe</span>
                </>
              )}
            </button>

            <p className="text-gray-600 text-sm text-center mt-4">
              🔒 Você será redirecionado para a página segura do Stripe para concluir o pagamento
            </p>
          </GlassCard>

            {/* Stripe Elements (embutido) desativado: fluxo obrigatório via Checkout hospedado do Stripe */}

        {/* Fixed Project Info Card (Right Column) */}
        {!isGeneralDonation && targetProject && (
          <GlassCard className="p-6 lg:sticky lg:top-32 h-fit">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center text-white">
                <Heart className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg text-gray-800 mb-1">{targetProject.title}</h3>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{targetProject.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{targetProject.beneficiaries} beneficiários</span>
                  </div>
                </div>
              </div>
            </div>

            {targetProject.donationGoal && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>Arrecadado: R$ {(targetProject.donationsReceived || 0).toLocaleString()}</span>
                  <span>Meta: R$ {targetProject.donationGoal.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-400 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((targetProject.donationsReceived || 0) / targetProject.donationGoal) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-green-600 font-medium mt-1">
                  {Math.round(((targetProject.donationsReceived || 0) / targetProject.donationGoal) * 100)}% da meta
                </div>
              </div>
            )}

            {targetProject.description && (
              <p className="text-sm text-gray-600">
                {targetProject.description}
              </p>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  </div>
);
}