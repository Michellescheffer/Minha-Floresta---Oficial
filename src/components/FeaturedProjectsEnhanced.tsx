import { Shield, MapPin, Calendar, Users, TrendingUp, TreePine } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useApp } from '../contexts/AppContext';
import { useProjects } from '../hooks/useProjects';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EnhancedSection, AnimatedCardGrid, AnimatedCard } from './EnhancedSection';
import { FloatingElements } from './FloatingElements';
import { useParallax, useScrollReveal } from '../hooks/useParallax';
import { Shield } from 'lucide-react';

export function FeaturedProjectsEnhanced() {
  const { setCurrentPage, addToCart } = useApp();
  const { projects, getFeaturedProjects } = useProjects();
  const featuredProjects = getFeaturedProjects();
  const { getParallaxStyle } = useParallax({ speed: 0.1 });
  const titleReveal = useScrollReveal(0.1);
  const infoCardsReveal = useScrollReveal(0.2);
  const ctaReveal = useScrollReveal(0.3);

  const handleAddToCart = (project: typeof projects[0]) => {
    addToCart({
      projectId: project.id,
      projectName: project.name,
      m2Quantity: 100,
      price_per_m2: project.price,
      image: project.image
    });
  };

  return (
    <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
      {/* Enhanced Background with Parallax */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-gray-50/50" style={getParallaxStyle(0.05)}></div>
      
      {/* Floating Elements */}
      <FloatingElements variant="leaves" count={6} />
      
      {/* Background Particles */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-radial from-green-400/30 to-transparent rounded-full blur-3xl"
          style={getParallaxStyle(0.08)}
        />
        <div 
          className="absolute bottom-1/3 right-1/6 w-80 h-80 bg-gradient-radial from-emerald-400/30 to-transparent rounded-full blur-3xl"
          style={getParallaxStyle(0.12)}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Enhanced Title Section */}
        <div className={`text-center mb-12 sm:mb-16 ${titleReveal.className}`} ref={titleReveal.ref}>
          <div className="inline-flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full mb-6">
            <TreePine className="w-4 h-4 text-green-600" />
            <span className="text-green-700">Projetos em Destaque</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-medium text-gray-800 mb-6">
            Projetos de
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Reflorestamento Verificados
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Conheça nossos projetos de reflorestamento verificados e certificados internacionalmente. 
            Cada metro quadrado adquirido contribui diretamente para a preservação ambiental e 
            desenvolvimento sustentável das comunidades locais através de metodologias científicas comprovadas.
          </p>
        </div>

        {/* Projects Grid with Enhanced Animation */}
        <AnimatedCardGrid columns={3} gap="lg">
          {featuredProjects.map((project, index) => (
            <AnimatedCard 
              key={project.id} 
              delay={index * 200}
              hover3d={true}
              className="glass-card-interactive group"
            >
              <div className="relative mb-4 sm:mb-6 overflow-hidden rounded-xl sm:rounded-2xl">
                <ImageWithFallback
                  src={project.image}
                  alt={project.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex items-center space-x-1 sm:space-x-2">
                  <div className={`text-white px-2 sm:px-3 py-1 text-xs rounded-full font-medium animate-pulse-glow ${
                    project.type === 'blue-carbon' ? 'bg-blue-500' :
                    project.type === 'reforestation' ? 'bg-green-500' :
                    project.type === 'restoration' ? 'bg-amber-500' : 'bg-gray-500'
                  }`}>
                    {project.type === 'blue-carbon' ? 'Blue Carbon' :
                     project.type === 'reforestation' ? 'Reflorestamento' :
                     project.type === 'restoration' ? 'Restauração' : 
                     project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                  </div>
                  <div className="bg-blue-500 text-white px-2 sm:px-3 py-1 text-xs rounded-full flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span className="hidden sm:inline">Verificado</span>
                  </div>
                </div>
                
                {/* Overlay with gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <h3 className="text-gray-800 mb-3 group-hover:text-green-600 transition-colors duration-300">{project.name}</h3>
              
              <div className="flex items-center space-x-2 mb-3 text-gray-600 text-sm">
                <MapPin className="w-4 h-4 group-hover:text-green-500 transition-colors duration-300" />
                <span>{project.location}</span>
              </div>

              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{project.description}</p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center p-2 sm:p-3 bg-green-50/50 rounded-lg sm:rounded-xl group-hover:bg-green-100/70 transition-colors duration-300">
                  <div className="text-base sm:text-lg font-bold text-green-600">0.5</div>
                  <div className="text-xs text-gray-600">kg CO₂/m²/ano</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-blue-50/50 rounded-lg sm:rounded-xl group-hover:bg-blue-100/70 transition-colors duration-300">
                  <div className="text-base sm:text-lg font-bold text-blue-600">R$ {project.price.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">por m²</div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Disponível:</span>
                  <span className="font-medium">{project.available.toLocaleString()} m²</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Certificação:</span>
                  <span className="font-medium text-green-600 text-right flex-1 ml-2">Verificado</span>
                </div>

              </div>

              <div className="space-y-2 sm:space-y-3 relative z-10">
                <button
                  onClick={() => handleAddToCart(project)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm text-center relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <span className="relative z-10">Adicionar 100 m² ao Carrinho</span>
                </button>
                <button
                  onClick={() => setCurrentPage('loja')}
                  className="w-full border-2 border-green-500/30 text-green-600 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-green-50 hover:border-green-500 transition-all duration-300 font-medium transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                >
                  Ver Detalhes Completos
                </button>
              </div>
            </AnimatedCard>
          ))}
        </AnimatedCardGrid>

        {/* Enhanced Info Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 mt-12 ${infoCardsReveal.className}`} ref={infoCardsReveal.ref}>
          <AnimatedCard delay={0} className="text-center glass-ultra">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h4 className="text-gray-800 mb-2 font-semibold text-sm sm:text-base">Projetos de Longo Prazo</h4>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Investimentos sustentáveis com resultados que perduram por gerações inteiras.
            </p>
          </AnimatedCard>

          <AnimatedCard delay={100} className="text-center glass-ultra bg-gradient-to-br from-green-50/50 to-emerald-50/50">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h4 className="text-gray-800 mb-2 font-semibold text-sm sm:text-base">Impacto Social Real</h4>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Cada projeto beneficia diretamente comunidades locais com desenvolvimento sustentável.
            </p>
          </AnimatedCard>

          <AnimatedCard delay={200} className="text-center glass-ultra">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h4 className="text-gray-800 mb-2 font-semibold text-sm sm:text-base">Resultados Mensuráveis</h4>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Monitoramento científico e relatórios transparentes de todo o progresso.
            </p>
          </AnimatedCard>
        </div>

        {/* Enhanced Call to Action */}
        <div className={`text-center ${ctaReveal.className}`} ref={ctaReveal.ref}>
          <GlassCard className="p-6 sm:p-8 md:p-12 bg-gradient-to-r from-green-50/50 to-blue-50/50 glass-card-interactive relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 via-blue-400/5 to-emerald-400/5 animate-gradient"></div>
            
            <div className="relative z-10">
              <div className="hidden md:flex items-center justify-center space-x-4 mb-6">
                <div className="flex items-center space-x-2 group">
                  <Calendar className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-800 font-medium">Projetos de Longo Prazo</span>
                </div>
                <div className="flex items-center space-x-2 group">
                  <Users className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-800 font-medium">Impacto Social</span>
                </div>
                <div className="flex items-center space-x-2 group">
                  <TrendingUp className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-800 font-medium">Resultados Mensuráveis</span>
                </div>
              </div>
              
              <h3 className="text-gray-800 mb-3 sm:mb-4 px-4 sm:px-0 text-4xl md:text-5xl font-medium glass-text-contrast">
                Explore Todos os Nossos Projetos
              </h3>
              <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base px-4 sm:px-0">
                Descubra nossa completa seleção de projetos de reflorestamento e conservação. 
                Cada iniciativa é cuidadosamente selecionada e monitorada para garantir máximo 
                impacto ambiental e transparência total em todos os processos.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                <button
                  onClick={() => setCurrentPage('loja')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium text-sm sm:text-base transform hover:scale-105 active:scale-95 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <span className="relative z-10">Ver Todos os Projetos</span>
                </button>
                <button
                  onClick={() => setCurrentPage('sobre-projeto')}
                  className="border-2 border-green-500 text-green-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-green-50 transition-all duration-300 font-medium text-sm sm:text-base transform hover:scale-105 active:scale-95"
                >
                  Como Funcionam
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}