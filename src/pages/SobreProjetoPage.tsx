import image_2126b48fadcb759a00646a3f29d2508b0d895e97 from 'figma:asset/2126b48fadcb759a00646a3f29d2508b0d895e97.png';
import { Eye, Shield, Target, Leaf, Globe, Heart, Users, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useApp } from '../contexts/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function SobreProjetoPage() {
  const { setCurrentPage } = useApp();

  const visionPoints = [
    'Democratizar o acesso à compensação de carbono',
    'Conectar pessoas com projetos ambientais reais',
    'Promover transparência total no processo'
  ];

  const governanceSteps = [
    {
      number: '01',
      title: 'Conselho Consultivo',
      description: 'Especialistas em meio ambiente e sustentabilidade'
    },
    {
      number: '02',
      title: 'Auditoria Externa',
      description: 'Verificação independente de todos os projetos'
    },
    {
      number: '03',
      title: 'Relatórios Trimestrais',
      description: 'Transparência total sobre resultados'
    },
    {
      number: '04',
      title: 'Certificações Internacionais',
      description: 'Padrões VCS, Gold Standard e REDD+'
    }
  ];

  const mrvSteps = [
    {
      letter: 'M',
      title: 'Medição',
      description: 'Quantificação precisa do carbono sequestrado através de metodologias científicas reconhecidas internacionalmente.',
      color: 'teal'
    },
    {
      letter: 'R',
      title: 'Relato',
      description: 'Documentação transparente de todas as atividades, resultados e impactos ambientais dos projetos.',
      color: 'emerald'
    },
    {
      letter: 'V',
      title: 'Verificação',
      description: 'Validação por terceiros independentes e organismos certificadores reconhecidos mundialmente.',
      color: 'green'
    }
  ];

  const stats = [
    { value: '25+', label: 'Projetos Ativos', icon: <Target className="w-8 h-8 text-green-600" /> },
    { value: '50k+', label: 'Hectares Protegidos', icon: <Globe className="w-8 h-8 text-emerald-600" /> },
    { value: '100k+', label: 'CO₂ Compensado', icon: <TrendingUp className="w-8 h-8 text-teal-600" /> },
    { value: '2.5k+', label: 'Famílias Beneficiadas', icon: <Users className="w-8 h-8 text-blue-600" /> }
  ];

  return (
    <div className="min-h-screen pt-52 sm:pt-48 pb-16 sm:pb-20">
      {/* Background with forest image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1737982561070-e349fad5674b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMHZpc2lvbiUyMGZ1dHVyZXxlbnwxfHx8fDE3NTYyMTg2Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Sustainable future"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/95 to-white/90"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full mb-8">
            <Leaf className="w-4 h-4 text-green-600" />
            <span className="text-green-700">Sobre o Projeto</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-medium text-gray-800 mb-8">
            Nosso Compromisso
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              com o Meio Ambiente
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transformamos a forma como as pessoas e empresas contribuem para a preservação ambiental, 
            oferecendo transparência total e impacto real.
          </p>
        </div>

        {/* Vision Section */}
        <div className="mb-24">
          <GlassCard className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                    <Eye className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-4xl text-gray-800">Nossa Visão</h2>
                </div>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Ser a principal plataforma de compensação de carbono do Brasil, democratizando 
                  o acesso a projetos ambientais verificados e de alta qualidade.
                </p>
                
                <div className="space-y-4">
                  {visionPoints.map((point, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full h-64 rounded-2xl overflow-hidden">
                  <ImageWithFallback
                    src={image_2126b48fadcb759a00646a3f29d2508b0d895e97}
                    alt="Environmental team"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Governance Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-4xl text-gray-800">Governança</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa estrutura garante transparência, responsabilidade e efetividade 
              em todos os projetos apoiados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {governanceSteps.map((step, index) => (
              <GlassCard key={index} className="p-6 text-center group hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold text-emerald-600 mb-4">{step.number}</div>
                <h4 className="text-lg text-gray-800 mb-3">{step.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* MRV Section */}
        <div className="mb-24">
          <GlassCard className="p-12 bg-gradient-to-r from-teal-50/80 to-emerald-50/80">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center">
                  <Target className="w-8 h-8 text-teal-600" />
                </div>
                <h2 className="text-4xl text-gray-800">Sistema MRV</h2>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Medição, Relato e Verificação - o padrão internacional que garante 
                a credibilidade dos nossos projetos
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mrvSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className={`w-24 h-24 bg-${step.color}-50 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <span className={`text-${step.color}-600 font-bold text-3xl`}>{step.letter}</span>
                  </div>
                  <h4 className="text-2xl text-gray-800 mb-4">{step.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-6 bg-white/50 rounded-2xl">
              <div className="flex items-center justify-center space-x-8 text-lg">
                <div className="flex items-center space-x-2">
                  <Award className="w-6 h-6 text-teal-600" />
                  <span className="text-gray-700 font-medium">VCS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-6 h-6 text-emerald-600" />
                  <span className="text-gray-700 font-medium">Gold Standard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-6 h-6 text-green-600" />
                  <span className="text-gray-700 font-medium">REDD+</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Statistics */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <GlassCard key={index} className="p-6 text-center group hover:scale-105 transition-all duration-300">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <GlassCard className="p-12 bg-gradient-to-r from-green-50/80 to-blue-50/80">
            <h2 className="text-4xl text-gray-800 mb-4">
              Junte-se ao 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                movimento
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Faça parte da maior iniciativa de compensação de carbono do Brasil
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setCurrentPage('loja')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-10 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
              >
                Explorar Projetos
              </button>
              <button 
                onClick={() => setCurrentPage('como-funciona')}
                className="border-2 border-green-500 text-green-600 px-10 py-4 rounded-2xl hover:bg-green-50 transition-all duration-300 text-lg"
              >
                Como Funciona
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}