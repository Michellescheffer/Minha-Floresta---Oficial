import { ReactNode, forwardRef } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`
        bg-white/10 
        backdrop-blur-lg 
        border border-white/20 
        rounded-2xl
        shadow-xl 
        shadow-black/5
        hover:shadow-2xl
        hover:shadow-black/10
        transition-all 
        duration-300
        ${className}
      `}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';