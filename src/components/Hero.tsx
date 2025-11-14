import { useState, useEffect } from 'react';
import { Calculator, ShoppingBag, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useApp } from '../contexts/AppContext';
import { useParallax, useScrollReveal } from '../hooks/useParallax';
import { HeroParticles } from './FloatingElements';
import { supabase } from '../services/supabaseClient';

export function Hero() {
  const { setCurrentPage } = useApp();
  const { getParallaxStyle, getOpacityStyle } = useParallax({ speed: 0.5 });
  const titleReveal = useScrollReveal(0.2);
  const ctaReveal = useScrollReveal(0.3);
  const trustReveal = useScrollReveal(0.4);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([
    '/images/amazon-aerial-new.jpg',
    'https://images.unsplash.com/photo-1653149875526-e2533c6af095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWF6b24lMjByYWluZm9yZXN0JTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NTYxNjc0MzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  ]);
  
  // Load images from database
  useEffect(() => {
    const loadHeroImages = async () => {
      try {
        const { data, error } = await supabase
          .from('site_images')
          .select('url')
          .in('key', ['hero_primary', 'hero_secondary', 'hero_tertiary'])
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setImages(data.map(img => img.url));
        }
      } catch (err) {
        console.error('Error loading hero images:', err);
        // Keep default images on error
      }
    };
    
    loadHeroImages();
  }, []);
  
  // Auto-rotate images every 5 seconds
  useEffect(() => {
    if (images.length < 2) return;
    
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000); // 5 seconds
    
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative min-h-screen h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Background with Parallax Effect and Fade Transition */}
      <div className="absolute inset-0 z-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-[120vh] bg-cover bg-center bg-no-repeat scale-105 transition-opacity duration-2000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url('${image}')`,
              ...getParallaxStyle(0.15),
              backgroundPosition: 'center center',
              transitionDuration: '2000ms'
            }}
          />
        ))}
        {/* Enhanced overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-emerald-800/50 to-green-700/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>

      {/* Floating Particles */}
      <HeroParticles />

      {/* Grid Layout for Perfect Quadrants */}
      <div className="relative z-20 w-full h-full grid grid-rows-4 max-w-7xl mx-auto px-6 sm:px-8 safe-area-top">
        
        {/* Quadrant 1: Top Space */}
        <div className="flex items-end justify-center pb-6 sm:pb-4">
          {/* Empty space for breathing room */}
        </div>
        
        {/* Quadrant 2: Hero Title */}
        <div className="flex items-center justify-center">
          <div className={`text-center ${titleReveal.className}`} ref={titleReveal.ref}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium text-white mb-8 sm:mb-6 drop-shadow-lg leading-[0.9] tracking-tight transform hover:scale-105 transition-transform duration-700">
              Compense sua pegada de
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200 drop-shadow-none animate-pulse mt-2">
                Carbono
              </span>
            </h1>
            
            <p className="text-green-50/95 leading-relaxed drop-shadow-md max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl font-light mb-6 sm:mb-4">
              Compre <span className="mx-1 font-medium text-green-200">O₂</span> por <span className="mx-1 font-medium text-green-200">m²</span> e gere impacto hoje
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-green-100/80 text-sm sm:text-base">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span>Projetos verificados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span>Certificados físicos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span>Impacto mensurável</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quadrant 3: Call to Actions */}
        <div className="flex items-center justify-center pt-6 sm:pt-0">
          <div className={ctaReveal.className} ref={ctaReveal.ref}>
            <GlassCard className="p-6 sm:p-8 md:p-10 backdrop-blur-xl bg-white/10 border-white/20 rounded-3xl shadow-2xl hover:shadow-3xl hover:bg-white/15 transition-all duration-500 transform hover:scale-[1.02] relative z-30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <button 
                  onClick={() => setCurrentPage('loja')}
                  aria-label="Comprar metros quadrados de projetos de reflorestamento"
                  className="group bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 sm:px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.05] active:scale-[0.95] flex items-center justify-center space-x-2 sm:space-x-3 font-medium w-full sm:w-auto min-h-[52px] sm:min-h-[56px] relative overflow-hidden touch-target"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-sm sm:text-base relative z-10">Comprar m² agora</span>
                </button>
                
                <button 
                  onClick={() => setCurrentPage('calculadora-pegada')}
                  aria-label="Calcular minha pegada de carbono"
                  className="group px-6 sm:px-8 py-4 rounded-2xl border-2 border-white/50 text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm flex items-center justify-center space-x-2 sm:space-x-3 font-medium hover:border-white/70 transform hover:scale-[1.05] active:scale-[0.95] w-full sm:w-auto min-h-[52px] sm:min-h-[56px] relative overflow-hidden touch-target"
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Calculator className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-sm sm:text-base relative z-10">Calcular minha pegada</span>
                </button>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Quadrant 4: Trust Section */}
        <div className="flex items-start justify-center pt-6 sm:pt-3">
          <div className={trustReveal.className} ref={trustReveal.ref}>
            <GlassCard className="p-3 sm:p-4 backdrop-blur-xl bg-white/10 border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl hover:bg-white/15 transition-all duration-500 relative z-30">
              <p className="text-green-100/90 mb-3 sm:mb-3 font-medium drop-shadow-sm text-center text-xs sm:text-sm">
                Confiança e transparência garantidas
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 justify-center items-center max-w-xl mx-auto">
                <div className="flex flex-col items-center text-center group">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/30">
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-green-200 group-hover:text-green-100 transition-colors duration-300" />
                  </div>
                  <div className="text-white font-medium mb-0.5 drop-shadow-sm group-hover:text-green-100 transition-colors duration-300 text-xs sm:text-sm">Stripe</div>
                  <p className="text-green-100/80 text-xs drop-shadow-sm">Pagamento seguro</p>
                </div>
                
                <div className="flex flex-col items-center text-center group">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/30">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-200 group-hover:text-green-100 transition-colors duration-300" />
                  </div>
                  <div className="text-white font-medium mb-0.5 drop-shadow-sm group-hover:text-green-100 transition-colors duration-300 text-xs sm:text-sm">Certificado físico</div>
                  <p className="text-green-100/80 text-xs drop-shadow-sm">Documento oficial</p>
                </div>
                
                <div className="flex flex-col items-center text-center group">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/30">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-200 group-hover:text-green-100 transition-colors duration-300" />
                  </div>
                  <div className="text-white font-medium mb-0.5 drop-shadow-sm group-hover:text-green-100 transition-colors duration-300 text-xs sm:text-sm">MRV</div>
                  <p className="text-green-100/80 text-xs drop-shadow-sm">Medição, Relato, Verificação</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
        
      </div>
    </section>
  );
}