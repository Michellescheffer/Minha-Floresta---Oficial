import { Leaf, TreePine, Globe, Award, Shield, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from './GlassCard';

export function Benefits() {
  return (
    <section className="relative py-12 overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 via-emerald-50/50 to-blue-50/60"></div>
      
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h2 
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Por que escolher a
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Minha Floresta?
            </span>
          </motion.h2>
          <motion.p 
            className="text-gray-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            A forma mais simples e confiável de compensar sua pegada de carbono 
            e contribuir para um futuro mais sustentável com impacto real e mensurável.
          </motion.p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Card - Larger */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GlassCard className="p-8 h-full bg-white/70 border border-white/50">
              <div className="flex items-start space-x-4 mb-6">
                <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                  <TreePine className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-800 mb-2 font-semibold text-xl">
                    Impacto Real Mensurável
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Cada m² comprado contribui diretamente para projetos de reflorestamento verificados por 
                    auditoria independente com resultados comprovados
                  </p>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50/80 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">1000+</div>
                  <div className="text-xs text-gray-600">Árvores Plantadas</div>
                </div>
                <div className="text-center p-4 bg-blue-50/80 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">50+</div>
                  <div className="text-xs text-gray-600">Hectares Preservados</div>
                </div>
                <div className="text-center p-4 bg-purple-50/80 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">98%</div>
                  <div className="text-xs text-gray-600">Taxa de Sucesso</div>
                </div>
              </div>

              {/* Progress indicators */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center space-x-2">
                    <TreePine className="w-4 h-4 text-green-600" />
                    <span>Crescimento Sustentável</span>
                  </span>
                  <span className="text-gray-600 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-red-500" />
                    <span>Impacto Social</span>
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "85%" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  ></motion.div>
                </div>
                <div className="text-right text-sm text-green-600 font-medium">
                  85% das metas atingidas este ano
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Right Column - Smaller Cards */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <GlassCard className="p-6 bg-white/60 border border-white/40 hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 mb-4 bg-green-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="text-gray-800 mb-2 font-semibold">Transparência Total</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Acompanhe em tempo real o desenvolvimento dos projetos com relatórios detalhados e acesso às coordenadas exatas
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <GlassCard className="p-6 bg-white/60 border border-white/40 hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 mb-4 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-gray-800 mb-2 font-semibold">Certificação Internacional</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Projetos certificados pelos padrões VCS e Gold Standard reconhecidos mundialmente
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </div>

        {/* Bottom Row - Additional Benefits */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <GlassCard className="p-6 text-center bg-white/50 border border-white/30 hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-4 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="text-gray-800 mb-2 font-semibold">Facilidade na Compra</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Processo simples em poucos cliques com múltiplas formas de pagamento
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center bg-white/50 border border-white/30 hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-gray-800 mb-2 font-semibold">Garantia de Qualidade</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Todos os projetos passam por rigorosa verificação e monitoramento contínuo
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center bg-white/50 border border-white/30 hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <h4 className="text-gray-800 mb-2 font-semibold">Impacto Social</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Beneficia comunidades locais com desenvolvimento sustentável e preservação ambiental
            </p>
          </GlassCard>
        </motion.div>

        {/* Statistics Bar */}
        <motion.div 
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {[
            { number: "99%", label: "Taxa de Satisfação", color: "text-green-600" },
            { number: "24/7", label: "Suporte Disponível", color: "text-blue-600" },
            { number: "5★", label: "Avaliação Média", color: "text-yellow-600" },
            { number: "100%", label: "Projetos Verificados", color: "text-purple-600" }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="text-center p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/30"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.6)"
              }}
              transition={{ duration: 0.2 }}
            >
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}