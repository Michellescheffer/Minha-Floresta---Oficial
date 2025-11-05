import { Package, CheckCircle, CreditCard, Mail, Play, ArrowRight, Shield, Users, Award } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useApp } from '../contexts/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function ComoFuncionaPage() {
  const { setCurrentPage } = useApp();

  const steps = [
    {
      number: 1,
      title: 'Escolha seu pacote',
      description: 'Selecione a quantidade de metros quadrados que deseja compensar ou escolha um de nossos pacotes pré-definidos.',
      icon: <Package className="w-6 h-6" />
    },
    {
      number: 2,
      title: 'Projeto verificado',
      description: 'Escolha entre nossos projetos certificados de reflorestamento. Todos passaram por rigoroso processo MRV.',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      number: 3,
      title: 'Pagamento seguro',
      description: 'Finalize sua compra com segurança através do Stripe. Aceitamos diversas modalidades de pagamento.',
      icon: <CreditCard className="w-6 h-6" />
    },
    {
      number: 4,
      title: 'Certificado oficial',
      description: 'Receba seu certificado físico e digital oficial, com todos os detalhes da sua compensação.',
      icon: <Mail className="w-6 h-6" />
    }
  ];

  const benefits = [
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: 'Verificação MRV',
      description: 'Todos os projetos seguem rigorosos padrões de Medição, Relato e Verificação reconhecidos internacionalmente'
    },
    {
      icon: <Award className="w-8 h-8 text-emerald-600" />,
      title: 'Certificação Internacional',
      description: 'Reconhecidos por organismos como VCS, Gold Standard e REDD+'
    },
    {
      icon: <Users className="w-8 h-8 text-teal-600" />,
      title: 'Transparência Total',
      description: 'Relatórios regulares e monitoramento em tempo real dos projetos'
    }
  ];

  return (
    <div className="min-h-screen page-content">
      {/* Background with forest image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1727372059235-2eabafde56fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBjb25zZXJ2YXRpb24lMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc1NjIxODU5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Forest background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/95 to-white/90"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full mb-8">
            <Play className="w-4 h-4 text-green-600" />
            <span className="text-green-700">Como Funciona</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-medium text-gray-800 mb-8">
            Como
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Funciona
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Em 4 etapas simples, você compensa sua pegada de carbono 
            e contribui para um futuro mais sustentável.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transform translate-x-4"></div>
                )}
                
                <GlassCard className="p-8 text-center group hover:scale-105 transition-all duration-300 relative">
                  {/* Step Number */}
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center font-medium text-xl shadow-lg mx-auto mb-6">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mx-auto mb-4">
                    {step.icon}
                  </div>
                  
                  <h4 className="text-xl text-gray-800 mb-4">{step.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  
                  {index < steps.length - 1 && (
                    <div className="flex items-center justify-center text-green-600 text-sm mt-4">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </GlassCard>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-gray-800 mb-4">
              Por que escolher nossos 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                projetos?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Oferecemos total transparência, verificação rigorosa e impacto real
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <GlassCard key={index} className="p-8 text-center group hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {benefit.icon}
                </div>
                <h4 className="text-xl text-gray-800 mb-4">{benefit.title}</h4>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <GlassCard className="p-12 bg-gradient-to-r from-green-50/80 to-emerald-50/80">
            <h2 className="text-4xl text-gray-800 mb-4">
              Pronto para 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                começar?
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Comece sua jornada de compensação de carbono hoje mesmo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setCurrentPage('loja')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-10 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] font-medium text-lg"
              >
                Explorar Projetos
              </button>
              <button 
                onClick={() => setCurrentPage('calculadora-pegada')}
                className="border-2 border-green-500 text-green-600 px-10 py-4 rounded-2xl hover:bg-green-50 hover:border-green-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-medium text-lg"
              >
                Calcular Pegada
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}