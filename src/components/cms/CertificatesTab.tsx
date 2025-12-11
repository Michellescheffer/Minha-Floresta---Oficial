import React from 'react';
import { FileCheck, Search, Award, Calendar, MapPin, QrCode } from 'lucide-react';
import { Certificate } from './types';
import { GlassCard } from '../GlassCard';
import { cmsTokens } from './constants';

interface CertificatesTabProps {
    certificates: Certificate[];
}

export function CertificatesTab({ certificates }: CertificatesTabProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className={`${cmsTokens.glass} p-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between`}>
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Certificados Emitidos
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Visualize e audite todos os certificados gerados na plataforma
                    </p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-xl border border-gray-100 shadow-sm">
                    <Award className="w-5 h-5 text-blue-500" />
                    <span className="text-2xl font-bold text-gray-800">{certificates.length}</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
                </div>
            </div>

            {certificates.length === 0 ? (
                <GlassCard className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-gray-200">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <FileCheck className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">Nenhum certificado emitido</h3>
                    <p className="text-gray-400 text-sm mt-1">Os certificados aparecerão aqui assim que forem gerados.</p>
                </GlassCard>
            ) : (
                <GlassCard className="overflow-hidden border-0 bg-white/40 backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100/50 bg-gray-50/30">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Número
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Projeto
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Área & Impacto
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/50">
                                {certificates.map((cert) => (
                                    <tr
                                        key={cert.id}
                                        className="hover:bg-blue-50/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                    <QrCode className="w-4 h-4" />
                                                </div>
                                                <span className="font-mono text-sm text-gray-900 font-medium">
                                                    {cert.certificate_number}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {cert.projects?.name || 'Projeto Desconhecido'}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                    <MapPin className="w-3 h-3" />
                                                    {cert.projects?.location || 'N/A'}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                                                    {cert.area_sqm} m²
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(cert.issue_date).toLocaleDateString('pt-BR')}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cert.status === 'issued'
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cert.status === 'issued' ? 'bg-green-500' : 'bg-red-500'
                                                    }`} />
                                                {cert.status === 'issued' ? 'Emitido' : 'Cancelado'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            )}
        </div>
    );
}
