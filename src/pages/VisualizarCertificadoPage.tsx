import { useEffect, useState } from 'react';
import { Download, QrCode, Calendar, MapPin, Award } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useCertificates, type Certificate } from '../hooks/useCertificates';

export default function VisualizarCertificadoPage() {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string>('');
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
        if (found) {
          setCertificate(found);
        } else {
          // Fallback: synthetic certificate from PENDENTE- code
          if (numero.startsWith('PENDENTE-')) {
            // Extract area from synthetic data if possible
            const syntheticCert: Certificate = {
              id: 'synth-temp',
              projectId: '',
              projectName: 'Projeto',
              buyerName: '',
              buyerEmail: '',
              area: 0,
              price: 0,
              issueDate: new Date().toISOString().split('T')[0],
              status: 'active',
              certificateNumber: numero,
              qrCode: '',
              co2Offset: 0,
              validUntil: '',
            };
            setCertificate(syntheticCert);
          } else {
            setError('Certificado não encontrado.');
          }
        }
      } catch (_) {
        setError('Erro ao carregar certificado.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleGeneratePdf = async () => {
    if (!certificate || !certificate.id || certificate.id.startsWith('synth-')) return;
    setGeneratingPdf(true);
    setPdfError('');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
      
      const response = await fetch('https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/certificate-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ***REMOVED***'
        },
        body: JSON.stringify({ certificate_id: certificate.id }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Falha ao gerar PDF');
      
      const data = await response.json();
      if (data.pdf_url) {
        // Update certificate with new PDF URL
        setCertificate({ ...certificate, pdfUrl: data.pdf_url });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setPdfError('Tempo esgotado. Tente novamente.');
      } else {
        setPdfError('Erro ao gerar PDF. Tente novamente.');
      }
    } finally {
      setGeneratingPdf(false);
    }
  };

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
          <div className="flex gap-2 print:hidden">
            {!code.startsWith('PENDENTE-') && !certificate.pdfUrl && (
              <button
                onClick={handleGeneratePdf}
                disabled={generatingPdf}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-700 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingPdf ? (
                  <>
                    <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Gerar PDF Oficial
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-700 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              {certificate.pdfUrl ? 'Baixar PDF' : 'Salvar em PDF'}
            </button>
          </div>
        </div>

        {pdfError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{pdfError}</p>
          </div>
        )}

        {code.startsWith('PENDENTE-') && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⏳ <strong>Certificado em processamento:</strong> Os dados completos serão atualizados em breve. Você já pode visualizar e salvar em PDF.
            </p>
          </div>
        )}

        <GlassCard className="p-8 bg-white/90 border-2 border-green-200">
          {/* Header do Certificado */}
          <div className="text-center mb-8 border-b-2 border-green-200 pb-6">
            <h2 className="text-3xl font-bold text-green-700 mb-2">Certificado de Compensação de Carbono</h2>
            <p className="text-gray-600">Minha Floresta Conservações</p>
          </div>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-1">Certificamos que</p>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{certificate.buyerName || 'Titular do Certificado'}</h3>
                <p className="text-gray-600">contribuiu para a preservação ambiental através do projeto:</p>
                <h4 className="text-xl font-semibold text-green-700 mt-2">{certificate.projectName || 'Projeto'}</h4>
              </div>
              <p className="text-gray-600 text-xs mb-6">Código de Verificação: <span className="font-mono font-semibold">{certificate.certificateNumber || code}</span></p>

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
