import { ReactNode, forwardRef } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'solid' | 'glass' | 'dark-glass' | 'flat';
  intensity?: 'low' | 'medium' | 'high';
  hoverEffect?: boolean;
  [key: string]: any;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  className = '',
  variant = 'solid',
  intensity = 'high',
  hoverEffect = false,
  ...props
}, ref) => {
  /* Professional Glass Variants */
  const variants = {
    solid: 'bg-white border-gray-200 shadow-sm', // CMS / Admin (High readability)
    glass: 'bg-white/10 backdrop-blur-md border-white/20 shadow-lg', // Hero / Public Pages
    'dark-glass': 'bg-black/20 backdrop-blur-md border-white/10 shadow-lg', // Footer / Dark sections
    flat: 'bg-transparent border-transparent' // Minimal
  };

  /* Intensity Levels (Optional, mainly for glass) */
  const intensities = {
    low: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    high: 'backdrop-blur-xl'
  };

  const selectedVariant = variants[variant as keyof typeof variants] || variants.solid;
  const selectedIntensity = variant.includes('glass') && intensity ? intensities[intensity as keyof typeof intensities] : '';

  return (
    <div
      ref={ref}
      className={`
        rounded-2xl border transition-all duration-300
        ${selectedVariant}
        ${selectedIntensity}
        ${hoverEffect ? 'hover:shadow-md hover:-translate-y-0.5' : ''}
        ${className}
      `}
      style={{ ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';