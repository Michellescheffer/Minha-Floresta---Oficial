import { Leaf, Award, Users, TrendingUp } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function About() {
  const stats = [
    {
      icon: <Leaf className="w-8 h-8" />,
      number: "50,000+",
      label: "Hectares Preservados",
      color: "text-green-600"
    },
    {
      icon: <Award className="w-8 h-8" />,
      number: "25+",
      label: "Projetos Certificados",
      color: "text-blue-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      number: "10,000+",
      label: "Famílias Beneficiadas",
      color: "text-emerald-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      number: "1M+",
      label: "Toneladas CO₂ Compensadas",
      color: "text-teal-600"
    }
  ];

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1574263867128-93a7d12cf0d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxmb3Jlc3QlMjBuYXR1cmV8ZW58MXx8fHwxNzM0Nzk2NDkwfDA&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Forest background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-emerald-50/90 to-teal-50/90"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full mb-6">
            <Leaf className="w-4 h-4 text-green-600" />
            <span className="text-green-700">Sobre a Minha Floresta</span>
          </div>
          
          <h2 className="text-gray-800 mb-6">
            Transformando o futuro através da
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Conservação Ambiental
            </span>
          </h2>
          
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A Minha Floresta Conservações conecta pessoas e empresas comprometidas com a sustentabilidade 
            a projetos de reflorestamento e conservação verificados, criando um impacto positivo real 
            no meio ambiente e nas comunidades locais.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <GlassCard key={index} className="p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white/40 to-white/20 flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-gray-800 text-2xl font-medium mb-2">{stat.number}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <GlassCard className="p-8">
              <h3 className="text-gray-800 mb-4">Nossa Missão</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Democratizar o acesso à compensação de carbono, oferecendo soluções transparentes, 
                verificadas e de alto impacto ambiental para indivíduos e empresas que desejam 
                contribuir efetivamente para um planeta mais sustentável.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Leaf className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-gray-800 text-sm font-medium">Projetos Verificados</h4>
                    <p className="text-gray-600 text-sm">Todos os projetos passam por rigoroso processo de certificação MRV</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-gray-800 text-sm font-medium">Impacto Social</h4>
                    <p className="text-gray-600 text-sm">Geramos renda e oportunidades para comunidades locais</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-gray-800 text-sm font-medium">Certificação Internacional</h4>
                    <p className="text-gray-600 text-sm">Reconhecidos por organismos como VCS e Gold Standard</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Image */}
          <div className="relative">
            <GlassCard className="p-4">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1596195689404-24d8a8d1c6ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxmb3Jlc3QlMjBjb25zZXJ2YXRpb258ZW58MXx8fHwxNzM0Nzk2NDkwfDA&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Conservação florestal"
                className="w-full h-80 object-cover rounded-xl"
              />
            </GlassCard>
            
            {/* Floating Card */}
            <GlassCard className="absolute -bottom-6 -left-6 p-4 bg-white/90">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-green-600 font-medium">+127%</div>
                  <div className="text-gray-600 text-sm">Crescimento em 2024</div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}