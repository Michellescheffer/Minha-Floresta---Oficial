import { Leaf, Droplets, Sun, Recycle, Wind, TreePine } from 'lucide-react';
import { GlassCard } from './GlassCard';

export function Services() {
  const services = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: 'Energia Verde',
      description: 'Soluções em energia renovável para reduzir sua pegada de carbono e custos operacionais.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: 'Gestão de Água',
      description: 'Sistemas inteligentes para conservação e reutilização de recursos hídricos.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Sun className="w-8 h-8" />,
      title: 'Energia Solar',
      description: 'Instalação e manutenção de painéis solares para energia limpa e econômica.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Recycle className="w-8 h-8" />,
      title: 'Reciclagem',
      description: 'Programas de reciclagem e economia circular para empresas sustentáveis.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <Wind className="w-8 h-8" />,
      title: 'Qualidade do Ar',
      description: 'Monitoramento e melhoria da qualidade do ar em ambientes corporativos.',
      color: 'from-sky-500 to-blue-500'
    },
    {
      icon: <TreePine className="w-8 h-8" />,
      title: 'Reflorestamento',
      description: 'Projetos de plantio e conservação para compensação de carbono.',
      color: 'from-green-600 to-lime-500'
    }
  ];

  return (
    <section id="services" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-blue-50/80 to-emerald-50/80"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full mb-6">
            <Leaf className="w-4 h-4 text-green-600" />
            <span className="text-green-700">Nossos Serviços</span>
          </div>
          
          <h2 className="text-gray-800 mb-6">
            Soluções Sustentáveis para um
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              Futuro Melhor
            </span>
          </h2>
          
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Oferecemos uma ampla gama de serviços eco-friendly, desde energia renovável até 
            gestão de resíduos, ajudando sua empresa a ser mais sustentável e eficiente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <GlassCard key={index} className="p-8 group">
              <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>
              
              <h3 className="text-gray-800 mb-4">{service.title}</h3>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                {service.description}
              </p>
              
              <button className={`text-transparent bg-clip-text bg-gradient-to-r ${service.color} hover:underline transition-all duration-300`}>
                Saiba mais →
              </button>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}