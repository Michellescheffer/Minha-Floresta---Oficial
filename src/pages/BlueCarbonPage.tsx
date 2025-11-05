import { Waves, Anchor, Fish, Shield, ArrowRight, Leaf, ChevronRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useApp } from '../contexts/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import blueLogoColor from 'figma:asset/30d26e154353e457d251a8befbd793cb99e8f4e3.png';
import blueLogoDark from 'figma:asset/31f31cb383ec163649d385542bdead128024c76d.png';

export function BlueCarbonPage() {
  const { setCurrentPage } = useApp();

  const handleCTAClick = () => {
    // Store Blue Carbon filter preference
    sessionStorage.setItem('blueCarbon-filter', 'true');
    setCurrentPage('loja');
  };

  const benefits = [
    {
      icon: <Waves className="w-8 h-8 text-blue-600" />,
      title: "Captura Superior de CO₂",
      description: "Manguezais capturam até 10x mais carbono por hectare que florestas terrestres, armazenando CO₂ no solo por milênios."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Proteção Costeira",
      description: "Barreira natural contra tsunamis, furacões e elevação do nível do mar, protegendo comunidades costeiras."
    },
    {
      icon: <Fish className="w-8 h-8 text-blue-600" />,
      title: "Berçário Marinho",
      description: "Habitat essencial para 75% das espécies comerciais de peixes, sustentando a pesca artesanal local."
    },
    {
      icon: <Anchor className="w-8 h-8 text-blue-600" />,
      title: "Sustento Comunitário",
      description: "Fonte de renda para pescadores através da aquicultura sustentável de caranguejos, ostras e camarões."
    }
  ];

  const stats = [
    { number: "4x", label: "Mais carbono por m² que florestas" },
    { number: "75%", label: "Das espécies marinhas dependem de mangues" },
    { number: "70%", label: "Dos manguezais globais foram perdidos" },
    { number: "1000+", label: "Anos de armazenamento de carbono" }
  ];

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-cyan-50/80 to-teal-50/80"></div>
      
      {/* Hero Section */}
      <section className="relative z-10 pt-52 sm:pt-48 pb-20 sm:pb-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <div className="relative group">
              <img 
                src={blueLogoColor} 
                alt="Minha Floresta Blue Carbon"
                className="h-32 sm:h-40 w-auto transition-all duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 px-4 py-2 rounded-full mb-6">
              <Waves className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700">Blue Carbon</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-medium text-gray-800 mb-6">
              O Poder dos
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Manguezais
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Descubra como os ecossistemas costeiros de manguezais representam a fronteira mais eficiente 
              da captura de carbono, oferecendo proteção climática e sustento para comunidades tradicionais.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCTAClick}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-full hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <Waves className="w-5 h-5" />
                <span>Explore Projetos Blue Carbon</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <GlassCard key={index} className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* What is Blue Carbon */}
      <section className="relative z-10 py-20 sm:py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-cyan-500/10 px-4 py-2 rounded-full mb-6">
                <Leaf className="w-4 h-4 text-cyan-600" />
                <span className="text-cyan-700">O que é Blue Carbon</span>
              </div>
              
              <h2 className="text-4xl font-medium text-gray-800 mb-6">
                Carbono Azul: A 
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  Revolução Costeira
                </span>
              </h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong>Blue Carbon</strong> refere-se ao carbono capturado e armazenado por ecossistemas 
                  marinhos e costeiros, principalmente manguezais, pradarias marinhas e marismas.
                </p>
                <p>
                  Estes ecossistemas são extraordinariamente eficientes na captura de CO₂ da atmosfera, 
                  armazenando-o no solo subaquático por centenas ou até milhares de anos.
                </p>
                <p>
                  <strong>Os manguezais</strong> são especialmente poderosos: apesar de ocuparem menos de 1% 
                  da superfície terrestre, são responsáveis por até 15% de todo o carbono armazenado 
                  em sedimentos costeiros globalmente.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <GlassCard className="overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1643276714790-9e30f89a5a9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5ncm92ZSUyMHJvb3RzJTIwdW5kZXJ3YXRlciUyMGNhcmJvbnxlbnwxfHx8fDE3NTg5MTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Raízes de mangue subaquáticas"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">Raízes de mangue formam complexos sistemas subaquáticos</p>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="relative z-10 py-20 sm:py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium text-gray-800 mb-6">
              Por que Investir em
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Blue Carbon?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Os manguezais oferecem múltiplos benefícios ambientais, sociais e econômicos únicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <GlassCard key={index} className="p-8 group hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    {benefit.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Science Section */}
      <section className="relative z-10 py-20 sm:py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <GlassCard className="overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1729268696845-646e3a37a771?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2FzdGFsJTIwd2V0bGFuZHMlMjBibHVlJTIwY2FyYm9uJTIwZWNvc3lzdGVtfGVufDF8fHx8MTc1ODkxNjE2NHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Ecossistema costeiro de wetlands"
                  className="w-full h-80 object-cover"
                />
              </GlassCard>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center space-x-2 bg-teal-500/10 px-4 py-2 rounded-full mb-6">
                <Shield className="w-4 h-4 text-teal-600" />
                <span className="text-teal-700">Ciência Comprovada</span>
              </div>
              
              <h2 className="text-4xl font-medium text-gray-800 mb-6">
                Metodologias
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
                  Científicas Rigorosas
                </span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Padrões Internacionais</h4>
                    <p className="text-gray-600">Todos os projetos seguem metodologias VM0033 (Verra) e Blue Carbon Standard para garantir medição precisa.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Monitoramento Contínuo</h4>
                    <p className="text-gray-600">Sensores subaquáticos e análises de sedimento garantem monitoramento em tempo real da captura de carbono.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Verificação Independente</h4>
                    <p className="text-gray-600">Auditoria por terceiros especializados em ecossistemas marinhos para máxima transparência.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 sm:py-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <GlassCard className="p-12">
            <div className="flex justify-center mb-8">
              <img 
                src={blueLogoDark} 
                alt="Minha Floresta Blue Carbon"
                className="h-20 w-auto opacity-80"
              />
            </div>
            
            <h2 className="text-4xl font-medium text-gray-800 mb-6">
              Comece sua Jornada
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Blue Carbon Hoje
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Invista em manguezais e faça parte da solução mais eficiente para mudanças climáticas. 
              Cada metro quadrado conta para um futuro sustentável.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCTAClick}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-10 py-4 rounded-full hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <Waves className="w-5 h-5" />
                <span>Ver Projetos de Manguezais</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="text-sm text-gray-600">
                <div className="font-semibold text-blue-600">4.2 kg CO₂/m²</div>
                <div>Captura anual média</div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-semibold text-blue-600">1000+ anos</div>
                <div>Armazenamento garantido</div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-semibold text-blue-600">100% certificado</div>
                <div>Padrões internacionais</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}