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
  // Minimalist clean design
  return (
    <div
      ref={ref}
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm
        ${hoverEffect ? 'hover:shadow-md transition-shadow duration-300' : ''}
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