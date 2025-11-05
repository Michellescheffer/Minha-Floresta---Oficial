import React from 'react';
import { Loader2, Leaf } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface GlassLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showIcon?: boolean;
  overlay?: boolean;
  className?: string;
}

export function GlassLoading({ 
  size = 'md', 
  message = 'Carregando...', 
  showIcon = true,
  overlay = false,
  className = ''
}: GlassLoadingProps) {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const LoadingContent = () => (
    <GlassCard className={`${sizeClasses[size]} ${className} glass-card-static`}>
      <div className="flex flex-col items-center justify-center space-y-3">
        {showIcon && (
          <div className="relative">
            <Loader2 className={`${iconSizes[size]} text-green-600 animate-spin`} />
            <div className="absolute inset-0 animate-pulse">
              <Leaf className={`${iconSizes[size]} text-green-400 opacity-30`} />
            </div>
          </div>
        )}
        
        {message && (
          <p className={`${textSizes[size]} text-gray-700 font-medium glass-text-contrast`}>
            {message}
          </p>
        )}
        
        {/* Shimmer effect line */}
        <div className="w-20 h-1 bg-gradient-to-r from-green-200 via-green-400 to-green-200 rounded-full animate-shimmer" />
      </div>
    </GlassCard>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
}

// Componente específico para loading de página
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center page-content">
      <GlassLoading 
        size="lg" 
        message="Carregando página..." 
        className="bg-white/15 border-white/25"
      />
    </div>
  );
}

// Componente para loading inline menor
export function InlineLoading({ message = 'Processando...' }: { message?: string }) {
  return (
    <div className="flex items-center space-x-2 text-green-600">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

// Loading específico para botões
export function ButtonLoading({ children = 'Carregando...' }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center space-x-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{children}</span>
    </div>
  );
}