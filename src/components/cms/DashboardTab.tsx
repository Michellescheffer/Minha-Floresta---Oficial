
import {
    TreePine, ShoppingCart, DollarSign, Award, Users, TrendingUp,
    Sparkles, LayoutGrid, Plus, Image as ImageIcon, CreditCard, BadgeCheck, ChevronRight
} from 'lucide-react';
import { cmsTokens } from './constants';
import { DashboardStats } from './types';
import { GlassCard } from '../GlassCard';

interface DashboardTabProps {
    stats: DashboardStats;
    loading: boolean;
}

export function DashboardTab({ stats, loading }: DashboardTabProps) {
    const statCards = [
        {
            title: 'Total de Projetos',
            value: stats.totalProjects,
            icon: TreePine,
            color: 'from-emerald-500 to-teal-500',
            trend: '+12%',
        },
        {
            title: 'Vendas Totais',
            value: stats.totalSales,
            icon: ShoppingCart,
            color: 'from-cyan-500 to-sky-500',
            trend: '+8%',
        },
        {
            title: 'Receita Total',
            value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`,
            icon: DollarSign,
            color: 'from-purple-500 to-pink-500',
            trend: '+15%',
        },
        {
            title: 'Certificados Emitidos',
            value: stats.totalCertificates,
            icon: Award,
            color: 'from-orange-500 to-rose-500',
        },
        {
            title: 'Usuários Ativos',
            value: stats.activeUsers,
            icon: Users,
            color: 'from-indigo-500 to-purple-500',
        },
        {
            title: 'Crescimento Mensal',
            value: `${stats.monthlyGrowth}%`,
            icon: TrendingUp,
            color: 'from-teal-500 to-green-500',
            trend: '↑',
        },
    ];

    const quickActions = [
        {
            title: 'Novo Projeto',
            description: 'Cadastre uma nova iniciativa e publique no site.',
            icon: Plus,
        },
        {
            title: 'Atualizar Hero',
            description: 'Envie novas fotos para o banner principal.',
            icon: ImageIcon,
        },
        {
            title: 'Gerar Certificado',
            description: 'Emita certificados de forma manual.',
            icon: BadgeCheck,
        },
        {
            title: 'Configurar Stripe',
            description: 'Revise as chaves e webhooks de pagamento.',
            icon: CreditCard,
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {statCards.map((card) => (
                    <StatCard key={card.title} {...card} isLoading={loading} />
                ))}
            </div>

            <GlassCard
                variant="solid"
                intensity="high"
                className="p-8 grid gap-8 xl:grid-cols-[2fr,3fr] border-white/50"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                        <p className={cmsTokens.heading}>Resumo rápido</p>
                    </div>

                    <div className="space-y-4">
                        <GlassCard variant="flat" intensity="medium" className="p-4 flex items-center gap-4">
                            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 shadow-inner">
                                <DollarSign className="w-7 h-7" />
                            </span>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Receita acumulada</p>
                                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                                    R$ {stats.totalRevenue.toLocaleString('pt-BR')}
                                </p>
                            </div>
                        </GlassCard>

                        <GlassCard variant="flat" intensity="medium" className="p-4 flex items-center gap-4">
                            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 text-amber-600 shadow-inner">
                                <LayoutGrid className="w-7 h-7" />
                            </span>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Projetos publicados</p>
                                <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.totalProjects}</p>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 text-sm text-emerald-800/80 leading-relaxed font-medium">
                        Acompanhe o desempenho em tempo real. Os números são atualizados automaticamente a cada nova transação.
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickActions.map((action) => (
                        <button
                            key={action.title}
                            type="button"
                            className="group p-5 text-left rounded-3xl border border-white/40 bg-white/40 hover:bg-white/60 backdrop-blur-md hover:-translate-y-1 hover:border-emerald-200/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 ring-1 ring-white/30"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-white/60 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <p className="font-bold text-gray-800 text-lg mb-1 group-hover:text-emerald-900 transition-colors">{action.title}</p>
                            <p className="text-sm text-gray-500 group-hover:text-gray-600 font-medium">{action.description}</p>
                        </button>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, trend, isLoading }: any) {
    if (isLoading) {
        return (
            <GlassCard variant="flat" className="h-40 animate-pulse">
                <div className="h-full w-full bg-gradient-to-r from-white/40 via-white/20 to-white/40 rounded-3xl" />
            </GlassCard>
        );
    }

    return (
        <GlassCard
            hoverEffect
            variant="solid"
            className="group p-6 overflow-hidden relative cursor-default"
        >
            <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.05] group-hover:opacity-[0.12] rounded-full blur-2xl transition-all duration-500 group-hover:scale-150`} />

            <div className="relative flex flex-col gap-6 z-10">
                <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${color} shadow-lg shadow-emerald-900/10 ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    {trend && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full backdrop-blur-sm border border-emerald-200/50">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {trend}
                        </span>
                    )}
                </div>
                <div>
                    <p className={cmsTokens.heading}>{title}</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-2 tracking-tight group-hover:text-emerald-900 transition-colors">{value}</p>
                </div>
            </div>
        </GlassCard>
    );
}
