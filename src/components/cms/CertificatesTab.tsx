import { FileCheck, Award, Calendar, MapPin, QrCode } from 'lucide-react';
import { Certificate } from './types';
import { GlassCard } from '../GlassCard';

interface CertificatesTabProps {
    certificates: Certificate[];
}

export function CertificatesTab({ certificates }: CertificatesTabProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 tracking-tight">
                        Certificados Emitidos
                    </h2>
                    <p className="text-gray-500 text-base mt-2 font-medium">
                        Auditoria e rastreabilidade de todos os certificados gerados.
                    </p>
                </div>

                <GlassCard variant="flat" intensity="medium" className="flex items-center gap-4 px-6 py-3 border-emerald-100/50">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-xl shadow-inner">
                        <Award className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <span className="block text-2xl font-bold text-gray-900 leading-none">{certificates.length}</span>
                        <span className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest leading-none">Total Emitido</span>
                    </div>
                </GlassCard>
            </div>

            {certificates.length === 0 ? (
                <GlassCard variant="flat" className="p-16 text-center flex flex-col items-center justify-center border-dashed border-2 border-emerald-100/50 bg-white/30">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-900/5 ring-1 ring-white/60">
                        <FileCheck className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Nenhum certificado emitido</h3>
                    <p className="text-gray-500 text-base mt-2 max-w-sm mx-auto">
                        Os certificados aparecerão aqui automaticamente assim que forem gerados pelos usuários.
                    </p>
                </GlassCard>
            ) : (
                <GlassCard variant="solid" className="overflow-hidden border-white/50 bg-white/40 backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/40 bg-white/20">
                                    <th className="px-8 py-5 text-left text-[10px] font-bold text-emerald-800/60 uppercase tracking-[0.15em]">
                                        Número
                                    </th>
                                    <th className="px-8 py-5 text-left text-[10px] font-bold text-emerald-800/60 uppercase tracking-[0.15em]">
                                        Projeto / Local
                                    </th>
                                    <th className="px-8 py-5 text-left text-[10px] font-bold text-emerald-800/60 uppercase tracking-[0.15em]">
                                        Área
                                    </th>
                                    <th className="px-8 py-5 text-left text-[10px] font-bold text-emerald-800/60 uppercase tracking-[0.15em]">
                                        Data
                                    </th>
                                    <th className="px-8 py-5 text-left text-[10px] font-bold text-emerald-800/60 uppercase tracking-[0.15em]">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/30">
                                {certificates.map((cert) => (
                                    <tr
                                        key={cert.id}
                                        className="hover:bg-white/40 transition-colors duration-300 group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-white/50 text-emerald-600 group-hover:scale-110 transition-transform shadow-sm ring-1 ring-emerald-100/50">
                                                    <QrCode className="w-4 h-4" />
                                                </div>
                                                <span className="font-mono text-sm text-gray-700 font-medium tracking-tight">
                                                    {cert.certificate_number}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                                                    {cert.projects?.name || 'Projeto Desconhecido'}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                    <MapPin className="w-3 h-3 text-emerald-500/70" />
                                                    {cert.projects?.location || 'N/A'}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-8 py-5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50/50 text-emerald-700 text-xs font-bold border border-emerald-100/50 shadow-sm">
                                                {cert.area_sqm} m²
                                            </span>
                                        </td>

                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(cert.issue_date).toLocaleDateString('pt-BR')}
                                            </div>
                                        </td>

                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border shadow-sm ${cert.status === 'issued'
                                                ? 'bg-emerald-100/40 text-emerald-700 border-emerald-200/50'
                                                : 'bg-red-100/40 text-red-700 border-red-200/50'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cert.status === 'issued' ? 'bg-emerald-500' : 'bg-red-500'
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
