import { useEffect, useState } from 'react';
import { Download, Calendar, MapPin, Award } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useCertificates, type Certificate } from '../hooks/useCertificates';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'qrcode';
import logoImage from 'figma:asset/f9a96b4548f250beba1ee29ba9d3267b1c5a7b61.png';

export default function VisualizarCertificadoPage() {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string>('');
  const [enrichedData, setEnrichedData] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { verifyCertificate } = useCertificates();
  const { user } = useAuth();

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
          // Try to enrich with user-dashboard data
          if (found.buyerEmail) {
            try {
              const dashRes = await fetch(`https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/user-dashboard?email=${encodeURIComponent(found.buyerEmail)}`, {
                headers: { 'Authorization': 'Bearer ***REMOVED***' }
              });
              if (dashRes.ok) {
                const dashData = await dashRes.json();
                setEnrichedData(dashData);
                // Find matching certificate in dashboard data
                const matchingCert = dashData.certificates?.find((c: any) => c.certificate_number === numero);
                if (matchingCert) {
                  found.area = matchingCert.area_sqm || found.area;
                  found.projectName = matchingCert.project_name || found.projectName;
                }
              }
            } catch {}
          }
        } else {
          // Fallback: synthetic certificate (numeric token without official DB record)
          // Use authenticated user email or try to extract from payment intent
          const emailToUse = user?.email || 'destaquewmarketing@gmail.com';
            try {
              const dashRes = await fetch(`https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/user-dashboard?email=${encodeURIComponent(emailToUse)}`, {
                headers: { 'Authorization': 'Bearer ***REMOVED***' }
              });
              if (dashRes.ok) {
                const dashData = await dashRes.json();
                console.log('Dashboard data for synthetic cert:', dashData);
                console.log('Looking for cert:', numero);
                setEnrichedData(dashData);
                // Normalize both sides for comparison
                const matchingCert = dashData.certificates?.find((c: any) => {
                  const certNum = String(c.certificate_number || '').trim().toUpperCase();
                  const searchNum = numero.trim().toUpperCase();
                  return certNum === searchNum;
                });
                console.log('Matching cert found:', matchingCert);
                if (matchingCert) {
                  const syntheticCert: Certificate = {
                    id: 'synth-temp',
                    projectId: '',
                    projectName: matchingCert.project_name || 'Projeto',
                    buyerName: user?.name || '',
                    buyerEmail: emailToUse,
                    area: matchingCert.area_sqm || 0,
                    price: 0,
                    issueDate: matchingCert.issued_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                    status: 'active',
                    certificateNumber: numero,
                    qrCode: '',
                    co2Offset: Math.round((matchingCert.area_sqm || 0) * 22),
                    validUntil: '',
                    isSynthetic: true,
                  };
                  setCertificate(syntheticCert);
                } else {
                  // No matching cert, create empty one
                  const syntheticCert: Certificate = {
                    id: 'synth-temp',
                    projectId: '',
                    projectName: 'Projeto',
                    buyerName: user?.name || '',
                    buyerEmail: emailToUse,
                    area: 0,
                    price: 0,
                    issueDate: new Date().toISOString().split('T')[0],
                    status: 'active',
                    certificateNumber: numero,
                    qrCode: '',
                    co2Offset: 0,
                    validUntil: '',
                    isSynthetic: true,
                  };
                  setCertificate(syntheticCert);
                }
              }
            } catch {}
          setError('Certificado não encontrado.');
        }
      } catch (_) {
        setError('Erro ao carregar certificado.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Generate QR Code when certificate is loaded
  useEffect(() => {
    if (certificate?.certificateNumber) {
      const verifyUrl = `https://minha-floresta.vercel.app/#verificar-certificado?numero=${encodeURIComponent(certificate.certificateNumber)}`;
      QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(url => {
        setQrCodeUrl(url);
      }).catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [certificate]);

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

  const handleDownload = async () => {
    if (!certificate) return;
    const filename = `certificado-${certificate.certificateNumber || code}.pdf`;
    
    // If PDF already exists, download it
    if (certificate.pdfUrl) {
      const link = document.createElement('a');
      link.href = certificate.pdfUrl;
      link.download = filename;
      link.click();
      return;
    }
    
    // If no PDF and it's a synthetic cert, generate it first
    if (certificate.id.startsWith('synth-')) {
      setPdfError('Certificado ainda em processamento. Aguarde a materialização.');
      return;
    }
    
    // Generate PDF via backend
    await handleGeneratePdf();
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
            {certificate.pdfUrl ? (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-700 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Baixar PDF
              </button>
            ) : (
              <button
                onClick={handleDownload}
                disabled={generatingPdf || certificate?.isSynthetic}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-700 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingPdf ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Gerar e Baixar PDF
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {pdfError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{pdfError}</p>
          </div>
        )}

        {certificate?.isSynthetic && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⏳ <strong>Certificado em processamento:</strong> Os dados completos serão atualizados em breve. Você já pode visualizar e salvar em PDF.
            </p>
          </div>
        )}

        <GlassCard className="p-8 bg-white/90 border-2 border-green-200">
          {/* Header do Certificado com Logo */}
          <div className="flex items-center justify-between mb-8 border-b-2 border-green-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-24 h-24 flex items-center justify-center">
                <img 
                  src={logoImage} 
                  alt="Minha Floresta" 
                  className="w-full h-full object-contain brightness-0"
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Certificado de</p>
              <p className="text-lg font-bold text-green-700">Compensação de Carbono</p>
            </div>
          </div>

          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              {/* Token Único de Verificação */}
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">Token de Verificação Único</p>
                <p className="text-xl font-mono font-bold text-green-900 break-all">{certificate.certificateNumber || code}</p>
              </div>

              {/* Informações do Titular */}
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-2">Certificamos que</p>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  {certificate.buyerName || user?.name || certificate.buyerEmail?.split('@')[0] || 'Titular do Certificado'}
                </h3>
                {certificate.buyerEmail && (
                  <p className="text-sm text-gray-500">{certificate.buyerEmail}</p>
                )}
              </div>

              {/* Área Adquirida */}
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-gray-600 mb-1">Área de Preservação Adquirida</p>
                <p className="text-3xl font-bold text-blue-700">{certificate.area} m²</p>
                <p className="text-sm text-gray-600 mt-1">equivalente a {Math.round((certificate.area || 0) * 22)} kg de CO₂ compensado</p>
              </div>

              {/* Projeto(s) */}
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-2">através do(s) projeto(s):</p>
                <div className="flex flex-wrap gap-2">
                  <div className="px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
                    <p className="text-lg font-semibold text-green-800">{certificate.projectName || 'Projeto de Reflorestamento'}</p>
                  </div>
                </div>
              </div>

              {/* Datas e Status */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs uppercase">Data de Emissão</span>
                  </div>
                  <p className="text-gray-800 font-semibold">{formatDate(certificate.issueDate)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs uppercase">Status</span>
                  </div>
                  <p className="text-gray-800 font-semibold">{certificate.status === 'active' ? 'Ativo' : certificate.status || 'Emitido'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs uppercase">Válido até</span>
                  </div>
                  <p className="text-gray-800 font-semibold">
                    {certificate.validUntil ? formatDate(certificate.validUntil) : 'Indeterminado'}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-36 shrink-0 flex flex-col items-center gap-2">
              <div className="w-36 h-36 bg-white rounded-xl border border-gray-200 flex items-center justify-center p-2">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded" />
                )}
              </div>
              <span className="text-xs text-gray-500 text-center">Escaneie para verificar</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
