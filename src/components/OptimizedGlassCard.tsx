import React, { memo } from 'react';
import { cn } from './ui/utils';

interface OptimizedGlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

export const OptimizedGlassCard = memo(function OptimizedGlassCard({
  children,
  className,
  hover = false,
  onClick,
  ariaLabel
}: OptimizedGlassCardProps) {
  const baseClasses = cn(
    // Base glass effect
    "backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-lg",
    // Performance optimizations
    "transform-gpu notification-card",
    // Conditional hover effects
    hover && "glass-card-smooth cursor-pointer",
    // Additional classes
    className
  );

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={baseClasses}
      onClick={onClick}
      aria-label={ariaLabel}
      {...(onClick && { role: 'button', tabIndex: 0 })}
    >
      {children}
    </Component>
  );
});