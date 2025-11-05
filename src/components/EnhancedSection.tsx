import { ReactNode } from 'react';
import { useScrollReveal, useParallax } from '../hooks/useParallax';
import { FloatingElements } from './FloatingElements';
import { GlassCard } from './GlassCard';

interface EnhancedSectionProps {
  children: ReactNode;
  className?: string;
  background?: 'light' | 'dark' | 'gradient';
  withFloatingElements?: boolean;
  floatingVariant?: 'leaves' | 'bubbles' | 'geometric';
  withParallax?: boolean;
  title?: string;
  subtitle?: string;
  center?: boolean;
}

export function EnhancedSection({
  children,
  className = '',
  background = 'light',
  withFloatingElements = false,
  floatingVariant = 'leaves',
  withParallax = false,
  title,
  subtitle,
  center = false
}: EnhancedSectionProps) {
  const { isVisible, ref } = useScrollReveal(0.1);
  const titleReveal = useScrollReveal(0.2);
  const contentReveal = useScrollReveal(0.3);
  const { getParallaxStyle } = useParallax({ speed: 0.1 });

  const backgroundClasses = {
    light: 'bg-gradient-to-br from-gray-50 to-white',
    dark: 'bg-gradient-to-br from-gray-900 to-gray-800',
    gradient: 'bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50'
  };

  return (
    <section 
      ref={ref}
      className={`relative py-8 sm:py-12 overflow-hidden ${backgroundClasses[background]} ${className}`}
      style={withParallax ? getParallaxStyle() : undefined}
    >
      {/* Floating Elements */}
      {withFloatingElements && (
        <FloatingElements variant={floatingVariant} count={8} />
      )}

      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-green-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial from-blue-400/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${center ? 'text-center' : ''}`}>
        {/* Title Section */}
        {(title || subtitle) && (
          <div className={`mb-16 ${titleReveal.className}`} ref={titleReveal.ref}>
            {title && (
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium text-gray-800 mb-6 glass-text-contrast">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`${contentReveal.className}`} ref={contentReveal.ref}>
          {children}
        </div>
      </div>
    </section>
  );
}

// Componente específico para cards em grid com animações
interface AnimatedCardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  withHover?: boolean;
}

export function AnimatedCardGrid({ 
  children, 
  columns = 3, 
  gap = 'lg',
  withHover = true 
}: AnimatedCardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div className={`grid ${gridCols[columns]} ${gapClasses[gap]}`}>
      {children}
    </div>
  );
}

// Card individual com animações avançadas
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover3d?: boolean;
}

export function AnimatedCard({ 
  children, 
  className = '',
  delay = 0,
  hover3d = true 
}: AnimatedCardProps) {
  const { isVisible, ref } = useScrollReveal(0.1);

  return (
    <div 
      ref={ref}
      className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} transition-all duration-700`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <GlassCard 
        className={`
          h-full p-6 sm:p-8 
          ${hover3d ? 'hover:scale-105 hover:-rotate-1' : 'hover:scale-102'} 
          transition-all duration-500 
          hover:shadow-2xl 
          cursor-pointer 
          group
          ${className}
        `}
      >
        {children}
      </GlassCard>
    </div>
  );
}

// Componente para texto com efeito de digitação
interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}

export function TypewriterText({ 
  text, 
  delay = 0, 
  speed = 50,
  className = ''
}: TypewriterTextProps) {
  const { isVisible, ref } = useScrollReveal(0.1);
  
  return (
    <div ref={ref} className={className}>
      {isVisible && (
        <span className="inline-block">
          {text.split('').map((char, index) => (
            <span
              key={index}
              className="inline-block opacity-0 animate-fade-in"
              style={{
                animationDelay: `${delay + index * speed}ms`,
                animationFillMode: 'forwards'
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}