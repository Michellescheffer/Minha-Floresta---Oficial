import { ReactNode, forwardRef } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'flat' | 'sunken' | 'featured';
  intensity?: 'low' | 'medium' | 'high';
  hoverEffect?: boolean;
  [key: string]: any;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  className = '',
  variant = 'default',
  intensity = 'high',
  hoverEffect = false,
  ...props
}, ref) => {
  const baseStyles = 'relative transition-all duration-500 ease-out border'

  const variants: Record<string, string> = {
    default: 'bg-white/60 shadow-2xl shadow-black/5 ring-1 ring-white/40',
    flat: 'bg-white/30 shadow-lg shadow-black/5 ring-1 ring-white/20',
    sunken: 'bg-black/5 shadow-inner shadow-black/5 ring-1 ring-black/5',
    featured: 'bg-gradient-to-br from-white/80 to-white/40 shadow-2xl shadow-emerald-900/10 ring-1 ring-white/60'
  }

  const blurs: Record<string, string> = {
    low: 'backdrop-blur-md',
    medium: 'backdrop-blur-xl',
    high: 'backdrop-blur-3xl'
  }

  const hoverStyles = hoverEffect
    ? 'hover:bg-white/70 hover:scale-[1.01] hover:shadow-3xl hover:shadow-emerald-500/10 hover:-translate-y-1'
    : ''

  return (
    <div
      ref={ref}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${blurs[intensity]}
        ${hoverStyles}
        rounded-3xl
        border-white/40
        ${className}
      `}
      style={{
        ...props.style
      }}
      {...props}
    >
      {/* Specular Highlight */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/40 to-transparent pointer-events-none opacity-50" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

GlassCard.displayName = 'GlassCard';