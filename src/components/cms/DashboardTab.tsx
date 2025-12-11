import React from 'react';
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {statCards.map((card) => (
                    <StatCard key={card.title} {...card} isLoading={loading} />
                ))}
            </div>

            <GlassCard className="p-6 grid gap-6 xl:grid-cols-[2fr,3fr] border-0 bg-white/40 backdrop-blur-md">
                <div className="space-y-5">
                    <p className={cmsTokens.heading}>Resumo rápido</p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                                <Sparkles className="w-5 h-5" />
                            </span>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Receita acumulada</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    R$ {stats.totalRevenue.toLocaleString('pt-BR')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
                                <LayoutGrid className="w-5 h-5" />
                            </span>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Projetos publicados</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 leading-relaxed max-w-md">
                        Acompanhe o desempenho em tempo real e use os atalhos para manter a plataforma
                        sempre atualizada. Os números são recalculados ao clicar em “Atualizar”.
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickActions.map((action) => (
                        <button
                            key={action.title}
                            type="button"
                            className="group p-4 text-left rounded-2xl border border-white/40 bg-white/50 hover:bg-white/80 backdrop-blur hover:-translate-y-0.5 hover:border-emerald-200 transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <action.icon className="w-4 h-4" />
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                            </div>
                            <p className="font-semibold text-gray-900">{action.title}</p>
                            <p className="text-sm text-gray-500 mt-1">{action.description}</p>
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
            <GlassCard className="h-36 animate-pulse">
                <div className="h-full w-full bg-gradient-to-r from-white/60 to-white/30 rounded-2xl" />
            </GlassCard>
        );
    }

    return (
        <GlassCard
            className="relative overflow-hidden p-6 hover:-translate-y-1 transition-all duration-300 group border-0 bg-white/40 backdrop-blur-md"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`} />
            <div className="relative flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg shadow-black/5`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    {trend && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            <TrendingUp className="w-3 h-3" />
                            {trend}
                        </span>
                    )}
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{value}</p>
                </div>
            </div>
        </GlassCard>
    );
}
