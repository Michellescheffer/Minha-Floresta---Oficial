import { ArrowRight, Calculator, ShoppingBag } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useApp } from '../contexts/AppContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function CTA() {
  const { setCurrentPage } = useApp();

  return (
    <section className="relative py-12 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1632404954707-4465b1411e9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxncmVlbiUyMHBsYW50cyUyMGVjbyUyMGZyaWVuZGx5fGVufDF8fHx8MTc1NTg4NDQ5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Green plants background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 via-emerald-900/40 to-green-800/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <GlassCard className="p-12 md:p-16 backdrop-blur-xl bg-white/15 border-white/25 rounded-3xl shadow-2xl">
          <h2 className="text-white mb-6 drop-shadow-lg leading-tight">
            Comece Agora Sua Jornada
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300 drop-shadow-none">
              Sustentável
            </span>
          </h2>
          
          <p className="text-green-50/95 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-md text-lg">
            Cada metro quadrado que você compra gera impacto real no meio ambiente. 
            Junte-se a milhares de pessoas que já compensam suas emissões de forma transparente e verificada.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={() => setCurrentPage('calculadora-pegada')}
              className="group bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-3 font-medium"
            >
              <Calculator className="w-6 h-6" />
              <span>Calcular Minha Pegada</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => setCurrentPage('loja')}
              className="group px-8 py-4 rounded-2xl border-2 border-white/40 text-white hover:bg-white/15 transition-all duration-300 backdrop-blur-sm flex items-center space-x-3 font-medium hover:border-white/60 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingBag className="w-6 h-6" />
              <span>Ver Projetos Disponíveis</span>
            </button>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}