import React from 'react';
import { motion } from 'motion/react';
import { Leaf, TreePine, Waves } from 'lucide-react';

interface EnhancedLoadingProps {
  message?: string;
  type?: 'default' | 'projects' | 'social' | 'blue-carbon' | 'donation';
  size?: 'sm' | 'md' | 'lg';
  showBackground?: boolean;
}

export function EnhancedLoading({ 
  message = 'Carregando...', 
  type = 'default',
  size = 'md',
  showBackground = true 
}: EnhancedLoadingProps) {
  
  const getIconAndColors = () => {
    switch (type) {
      case 'projects':
        return {
          icon: TreePine,
          primaryColor: 'text-green-600',
          secondaryColor: 'text-emerald-500',
          bgGradient: 'from-green-50/80 to-emerald-50/80'
        };
      case 'social':
        return {
          icon: Leaf,
          primaryColor: 'text-pink-600',
          secondaryColor: 'text-purple-500',
          bgGradient: 'from-pink-50/80 to-purple-50/80'
        };
      case 'blue-carbon':
        return {
          icon: Waves,
          primaryColor: 'text-blue-600',
          secondaryColor: 'text-cyan-500',
          bgGradient: 'from-blue-50/80 to-cyan-50/80'
        };
      case 'donation':
        return {
          icon: Leaf,
          primaryColor: 'text-pink-600',
          secondaryColor: 'text-rose-500',
          bgGradient: 'from-pink-50/80 to-rose-50/80'
        };
      default:
        return {
          icon: TreePine,
          primaryColor: 'text-green-600',
          secondaryColor: 'text-emerald-500',
          bgGradient: 'from-green-50/80 to-emerald-50/80'
        };
    }
  };

  const getSizes = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-8 h-8',
          icon: 'w-4 h-4',
          text: 'text-sm',
          spacing: 'space-y-2'
        };
      case 'lg':
        return {
          container: 'w-16 h-16',
          icon: 'w-8 h-8',
          text: 'text-lg',
          spacing: 'space-y-6'
        };
      default:
        return {
          container: 'w-12 h-12',
          icon: 'w-6 h-6',
          text: 'text-base',
          spacing: 'space-y-4'
        };
    }
  };

  const { icon: Icon, primaryColor, secondaryColor, bgGradient } = getIconAndColors();
  const { container, icon, text, spacing } = getSizes();

  const LoadingSpinner = () => (
    <div className={`relative ${container} flex items-center justify-center`}>
      {/* Outer ring */}
      <motion.div
        className={`absolute inset-0 border-2 border-transparent border-t-current ${primaryColor} rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Inner ring */}
      <motion.div
        className={`absolute inset-2 border-2 border-transparent border-b-current ${secondaryColor} rounded-full`}
        animate={{ rotate: -360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Center icon */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Icon className={`${icon} ${primaryColor}`} />
      </motion.div>
    </div>
  );

  const LoadingDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`w-2 h-2 rounded-full ${primaryColor} bg-current`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  if (!showBackground) {
    return (
      <div className={`flex flex-col items-center justify-center ${spacing}`}>
        <LoadingSpinner />
        {message && (
          <motion.p 
            className={`${text} text-gray-600 text-center`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>
        )}
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/95 to-white/90" />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 ${primaryColor} bg-current rounded-full opacity-20`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`flex flex-col items-center ${spacing}`}
        >
          <LoadingSpinner />
          
          {message && (
            <motion.p 
              className={`${text} text-gray-700 font-medium`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {message}
            </motion.p>
          )}
          
          <LoadingDots />
          
          {/* Additional context based on type */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="max-w-md mx-auto"
          >
            {type === 'projects' && (
              <p className="text-sm text-gray-600 leading-relaxed">
                Carregando projetos de reflorestamento verificados...
              </p>
            )}
            {type === 'social' && (
              <p className="text-sm text-gray-600 leading-relaxed">
                Carregando projetos de impacto social...
              </p>
            )}
            {type === 'blue-carbon' && (
              <p className="text-sm text-gray-600 leading-relaxed">
                Carregando projetos de carbono azul...
              </p>
            )}
            {type === 'donation' && (
              <p className="text-sm text-gray-600 leading-relaxed">
                Processando sua doação...
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// Componente simplificado para uso inline
export function InlineLoading({ 
  message = 'Carregando...', 
  type = 'default' 
}: Pick<EnhancedLoadingProps, 'message' | 'type'>) {
  return (
    <EnhancedLoading 
      message={message}
      type={type}
      size="sm"
      showBackground={false}
    />
  );
}

// Hook para controle de loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [loadingMessage, setLoadingMessage] = React.useState<string>('');
  const [loadingType, setLoadingType] = React.useState<EnhancedLoadingProps['type']>('default');

  const startLoading = (message?: string, type?: EnhancedLoadingProps['type']) => {
    setIsLoading(true);
    if (message) setLoadingMessage(message);
    if (type) setLoadingType(type);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
  };

  const updateLoading = (message: string, type?: EnhancedLoadingProps['type']) => {
    setLoadingMessage(message);
    if (type) setLoadingType(type);
  };

  return {
    isLoading,
    loadingMessage,
    loadingType,
    startLoading,
    stopLoading,
    updateLoading
  };
}