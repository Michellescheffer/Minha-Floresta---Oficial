import { Star, Quote, Building, User, Heart, TrendingUp, Users, Award, Shield } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { TestimonialsColumns } from './ui/testimonials-columns';
import { motion } from 'motion/react';

export function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'Marina Silva',
      role: 'Diretora de Sustentabilidade',
      company: 'EcoTech Solutions',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'A Minha Floresta Conservações transformou nossa estratégia de ESG. A transparência dos projetos e a facilidade de acompanhamento dos resultados superaram nossas expectativas. Em 6 meses compensamos completamente nossa pegada de carbono corporativa.',
      impact: '2.500 m² compensados',
      type: 'corporate'
    },
    {
      id: 2,
      name: 'Carlos Mendes',
      role: 'Empresário',
      company: 'Pessoa Física',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'Como pai de família, queria contribuir para um futuro melhor para meus filhos. O processo de compra foi simples e transparente. Recebo relatórios regulares sobre o desenvolvimento das árvores que patrocinei. É emocionante ver o impacto real!',
      impact: '800 m² compensados',
      type: 'individual'
    },
    {
      id: 3,
      name: 'Dra. Ana Ribeiro',
      role: 'Coordenadora de Projetos',
      company: 'Instituto Socioambiental',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'Trabalho há 15 anos com conservação e nunca vi uma plataforma tão bem estruturada. A metodologia científica é rigorosa, os projetos sociais são genuínos e o impacto nas comunidades locais é transformador. Recomendo sem hesitação.',
      impact: 'Parceria institucional',
      type: 'partner'
    },
    {
      id: 4,
      name: 'Roberto Santos',
      role: 'Diretor Financeiro',
      company: 'Grupo Industrial MB',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'Além de compensar nossa pegada de carbono, conseguimos deduzir parte do investimento no Imposto de Renda. O suporte da equipe foi excepcional, desde o cálculo inicial até a documentação fiscal. Excelente custo-benefício.',
      impact: '5.000 m² compensados',
      type: 'corporate'
    },
    {
      id: 5,
      name: 'Juliana Costa',
      role: 'Arquiteta Paisagista',
      company: 'Estúdio Verde',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'Indico para todos os meus clientes. É uma forma concreta de tornar projetos arquitetônicos carbono neutro. A plataforma é intuitiva, os certificados são profissionais e o impacto é real. Meus clientes ficam muito satisfeitos.',
      impact: '1.200 m² indicados',
      type: 'individual'
    },
    {
      id: 6,
      name: 'Eng. Pedro Oliveira',
      role: 'Produtor Rural',
      company: 'Fazenda Sustentável',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'Como beneficiário dos projetos sociais, posso dizer que o impacto vai muito além do ambiental. Minha família foi capacitada em técnicas sustentáveis e hoje temos uma renda extra com produtos florestais. É um círculo virtuoso de verdade.',
      impact: 'Beneficiário direto',
      type: 'community'
    },
    {
      id: 7,
      name: 'Camila Rodriguez',
      role: 'CEO',
      company: 'StartUp Green Tech',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'Nossa startup precisava de uma solução sustentável que não comprometesse nosso orçamento. A Minha Floresta ofereceu exatamente isso: flexibilidade, transparência e impacto real. Nossos investidores ficaram impressionados com nossa estratégia ESG.',
      impact: '1.500 m² compensados',
      type: 'corporate'
    },
    {
      id: 8,
      name: 'João Ferreira',
      role: 'Aposentado',
      company: 'Pessoa Física',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'Sempre quis contribuir para o meio ambiente, mas não sabia como. A plataforma é muito fácil de usar, mesmo para alguém da minha idade. Hoje tenho "minha floresta" e acompanho seu crescimento pelo aplicativo. Muito gratificante!',
      impact: '300 m² compensados',
      type: 'individual'
    },
    {
      id: 9,
      name: 'Profs. Luciana Mendes',
      role: 'Pesquisadora',
      company: 'Universidade Federal',
      avatar: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'Do ponto de vista acadêmico, a metodologia utilizada é exemplar. Os dados são consistentes, a metodologia é transparente e os resultados são verificáveis. É um modelo que deveria ser replicado em todo o Brasil.',
      impact: 'Estudo científico',
      type: 'partner'
    }
  ];

  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-gray-50/50"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              Histórias de Impacto
            </span>
          </motion.h2>
          <motion.p 
            className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Descubra como pessoas e empresas estão fazendo a diferença através dos nossos 
            projetos de reflorestamento. Cada depoimento representa uma jornada única de 
            compromisso com a sustentabilidade e responsabilidade ambiental, demonstrando 
            o impacto real e transformador de nossas iniciativas.
          </motion.p>
        </div>

        {/* Statistics - Enhanced Design */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <GlassCard className="p-6 text-center hover:scale-105 transition-all duration-300 group">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-gray-600 text-sm">Satisfação dos Clientes</div>
          </GlassCard>

          <GlassCard className="p-6 text-center hover:scale-105 transition-all duration-300 group">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600 text-sm">Clientes Ativos</div>
          </GlassCard>

          <GlassCard className="p-6 text-center hover:scale-105 transition-all duration-300 group">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
            <div className="text-gray-600 text-sm">Meses de Operação</div>
          </GlassCard>

          <GlassCard className="p-6 text-center hover:scale-105 transition-all duration-300 group">
            <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600 text-sm">Suporte Disponível</div>
          </GlassCard>
        </motion.div>

        {/* Testimonials in Columns Layout */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <TestimonialsColumns testimonials={testimonials} />
        </motion.div>

        {/* Call to Action - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <GlassCard className="p-12 text-center bg-gradient-to-r from-green-50/50 to-blue-50/50 hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            
            <h3 className="text-gray-800 mb-4">
              Faça Parte da Nossa Comunidade
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Junte-se a centenas de pessoas e empresas que já escolheram um futuro mais sustentável. 
              Comece sua jornada de compensação de carbono hoje mesmo e veja o impacto real que 
              você pode gerar para o planeta e as comunidades locais.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium">
                Começar Agora
              </button>
              <button className="border-2 border-green-500 text-green-600 px-8 py-4 rounded-2xl hover:bg-green-50 transition-all duration-300 font-medium">
                Falar com Especialista
              </button>
            </div>

            <div className="pt-8 border-t border-white/20">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span>4.9/5</span>
                </div>
                <span>•</span>
                <span>300+ avaliações verificadas</span>
                <span>•</span>
                <span>100% transparente</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}