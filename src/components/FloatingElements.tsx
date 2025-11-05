import { useParallax, useFloatingAnimation } from '../hooks/useParallax';
import { GlassCard } from './GlassCard';

interface FloatingElementsProps {
  variant?: 'leaves' | 'bubbles' | 'geometric';
  count?: number;
  className?: string;
}

export function FloatingElements({ variant = 'leaves', count = 6, className = '' }: FloatingElementsProps) {
  const { getParallaxStyle } = useParallax({ speed: 0.3, direction: 'up' });
  const { floatingStyle } = useFloatingAnimation(8000, 15);

  const renderLeaves = () => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`absolute opacity-20 ${className}`}
          style={{
            ...getParallaxStyle(0.2 + i * 0.1),
            left: `${10 + i * 15}%`,
            top: `${20 + i * 12}%`,
            animationDelay: `${i * 0.8}s`,
            ...floatingStyle
          }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full backdrop-blur-sm border border-green-300/20" 
               style={{ 
                 transform: `rotate(${i * 45}deg)`,
                 clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
               }} />
        </div>
      ))}
    </>
  );

  const renderBubbles = () => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`absolute opacity-15 ${className}`}
          style={{
            ...getParallaxStyle(0.15 + i * 0.05),
            right: `${5 + i * 12}%`,
            top: `${15 + i * 15}%`,
            animationDelay: `${i * 1.2}s`,
            ...floatingStyle
          }}
        >
          <div 
            className="bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full backdrop-blur-sm border border-blue-300/10"
            style={{ 
              width: `${20 + i * 8}px`,
              height: `${20 + i * 8}px`,
            }}
          />
        </div>
      ))}
    </>
  );

  const renderGeometric = () => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`absolute opacity-10 ${className}`}
          style={{
            ...getParallaxStyle(0.1 + i * 0.08),
            left: `${80 - i * 10}%`,
            top: `${30 + i * 8}%`,
            animationDelay: `${i * 0.6}s`,
            ...floatingStyle
          }}
        >
          <GlassCard className="w-6 h-6 bg-white/5 border-white/10 transform rotate-45" />
        </div>
      ))}
    </>
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {variant === 'leaves' && renderLeaves()}
      {variant === 'bubbles' && renderBubbles()}
      {variant === 'geometric' && renderGeometric()}
    </div>
  );
}

// Componente específico para partículas de fundo do Hero
export function HeroParticles() {
  const { getParallaxStyle } = useParallax({ speed: 0.2 });
  const { floatingStyle: float1 } = useFloatingAnimation(6000, 25);
  const { floatingStyle: float2 } = useFloatingAnimation(8000, 30);
  const { floatingStyle: float3 } = useFloatingAnimation(10000, 20);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Partículas grandes */}
      <div 
        className="absolute top-1/4 left-1/4 w-64 h-64 opacity-5"
        style={{ ...getParallaxStyle(0.1), ...float1 }}
      >
        <div className="w-full h-full bg-gradient-radial from-green-400/30 via-emerald-500/20 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div 
        className="absolute top-1/3 right-1/4 w-48 h-48 opacity-5"
        style={{ ...getParallaxStyle(0.15), ...float2 }}
      >
        <div className="w-full h-full bg-gradient-radial from-blue-400/30 via-cyan-500/20 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div 
        className="absolute bottom-1/3 left-1/3 w-56 h-56 opacity-5"
        style={{ ...getParallaxStyle(0.08), ...float3 }}
      >
        <div className="w-full h-full bg-gradient-radial from-emerald-400/30 via-green-500/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Partículas pequenas flutuantes */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-10"
          style={{
            ...getParallaxStyle(0.05 + i * 0.02),
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
          }}
        >
          <div 
            className="w-2 h-2 bg-white/30 rounded-full backdrop-blur-sm animate-pulse"
            style={{ animationDuration: `${2 + Math.random() * 3}s` }}
          />
        </div>
      ))}
    </div>
  );
}