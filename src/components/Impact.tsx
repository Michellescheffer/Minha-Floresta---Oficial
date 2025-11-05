import { Leaf, Globe, Users, Award, TrendingUp, TreePine, Droplets, Sun } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useApp } from '../contexts/AppContext';

export function Impact() {
  const { projects, sales } = useApp();
  
  // Calculate total impact metrics
  const total_m2_sold = sales.reduce((sum, sale) => sum + sale.m2_quantity, 0);
  const total_co2_compensated = projects.reduce((sum, project) => {
    const projectSales = sales.filter(sale => sale.projectId === project.id);
    const projectM2 = projectSales.reduce((m2Sum, sale) => m2Sum + sale.m2_quantity, 0);
    return sum + (projectM2 * 0.5); // Assumindo 0.5kg CO2 por m² como padrão
  }, 0);
  

  const totalProjects = projects.length;

  const impactStats = [
    {
      icon: <Leaf className="w-8 h-8" />,
      value: `${Math.round(total_co2_compensated).toLocaleString()}`,
      unit: 'kg CO₂',
      label: 'Carbono Compensado Anualmente',
      color: 'text-green-600',
      bgColor: 'bg-green-50/50'
    },
    {
      icon: <TreePine className="w-8 h-8" />,
      value: total_m2_sold.toLocaleString(),
      unit: 'm²',
      label: 'Área Reflorestada',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50/50'
    },

    {
      icon: <Globe className="w-8 h-8" />,
      value: totalProjects.toString(),
      unit: 'projetos',
      label: 'Iniciativas Ativas',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50/50'
    }
  ];

  const environmentalBenefits = [
    {
      icon: <Droplets className="w-6 h-6 text-blue-500" />,
      title: 'Proteção Hídrica',
      description: 'Conservação de nascentes e recursos hídricos em todas as áreas de projeto, beneficiando comunidades locais e ecossistemas.'
    },
    {
      icon: <Sun className="w-6 h-6 text-orange-500" />,
      title: 'Microclima Regulado',
      description: 'Melhoria das condições climáticas locais através do aumento da cobertura vegetal e regulação da temperatura.'
    },
    {
      icon: <Award className="w-6 h-6 text-green-500" />,
      title: 'Biodiversidade',
      description: 'Restauração de habitats naturais para espécies nativas, promovendo a conservação da fauna e flora regional.'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
      title: 'Economia Verde',
      description: 'Desenvolvimento de cadeias produtivas sustentáveis que geram renda e preservam o meio ambiente simultaneamente.'
    }
  ];

  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white/50"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              Nosso Impacto
            </span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            Através de parcerias estratégicas e metodologias cientificamente comprovadas, geramos 
            impacto ambiental positivo mensurável e duradouro. Cada projeto é monitorado 
            continuamente para garantir transparência total e resultados efetivos na luta 
            contra as mudanças climáticas e preservação da biodiversidade brasileira.
          </p>
        </div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {impactStats.map((stat, index) => (
            <GlassCard key={index} className="p-8 text-center group hover:scale-105 transition-all duration-300">
              <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 mb-2">{stat.unit}</div>
              <div className="text-gray-700 font-medium">{stat.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Environmental Benefits */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-gray-800 mb-4">
              Benefícios Ambientais e Sociais
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Nossos projetos vão além da simples compensação de carbono, criando um ciclo 
              virtuoso de benefícios ambientais, sociais e econômicos para as regiões atendidas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {environmentalBenefits.map((benefit, index) => (
              <GlassCard key={index} className="p-6 group hover:scale-105 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white/50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="text-gray-800 mb-2 font-medium">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Impact Timeline */}
        <GlassCard className="p-12 text-center bg-gradient-to-r from-green-50/50 to-blue-50/50">
          <h3 className="text-gray-800 mb-6">
            Compromisso de Longo Prazo
          </h3>
          <p className="text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Nossa abordagem integrada combina ciência, tecnologia e desenvolvimento social para 
            garantir que cada investimento gere resultados positivos duradouros. Através de 
            monitoramento contínuo via satélite e relatórios trimestrais, asseguramos a 
            qualidade e transparência de todos os nossos projetos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Plantio e Estabelecimento</h4>
              <p className="text-gray-600 text-sm">
                Primeiros 2 anos com monitoramento intensivo e cuidados especiais para garantir o desenvolvimento adequado das mudas.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Crescimento e Consolidação</h4>
              <p className="text-gray-600 text-sm">
                Anos 3-10 com crescimento acelerado da biomassa e início significativo da captura de carbono atmosférico.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Maturidade e Máximo Impacto</h4>
              <p className="text-gray-600 text-sm">
                Anos 10+ com máxima eficiência na captura de CO₂ e consolidação total do ecossistema florestal.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium">
              Ver Relatórios de Impacto
            </button>
            <button className="border-2 border-green-500 text-green-600 px-8 py-4 rounded-2xl hover:bg-green-50 transition-all duration-300 font-medium">
              Metodologia Científica
            </button>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}