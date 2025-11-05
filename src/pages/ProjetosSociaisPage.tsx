import React, { useState } from 'react';
import { Users, Target, TrendingUp, Calendar, MapPin, Heart, Coins, CheckCircle, Shield, Award, BookOpen, Globe, Leaf, HandHeart, DollarSign, Eye, CreditCard, Smartphone, Building2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useApp } from '../contexts/AppContext';
import { useSocialProjects } from '../hooks/useSocialProjects';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { EnhancedLoading } from '../components/EnhancedLoading';
import { useDonationNotification, useSuccessNotification, useErrorNotification } from '../components/NotificationSystem';
import { SocialProjectStats, useSocialProjectStats, CompactSocialStats } from '../components/SocialProjectStats';

export function ProjetosSociaisPage() {
  const { setCurrentPage, setSelectedDonationProject, addDonation } = useApp();
  const { socialProjects, isLoading, error } = useSocialProjects();
  const safeProjects = Array.isArray(socialProjects) ? socialProjects : [];
  const stats = useSocialProjectStats(safeProjects);
  const showDonationNotification = useDonationNotification();
  const showSuccessNotification = useSuccessNotification();
  const showErrorNotification = useErrorNotification();

  // Todos os useState hooks devem estar no topo, antes dos returns condicionais
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [selectedDonationAmount, setSelectedDonationAmount] = useState<number | null>(null);
  const [customDonationAmount, setCustomDonationAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donationMessage, setDonationMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'bank_transfer'>('credit_card');
  const [isProcessingDonation, setIsProcessingDonation] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <EnhancedLoading 
        message="Carregando projetos sociais..." 
        type="social"
        size="lg"
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-52 sm:pt-48 pb-16 sm:pb-20 flex items-center justify-center">
        <div className="relative z-10 max-w-md mx-auto px-6">
          <GlassCard className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl text-gray-800 mb-4">Erro ao Carregar</h3>
            <p className="text-red-600 mb-6">
              Não foi possível carregar os projetos sociais: {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium"
            >
              Tentar Novamente
            </button>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Usar estatísticas calculadas pelo hook
  const { 
    activeProjects, 
    totalBeneficiaries, 
    totalBudget, 
    totalSpent, 
    totalDonations, 
    executionRate 
  } = stats;

  const categoryImages = {
    community: 'https://images.unsplash.com/photo-1637552481611-1f36222fb188?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29wZXJhdGl2ZSUyMHJlZm9yZXN0YXRpb24lMjBwcm9qZWN0fGVufDF8fHx8MTc1NjIxODk5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    education: 'https://images.unsplash.com/photo-1710093072228-8c3129f27357?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBlbnZpcm9ubWVudGFsJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc1NjIxODk5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    research: 'https://images.unsplash.com/photo-1597737413237-57dffb6f6b6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBpbXBhY3QlMjBzdXN0YWluYWJpbGl0eXxlbnwxfHx8fDE3NTYyMTkwMDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    partnership: 'https://images.unsplash.com/photo-1597737413237-57dffb6f6b6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBpbXBhY3QlMjBzdXN0YWluYWJpbGl0eXxlbnwxfHx8fDE3NTYyMTkwMDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'community': return <Users className="w-5 h-5" />;
      case 'education': return <BookOpen className="w-5 h-5" />;
      case 'research': return <TrendingUp className="w-5 h-5" />;
      case 'partnership': return <Heart className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      community: 'Comunidade',
      education: 'Educação',
      research: 'Pesquisa',
      partnership: 'Parceria'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      community: 'green',
      education: 'blue',
      research: 'purple',
      partnership: 'emerald'
    };
    return colors[category as keyof typeof colors] || 'green';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: { bg: 'bg-green-500', text: 'text-white', label: 'Ativo' },
      completed: { bg: 'bg-blue-500', text: 'text-white', label: 'Concluído' },
      paused: { bg: 'bg-yellow-500', text: 'text-white', label: 'Pausado' },
      cancelled: { bg: 'bg-red-500', text: 'text-white', label: 'Cancelado' }
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const handleDonateToProject = (project: any) => {
    setSelectedDonationProject(project);
    setShowDonationForm(true);
    // Scroll to donation section
    setTimeout(() => {
      const donationSection = document.getElementById('donation-section');
      donationSection?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const predefinedDonationAmounts = [50, 100, 250, 500, 1000];

  const getCurrentDonationAmount = () => selectedDonationAmount || Number(customDonationAmount) || 0;

  const handleGeneralDonation = async () => {
    const amount = getCurrentDonationAmount();
    
    if (amount <= 0) {
      showErrorNotification(
        'Valor Inválido', 
        'Por favor, selecione um valor válido para a doação.'
      );
      return;
    }

    if (!donorName.trim() || !donorEmail.trim()) {
      showErrorNotification(
        'Dados Incompletos', 
        'Por favor, preencha seu nome e e-mail para continuar.'
      );
      return;
    }

    setIsProcessingDonation(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const donation = {
        donorName: isAnonymous ? 'Doador Anônimo' : donorName,
        donorEmail,
        donorPhone,
        amount,
        paymentMethod,
        paymentStatus: 'confirmed' as const,
        donationDate: new Date().toISOString().split('T')[0],
        isAnonymous,
        message: donationMessage.trim() || undefined,
        receiptId: `RECEIPT-${Date.now()}`
      };

      addDonation(donation);
      
      // Show success notification
      showDonationNotification(
        'Doação Realizada com Sucesso!',
        `Sua doação de R$ ${amount.toFixed(2)} foi processada. Obrigado por contribuir para um futuro mais sustentável!`,
        amount
      );
      
      // Reset form
      setSelectedDonationAmount(null);
      setCustomDonationAmount('');
      setDonorName('');
      setDonorEmail('');
      setDonorPhone('');
      setDonationMessage('');
      setIsAnonymous(false);
      setShowDonationForm(false);
      setDonationSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setDonationSuccess(false);
      }, 5000);
      
    } catch (error) {
      showErrorNotification(
        'Erro no Processamento',
        'Houve um problema ao processar sua doação. Tente novamente em alguns instantes.'
      );
    } finally {
      setIsProcessingDonation(false);
    }
  };

  // Verificar se socialProjects está carregado e é um array válido

  return (
    <div className="min-h-screen pt-52 sm:pt-48 pb-16 sm:pb-20">
      {/* Background with social impact image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1597737413237-57dffb6f6b6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBpbXBhY3QlMjBzdXN0YWluYWJpbGl0eXxlbnwxfHx8fDE3NTYyMTkwMDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Social impact"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/95 to-white/90"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full mb-8">
            <Heart className="w-4 h-4 text-green-600" />
            <span className="text-green-700">Projetos Sociais</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-medium text-gray-800 mb-8">
            Impacto
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              Social Real
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nossos projetos sociais vão além da conservação ambiental, focando no desenvolvimento 
            sustentável das comunidades locais através de educação, capacitação e parcerias estratégicas.
          </p>
        </div>

        {/* Enhanced Statistics */}
        <SocialProjectStats stats={stats} animated={true} />

        {/* Projects Grid */}
        {safeProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            {safeProjects.map((project) => {
              if (!project) return null;
              
              const statusInfo = getStatusBadge(project?.status || 'active');
              const budget = project?.budget || 1;
              const spent = project?.spent || 0;
              const progressPercentage = Math.min((spent / budget) * 100, 100);
              const donationProgress = project?.donationGoal ? Math.min(((project?.donationsReceived || 0) / project.donationGoal) * 100, 100) : 0;
              const categoryImage = categoryImages[project?.category as keyof typeof categoryImages];
              const categoryColor = getCategoryColor(project?.category || 'community');
              
              return (
                <GlassCard key={project.id} className="group hover:scale-105 transition-all duration-300">
                  {/* Project Header Image */}
                  <div className="relative mb-6 overflow-hidden rounded-t-2xl">
                    <ImageWithFallback
                      src={categoryImage}
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <div className={`bg-${categoryColor}-500/90 backdrop-blur-sm text-white px-3 py-1 text-sm rounded-full font-medium flex items-center space-x-1`}>
                        {getCategoryIcon(project.category)}
                        <span>{getCategoryLabel(project.category)}</span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className={`${statusInfo.bg} ${statusInfo.text} px-3 py-1 text-sm font-medium rounded-full`}>
                        {statusInfo.label}
                      </div>
                    </div>
                    {project.status === 'active' && project.allowDonations && (
                      <div className="absolute bottom-4 right-4">
                        <div className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full">
                          <HandHeart className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Project Title */}
                    <h3 className="text-2xl text-gray-800 mb-3 group-hover:text-green-600 transition-colors duration-300">
                      {project.title}
                    </h3>

                    {/* Location and Coordinator */}
                    <div className="flex items-center justify-between mb-4 text-gray-600 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{project?.coordinator?.split(' ')[0] || 'Coordenador'}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {project?.description || 'Descrição não disponível'}
                    </p>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-green-50/80 rounded-xl">
                        <div className="text-xl font-bold text-green-600">{project.beneficiaries}</div>
                        <div className="text-xs text-gray-600">Beneficiários</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50/80 rounded-xl">
                        <div className="text-xl font-bold text-blue-600">{project.partners.length}</div>
                        <div className="text-xs text-gray-600">Parceiros</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50/80 rounded-xl">
                        <div className="text-xl font-bold text-purple-600">R$ {(project.budget / 1000).toFixed(0)}k</div>
                        <div className="text-xs text-gray-600">Orçamento</div>
                      </div>
                    </div>

                    {/* Donation Progress (if applicable) */}
                    {project.allowDonations && project.donationGoal && (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Meta de Doações</span>
                          <span className="text-sm font-medium text-gray-800">
                            R$ {(project.donationsReceived || 0).toLocaleString()} / R$ {project.donationGoal.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${donationProgress}%` }}
                          ></div>
                        </div>
                        <div className="text-right text-xs text-gray-600">
                          {donationProgress.toFixed(0)}% da meta alcançada
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Progresso Financeiro</span>
                        <span className="text-sm font-medium text-gray-800">{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Key Results */}
                    <div className="space-y-2 mb-6">
                      {project.results.slice(0, 2).map((result, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{result}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 mb-6 relative z-10">
                      {project.allowDonations && project.status === 'active' && (
                        <button
                          onClick={() => handleDonateToProject(project)}
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                        >
                          <HandHeart className="w-5 h-5" />
                          <span>Doar para este projeto</span>
                        </button>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                          className="flex items-center justify-center space-x-2 px-4 py-2 border border-green-500/30 text-green-600 rounded-lg hover:bg-green-500/10 hover:border-green-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">
                            {selectedProject === project.id ? 'Ocultar' : 'Detalhes'}
                          </span>
                        </button>
                        
                        <button
                          onClick={() => window.open(`mailto:${project.contactEmail}`, '_blank')}
                          className="flex items-center justify-center space-x-2 px-4 py-2 border border-blue-500/30 text-blue-600 rounded-lg hover:bg-blue-500/10 hover:border-blue-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">Contato</span>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedProject === project.id && (
                      <div className="mt-6 p-4 bg-green-50/50 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-medium text-gray-800 mb-3">Objetivos do Projeto:</h4>
                        <ul className="space-y-2 mb-4">
                          {project.objectives.map((objective, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {project.results.length > 2 && (
                          <>
                            <h4 className="font-medium text-gray-800 mb-3">Resultados Adicionais:</h4>
                            <ul className="space-y-2">
                              {project.results.slice(2).map((result, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{result}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.startDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4" />
                        <span>{project.objectives.length} objetivos</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl text-gray-800 mb-2">Nenhum projeto social cadastrado</h3>
            <p className="text-gray-600 mb-8">Adicione projetos sociais através do CMS para visualizá-los aqui.</p>
            <button 
              onClick={() => setCurrentPage('cms')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
            >
              Acessar CMS
            </button>
          </div>
        )}

        {/* Donation Section */}
        <div id="donation-section" className="mb-20">
          {/* Success Message */}
          {donationSuccess && (
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

          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-pink-500/10 px-4 py-2 rounded-full mb-8">
              <Heart className="w-4 h-4 text-pink-600" />
              <span className="text-pink-700">Doações</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-medium text-gray-800 mb-8">
              Apoie a
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                Transformação Social
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Sua doação faz a diferença. Apoie nossos projetos sociais e contribua para 
              o desenvolvimento sustentável das comunidades e preservação ambiental.
            </p>
          </div>

          {!showDonationForm ? (
            /* Donation Options */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project-Specific Donations */}
              <GlassCard className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Target className="w-6 h-6 text-green-600" />
                  <h3 className="text-gray-800">Doação para Projeto Específico</h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Escolha um projeto específico para sua doação e acompanhe diretamente 
                  o impacto da sua contribuição na comunidade beneficiada.
                </p>

                <div className="space-y-4 mb-6">
                  {safeProjects.filter(p => p?.allowDonations && p?.status === 'active').map((project) => (
                    <div key={project.id} className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer" onClick={() => handleDonateToProject(project)}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-800">{project.title}</h4>
                        <div className="text-sm text-green-600 font-medium">
                          {project.donationGoal ? `${Math.round(((project.donationsReceived || 0) / project.donationGoal) * 100)}%` : '∞'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                      {project.donationGoal && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full"
                            style={{ width: `${Math.min(((project.donationsReceived || 0) / project.donationGoal) * 100, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {safeProjects.filter(p => p?.allowDonations && p?.status === 'active').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <HandHeart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum projeto ativo aceitando doações no momento.</p>
                  </div>
                )}
              </GlassCard>

              {/* General Donation */}
              <GlassCard className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <HandHeart className="w-6 h-6 text-pink-600" />
                  <h3 className="text-gray-800">Doação Geral</h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Faça uma doação geral que será direcionada para onde há maior necessidade, 
                  maximizando o impacto da sua contribuição.
                </p>

                <div className="space-y-6">
                  {/* Impact Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50/80 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{totalBeneficiaries}</div>
                      <div className="text-sm text-gray-600">Beneficiários</div>
                    </div>
                    <div className="text-center p-4 bg-pink-50/80 rounded-lg">
                      <div className="text-2xl font-bold text-pink-600">R$ {(totalDonations / 1000).toFixed(0)}k</div>
                      <div className="text-sm text-gray-600">Arrecadado</div>
                    </div>
                  </div>

                  {/* Suggested Impact */}
                  <div className="p-4 bg-blue-50/80 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3">Com sua doação, podemos:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>R$ 50 - Apoiar 1 família por 1 mês</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>R$ 100 - Capacitar 1 pessoa</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>R$ 250 - Implementar 1 horta comunitária</span>
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => setShowDonationForm(true)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                  >
                    <HandHeart className="w-5 h-5" />
                    <span>Fazer Doação Geral</span>
                  </button>
                </div>
              </GlassCard>
            </div>
          ) : (
            /* Donation Form */
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <button
                  onClick={() => setShowDonationForm(false)}
                  className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-700 mb-4 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Voltar às opções de doação</span>
                </button>
                <h3 className="text-3xl text-gray-800 mb-2">Formulário de Doação</h3>
                <p className="text-gray-600">Complete os dados abaixo para finalizar sua doação</p>
              </div>

              <GlassCard className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Amount Selection */}
                  <div>
                    <label className="block text-gray-700 mb-4">Selecione o valor</label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {predefinedDonationAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => {
                            setSelectedDonationAmount(amount);
                            setCustomDonationAmount('');
                          }}
                          className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                            selectedDonationAmount === amount
                              ? 'border-pink-500 bg-pink-50 text-pink-700'
                              : 'border-white/30 hover:border-pink-300'
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
                        value={customDonationAmount}
                        onChange={(e) => {
                          setCustomDonationAmount(e.target.value);
                          setSelectedDonationAmount(null);
                        }}
                        placeholder="Outro valor"
                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="mt-6">
                      <label className="block text-gray-700 mb-3">Forma de pagamento</label>
                      <div className="space-y-2">
                        {[
                          { value: 'credit_card', icon: CreditCard, label: 'Cartão de Crédito' },
                          { value: 'pix', icon: Smartphone, label: 'PIX' },
                          { value: 'bank_transfer', icon: Building2, label: 'Transferência Bancária' }
                        ].map(({ value, icon: Icon, label }) => (
                          <button
                            key={value}
                            onClick={() => setPaymentMethod(value as any)}
                            className={`w-full p-3 rounded-lg border-2 transition-all duration-300 flex items-center space-x-3 ${
                              paymentMethod === value
                                ? 'border-pink-500 bg-pink-50 text-pink-700'
                                : 'border-white/30 hover:border-pink-300'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="checkbox"
                        id="anonymous-donation"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="anonymous-donation" className="text-gray-700 text-sm">
                        Fazer doação anônima
                      </label>
                    </div>
                    
                    {!isAnonymous && (
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Nome completo"
                        className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                        required
                      />
                    )}
                    
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="E-mail"
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                      required
                    />
                    
                    <input
                      type="tel"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder="Telefone (opcional)"
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                    />
                    
                    <textarea
                      value={donationMessage}
                      onChange={(e) => setDonationMessage(e.target.value)}
                      placeholder="Mensagem de apoio (opcional)"
                      rows={3}
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 resize-none"
                    />

                    {/* Donation Summary */}
                    {getCurrentDonationAmount() > 0 && (
                      <div className="p-4 bg-pink-50/80 rounded-lg border border-pink-200">
                        <h4 className="font-medium text-pink-800 mb-2">Resumo da Doação</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-pink-700">Valor:</span>
                            <span className="font-medium text-pink-800">R$ {getCurrentDonationAmount().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-pink-700">Tipo:</span>
                            <span className="font-medium text-pink-800">Doação Geral</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-pink-700">Pagamento:</span>
                            <span className="font-medium text-pink-800">
                              {paymentMethod === 'credit_card' && 'Cartão de Crédito'}
                              {paymentMethod === 'pix' && 'PIX'}
                              {paymentMethod === 'bank_transfer' && 'Transferência'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleGeneralDonation}
                      disabled={isProcessingDonation || getCurrentDonationAmount() <= 0}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingDonation ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <HandHeart className="w-5 h-5" />
                          <span>Doar R$ {getCurrentDonationAmount().toFixed(2)}</span>
                        </>
                      )}
                    </button>

                    <p className="text-gray-600 text-sm text-center">
                      🔒 Pagamento seguro e certificado
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <GlassCard className="p-12 bg-gradient-to-r from-green-50/80 to-blue-50/80">
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{activeProjects}+</div>
                <div className="text-sm text-gray-600">Projetos Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{(totalBeneficiaries / 1000).toFixed(1)}k</div>
                <div className="text-sm text-gray-600">Beneficiários</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">R$ {(totalDonations / 1000).toFixed(0)}k</div>
                <div className="text-sm text-gray-600">Em Doações</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{Math.round(executionRate)}%</div>
                <div className="text-sm text-gray-600">Taxa de Execução</div>
              </div>
            </div>
            
            <h2 className="text-4xl text-gray-800 mb-4">
              Faça Parte da 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                Mudança
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Apoie nossos projetos sociais ou proponha uma nova iniciativa. 
              Juntos, criamos impacto social e ambiental duradouro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  setShowDonationForm(true);
                  setTimeout(() => {
                    const donationSection = document.getElementById('donation-section');
                    donationSection?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-10 py-4 rounded-2xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl text-lg flex items-center justify-center space-x-2"
              >
                <HandHeart className="w-6 h-6" />
                <span>Fazer Doação</span>
              </button>
              <button 
                onClick={() => setCurrentPage('contato')}
                className="border-2 border-green-500 text-green-600 px-10 py-4 rounded-2xl hover:bg-green-50 transition-all duration-300 text-lg"
              >
                Propor Projeto
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}