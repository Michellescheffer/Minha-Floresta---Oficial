import React, { useState } from 'react';
import { Users, TrendingUp, Calendar, MapPin, Heart, CheckCircle, Award, BookOpen, Globe, Leaf, HandHeart, Eye } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useApp } from '../contexts/AppContext';
import { useSocialProjects } from '../hooks/useSocialProjects';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { EnhancedLoading } from '../components/EnhancedLoading';
import { SocialProjectStats, useSocialProjectStats } from '../components/SocialProjectStats';

export function ProjetosSociaisPage() {
  const { setCurrentPage, setSelectedDonationProject } = useApp();
  const { socialProjects, isLoading, error } = useSocialProjects();
  const safeProjects = Array.isArray(socialProjects) ? socialProjects : [];
  const stats = useSocialProjectStats(safeProjects);
  // Notifications removidas: fluxo de doação acontece na DoacoesPage

  // Todos os useState hooks devem estar no topo, antes dos returns condicionais
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

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
    setCurrentPage('doacoes');
  };

  // Doações acontecem na DoacoesPage

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

        {/* General Donation CTA */}
        <div className="mb-10">
          <GlassCard className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white flex items-center justify-center">
                <HandHeart className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Faça uma Doação Geral</div>
                <div className="text-sm text-gray-600">Sua contribuição será direcionada para onde houver maior necessidade.</div>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedDonationProject(null);
                window.location.hash = 'doacoes?general=1';
              }}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-all"
            >
              Doar Agora
            </button>
          </GlassCard>
        </div>

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
                  setSelectedDonationProject(null);
                  window.location.hash = 'doacoes?general=1';
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-10 py-4 rounded-2xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl text-lg flex items-center justify-center space-x-2"
              >
                <HandHeart className="w-6 h-6" />
                <span>Fazer Doação Geral</span>
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