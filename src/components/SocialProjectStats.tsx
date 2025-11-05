import React from 'react';
import { motion } from 'motion/react';
import { Target, Users, Coins, HandHeart, TrendingUp, Calendar, Award, Globe } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface SocialProjectStatsProps {
  stats: {
    activeProjects: number;
    totalBeneficiaries: number;
    totalBudget: number;
    totalSpent: number;
    totalDonations: number;
    executionRate: number;
  };
  animated?: boolean;
}

export function SocialProjectStats({ stats, animated = true }: SocialProjectStatsProps) {
  const {
    activeProjects,
    totalBeneficiaries,
    totalBudget,
    totalSpent,
    totalDonations,
    executionRate
  } = stats;

  const statsData = [
    {
      label: 'Projetos Ativos',
      value: activeProjects.toString(),
      icon: Target,
      color: 'green',
      bgColor: 'bg-green-50/80',
      iconColor: 'text-green-600',
      description: 'Projetos em andamento'
    },
    {
      label: 'Beneficiários',
      value: totalBeneficiaries.toLocaleString(),
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50/80',
      iconColor: 'text-blue-600',
      description: 'Pessoas impactadas diretamente'
    },
    {
      label: 'Investimento',
      value: `R$ ${(totalBudget / 1000).toFixed(0)}k`,
      icon: Coins,
      color: 'purple',
      bgColor: 'bg-purple-50/80',
      iconColor: 'text-purple-600',
      description: 'Orçamento total destinado'
    },
    {
      label: 'Doações Recebidas',
      value: `R$ ${(totalDonations / 1000).toFixed(0)}k`,
      icon: HandHeart,
      color: 'pink',
      bgColor: 'bg-pink-50/80',
      iconColor: 'text-pink-600',
      description: 'Contribuições da comunidade'
    },
    {
      label: 'Taxa de Execução',
      value: `${Math.round(executionRate)}%`,
      icon: TrendingUp,
      color: 'emerald',
      bgColor: 'bg-emerald-50/80',
      iconColor: 'text-emerald-600',
      description: 'Progresso dos investimentos'
    }
  ];

  const MotionCard = animated ? motion.div : 'div';

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-20">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <MotionCard
            key={stat.label}
            {...(animated && {
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              transition: { duration: 0.6, delay: index * 0.1 },
              whileHover: { 
                scale: 1.05,
                transition: { duration: 0.2 }
              }
            })}
          >
            <GlassCard className="p-6 text-center group hover:scale-105 transition-all duration-300 relative overflow-hidden">
              {/* Background gradient */}
              <div className={`absolute inset-0 ${stat.bgColor} opacity-30 rounded-2xl`} />
              
              <div className="relative z-10">
                {/* Icon with floating animation */}
                <motion.div 
                  className="flex justify-center mb-4"
                  {...(animated && {
                    animate: { y: [0, -3, 0] },
                    transition: { 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: index * 0.5
                    }
                  })}
                >
                  <div className={`p-3 ${stat.bgColor} rounded-xl shadow-lg`}>
                    <Icon className={`w-8 h-8 ${stat.iconColor}`} />
                  </div>
                </motion.div>

                {/* Value with counter animation */}
                <motion.div 
                  className="text-3xl font-bold text-gray-800 mb-2"
                  {...(animated && {
                    initial: { scale: 0.8, opacity: 0 },
                    whileInView: { scale: 1, opacity: 1 },
                    transition: { delay: index * 0.1 + 0.3, duration: 0.5 }
                  })}
                >
                  {stat.value}
                </motion.div>

                {/* Label */}
                <div className="text-gray-600 text-sm font-medium mb-2">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-xs text-gray-500 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                  {stat.description}
                </div>

                {/* Progress indicator for execution rate */}
                {stat.label === 'Taxa de Execução' && (
                  <motion.div 
                    className="mt-3 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden"
                    {...(animated && {
                      initial: { scaleX: 0 },
                      whileInView: { scaleX: 1 },
                      transition: { delay: index * 0.1 + 0.5, duration: 1 }
                    })}
                  >
                    <motion.div 
                      className="bg-gradient-to-r from-emerald-400 to-green-500 h-1.5 rounded-full"
                      {...(animated && {
                        initial: { width: 0 },
                        whileInView: { width: `${Math.min(executionRate, 100)}%` },
                        transition: { delay: index * 0.1 + 0.7, duration: 1.5 }
                      })}
                      style={!animated ? { width: `${Math.min(executionRate, 100)}%` } : {}}
                    />
                  </motion.div>
                )}
              </div>
            </GlassCard>
          </MotionCard>
        );
      })}
    </div>
  );
}

// Componente adicional para estatísticas em formato compacto
export function CompactSocialStats({ stats }: { stats: SocialProjectStatsProps['stats'] }) {
  const compactStats = [
    {
      label: 'Projetos',
      value: stats.activeProjects,
      icon: Target,
      color: 'text-green-600'
    },
    {
      label: 'Beneficiários',
      value: `${(stats.totalBeneficiaries / 1000).toFixed(1)}k`,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Doações',
      value: `R$ ${(stats.totalDonations / 1000).toFixed(0)}k`,
      icon: HandHeart,
      color: 'text-pink-600'
    },
    {
      label: 'Execução',
      value: `${Math.round(stats.executionRate)}%`,
      icon: TrendingUp,
      color: 'text-emerald-600'
    }
  ];

  return (
    <div className="flex items-center justify-center space-x-8 mb-8">
      {compactStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="text-center">
            <div className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center space-x-1 mt-1">
              <Icon className="w-4 h-4" />
              <span>{stat.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Hook para calcular estatísticas dos projetos sociais
export function useSocialProjectStats(projects: any[]) {
  return React.useMemo(() => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    
    const totalBudget = safeProjects.reduce((sum, p) => sum + (p?.budget || 0), 0);
    const totalSpent = safeProjects.reduce((sum, p) => sum + (p?.spent || 0), 0);
    const totalBeneficiaries = safeProjects.reduce((sum, p) => sum + (p?.beneficiaries || 0), 0);
    const activeProjects = safeProjects.filter(p => p?.status === 'active').length;
    const totalDonations = safeProjects.reduce((sum, p) => sum + (p?.donationsReceived || 0), 0);
    const executionRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      activeProjects,
      totalBeneficiaries,
      totalBudget,
      totalSpent,
      totalDonations,
      executionRate
    };
  }, [projects]);
}