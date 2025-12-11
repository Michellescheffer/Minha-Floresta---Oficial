import React from 'react';
import { Certificate } from './types';

interface CertificatesTabProps {
    certificates: Certificate[];
}

export function CertificatesTab({ certificates }: CertificatesTabProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Certificados Emitidos</h2>

            <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Número</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Projeto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Área</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {certificates.map((cert) => (
                                <tr key={cert.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{cert.certificate_number}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{cert.projects?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{cert.area_sqm}m²</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(cert.issue_date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${cert.status === 'issued'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {cert.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
