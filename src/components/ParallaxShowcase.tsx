import { Trees, Leaf, Globe, Heart, TrendingUp, Shield } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useParallax, useFloatingAnimation, useScrollReveal } from '../hooks/useParallax';
import { FloatingElements } from './FloatingElements';

export function ParallaxShowcase() {
  const { getParallaxStyle, getRotationStyle, getScaleStyle, getOpacityStyle } = useParallax({ speed: 0.5 });
  const backgroundParallax = useParallax({ speed: 0.3 });
  const midgroundParallax = useParallax({ speed: 0.6 });
  const foregroundParallax = useParallax({ speed: 0.8 });
  
  const { floatingStyle: float1 } = useFloatingAnimation(6000, 20);
  const { floatingStyle: float2 } = useFloatingAnimation(8000, 25);
  const { floatingStyle: float3 } = useFloatingAnimation(10000, 30);
  
  const titleReveal = useScrollReveal(0.1);
  const statsReveal = useScrollReveal(0.2);
  const cardsReveal = useScrollReveal(0.3);

  const impactStats = [
    { icon: Trees, label: 'Árvores Plantadas', value: '2,847,391', color: 'text-green-600' },
    { icon: Globe, label: 'CO₂ Capturado', value: '1,423 ton', color: 'text-blue-600' },
    { icon: Heart, label: 'Famílias Beneficiadas', value: '8,732', color: 'text-red-500' },
    { icon: TrendingUp, label: 'Projetos Ativos', value: '47', color: 'text-purple-600' }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Certificação Internacional',
      description: 'Todos os projetos seguem padrões MRV internacionais',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Globe,
      title: 'Impacto Global',
      description: 'Contribua para a meta global de neutralidade de carbono',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Heart,
      title: 'Impacto Social',
      description: 'Gere desenvolvimento sustentável para comunidades locais',
      color: 'from-red-500 to-pink-500'
    }
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      {/* Layered Parallax Backgrounds */}
      <div className="absolute inset-0">
        {/* Far Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={backgroundParallax.getParallaxStyle(0.1)}
        >
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-radial from-green-400/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-radial from-blue-400/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-radial from-emerald-400/30 to-transparent rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Mid Background */}
        <div 
          className="absolute inset-0 opacity-15"
          style={midgroundParallax.getParallaxStyle(0.2)}
        >
          <FloatingElements variant="bubbles" count={8} />
        </div>

        {/* Foreground Elements */}
        <div 
          className="absolute inset-0 opacity-10"
          style={foregroundParallax.getParallaxStyle(0.4)}
        >
          <FloatingElements variant="geometric" count={6} />
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              ...getParallaxStyle(0.1 + i * 0.02),
              ...float1,
              animationDelay: `${i * 0.2}s`,
            }}
          >
            <div 
              className="w-1 h-1 bg-white rounded-full animate-pulse"
              style={{ animationDuration: `${2 + Math.random() * 3}s` }}
            />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Title with Advanced Parallax */}
          <div className={`text-center mb-16 ${titleReveal.className}`} ref={titleReveal.ref}>
            <div 
              className="mb-8"
              style={getScaleStyle(0.0002, 0.95, 1.05)}
            >
              <h1 className="text-6xl md:text-8xl font-medium text-white mb-6 leading-tight">
                <span 
                  className="block"
                  style={getRotationStyle(0.02)}
                >
                  O Futuro é
                </span>
                <span 
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-300 to-blue-300"
                  style={{...getRotationStyle(-0.02), ...float2}}
                >
                  Sustentável
                </span>
              </h1>
            </div>
            
            <div style={getOpacityStyle(0.0001, 0.7, 1)}>
              <p className="text-xl md:text-2xl text-green-100 max-w-4xl mx-auto leading-relaxed">
                Transforme sua pegada de carbono em impacto positivo com nossos projetos 
                de reflorestamento cientificamente verificados
              </p>
            </div>
          </div>

          {/* Stats with Staggered Parallax */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 ${statsReveal.className}`} ref={statsReveal.ref}>
            {impactStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  style={{
                    ...getParallaxStyle(0.1 + index * 0.02),
                    ...float3,
                    animationDelay: `${index * 0.5}s`
                  }}
                >
                  <GlassCard className="p-6 text-center glass-ultra hover:scale-105 transition-all duration-500 group">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                        <Icon className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-green-200 transition-colors duration-300">
                      {stat.value}
                    </div>
                    <div className="text-sm text-green-100/80">{stat.label}</div>
                  </GlassCard>
                </div>
              );
            })}
          </div>

          {/* Feature Cards with 3D Transforms */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${cardsReveal.className}`} ref={cardsReveal.ref}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  style={{
                    ...getParallaxStyle(0.08 + index * 0.03),
                    ...float1,
                    animationDelay: `${index * 0.7}s`
                  }}
                >
                  <GlassCard className="p-8 h-full glass-ultra hover-3d group cursor-pointer relative overflow-hidden">
                    {/* Animated Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    
                    <div className="relative z-10">
                      <div className="flex justify-center mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-4 text-center group-hover:text-green-200 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      
                      <p className="text-green-100/80 text-center leading-relaxed group-hover:text-green-100 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow" />
                  </GlassCard>
                </div>
              );
            })}
          </div>

          {/* Floating CTA */}
          <div 
            className="text-center mt-20"
            style={{...getParallaxStyle(0.15), ...float2}}
          >
            <button className="bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 text-white px-12 py-4 rounded-full text-lg font-medium hover:from-green-600 hover:via-emerald-600 hover:to-blue-600 transition-all duration-500 transform hover:scale-110 hover:rotate-1 active:scale-95 shadow-2xl hover:shadow-3xl animate-pulse-glow">
              Comece Sua Jornada Sustentável
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}