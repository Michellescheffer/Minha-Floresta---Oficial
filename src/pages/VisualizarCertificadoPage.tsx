import { useEffect, useState } from 'react';
import { Download, QrCode, Calendar, MapPin, Award } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useCertificates, type Certificate } from '../hooks/useCertificates';

export default function VisualizarCertificadoPage() {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { verifyCertificate } = useCertificates();

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const match = hash.match(/numero=([^&]+)/i);
    const numero = match ? decodeURIComponent(match[1]).replace(/\s+/g, '').toUpperCase() : '';
    setCode(numero);
    if (!numero) {
      setLoading(false);
      setError('Código do certificado ausente.');
      return;
    }
    (async () => {
      try {
        const found = await verifyCertificate(numero);
        if (found) setCertificate(found);
        else setError('Certificado não encontrado.');
      } catch (_) {
        setError('Erro ao carregar certificado.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDownload = () => {
    if (!certificate) return;
    const filename = `certificado-${certificate.certificateNumber || code}.pdf`;
    if (certificate.pdfUrl) {
      const link = document.createElement('a');
      link.href = certificate.pdfUrl;
      link.download = filename;
      link.click();
      return;
    }
    window.print();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-56 sm:pt-52 pb-16 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-green-50/80 to-emerald-50/80"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen pt-56 sm:pt-52 pb-16 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-green-50/80 to-emerald-50/80"></div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <p className="text-red-600">{error || 'Certificado não encontrado.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-56 sm:pt-52 pb-16 sm:pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-green-50/80 to-emerald-50/80 print:bg-white"></div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-gray-800">Certificado</h1>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-700 rounded-lg hover:bg-blue-500/30 transition-colors print:hidden"
          >
            <Download className="w-4 h-4" />
            {certificate.pdfUrl ? 'Baixar PDF' : 'Salvar em PDF'}
          </button>
        </div>

        <GlassCard className="p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-gray-800 font-semibold mb-1">{certificate.projectName || 'Projeto'}</h2>
              <p className="text-gray-600 text-sm mb-4">Código: {certificate.certificateNumber || code}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-gray-600 text-sm">Área</p>
                  <p className="text-gray-800 font-medium">{certificate.area} m²</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">CO₂ Compensado</p>
                  <p className="text-gray-800 font-medium">{Math.round((certificate.area || 0) * 22)} kg</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Emitido em</p>
                  <p className="text-gray-800 font-medium">{formatDate(certificate.issueDate)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Válido até</p>
                  <p className="text-gray-800 font-medium">{formatDate(certificate.validUntil)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/40 rounded-xl border border-white/50">
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Projeto</span>
                  </div>
                  <p className="text-gray-800">{certificate.projectName || 'Projeto'}</p>
                </div>
                <div className="p-4 bg-white/40 rounded-xl border border-white/50">
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Emissão</span>
                  </div>
                  <p className="text-gray-800">{formatDate(certificate.issueDate)}</p>
                </div>
                <div className="p-4 bg-white/40 rounded-xl border border-white/50">
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <Award className="w-4 h-4" />
                    <span>Status</span>
                  </div>
                  <p className="text-gray-800">{certificate.status || 'issued'}</p>
                </div>
              </div>
            </div>
            <div className="w-36 shrink-0 flex flex-col items-center gap-2">
              <div className="w-36 h-36 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <QrCode className="w-20 h-20 text-gray-500" />
              </div>
              <span className="text-xs text-gray-500 text-center">Escaneie para verificar</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
