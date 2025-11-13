import { useEffect, useState } from 'react';
import { Search, Download, CheckCircle, Calendar, MapPin, Award, Copy, QrCode, AlertTriangle, Database } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useCertificates, type Certificate } from '../hooks/useCertificates';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Badge } from '../components/ui/badge';

export function VerificarCertificadoPage() {
  const [certificateCode, setCertificateCode] = useState('');
  const [error, setError] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [verifying, setVerifying] = useState(false);
  const { verifyCertificate } = useCertificates();

  const handleSearch = async () => {
    if (!certificateCode.trim()) {
      setError('Por favor, insira o código do certificado');
      return;
    }

    setError('');
    setCertificate(null);
    setVerifying(true);

    try {
      const foundCertificate = await verifyCertificate(certificateCode.trim());
      
      if (foundCertificate) {
        setCertificate(foundCertificate);
        setError('');
      } else {
        setError('Certificado não encontrado. Verifique o código e tente novamente.');
      }
    } catch (error) {
      setError('Erro ao verificar certificado. Tente novamente.');
    } finally {
      setVerifying(false);
    }
  };

  // Auto-verificar via hash: #verificar-certificado?numero=XXXX
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (!hash) return;
    const match = hash.match(/numero=([^&]+)/i);
    if (!match) return;
    const code = decodeURIComponent(match[1]).toUpperCase();
    (async () => {
      setVerifying(true);
      setError('');
      setCertificateCode(code);
      try {
        const found = await verifyCertificate(code);
        if (found) {
          setCertificate(found);
        } else {
          setError('Certificado não encontrado. Verifique o código e tente novamente.');
        }
      } catch (_) {
        setError('Erro ao verificar certificado. Tente novamente.');
      } finally {
        setVerifying(false);
      }
    })();
  }, []);

  const handleCopyCode = () => {
    if (certificate) {
      const code = certificate.certificateNumber || certificateCode;
      navigator.clipboard.writeText(code);
      alert('Código copiado para a área de transferência!');
    }
  };

  const handleDownload = () => {
    if (!certificate) return;
    const code = certificate.certificateNumber || certificateCode;
    // Se existir URL do PDF no backend, baixar diretamente
    if (certificate.pdfUrl) {
      const link = document.createElement('a');
      link.href = certificate.pdfUrl;
      link.download = `certificado-${code}.pdf`;
      link.click();
      return;
    }
    // Fallback: abrir diálogo de impressão para salvar em PDF
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'expired': return 'Expirado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="min-h-screen page-content">
      {/* Background */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxmb3Jlc3QlMjBuYXR1cmUlMjBncmVlbnxlbnwxfHx8fDE3NTU4ODQ0OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Forest background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-emerald-50/90 to-teal-50/90"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full mb-6">
            <QrCode className="w-4 h-4 text-green-600" />
            <span className="text-green-700">Verificar Certificado</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-medium text-gray-800 mb-6">
            Verifique seu
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Certificado Digital
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Insira o código enviado por e-mail para verificar a autenticidade do seu 
            certificado de compensação de carbono.
          </p>
          
          {/* Indicador de banco de dados */}
          <div className="flex justify-center mt-6">
            <Badge 
              variant="secondary" 
              className="bg-blue-100 text-blue-800 px-3 py-1"
            >
              <Database className="w-3 h-3 mr-1" />
              Sistema de verificação seguro
            </Badge>
          </div>
        </div>

        {/* Search Section */}
        <GlassCard className="p-8 mb-8">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-gray-800 mb-6 text-center">Código do Certificado</h3>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={certificateCode}
                  onChange={(e) => setCertificateCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ex: ECO2024-AMZ-001"
                  className="w-full pl-10 pr-4 py-4 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 text-lg font-mono"
                />
              </div>
              
              <button
                onClick={handleSearch}
                disabled={verifying}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
                <span>{verifying ? 'Verificando...' : 'Verificar'}</span>
              </button>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-50/50 border border-red-200/50 rounded-lg text-red-700">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="text-center text-sm text-gray-600">
              <p>💡 O código foi enviado para seu e-mail após a compra</p>
            </div>
          </div>
        </GlassCard>

        {/* Certificate Details */}
        {certificate && (
          <div className="space-y-8">
            {/* Status Banner */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-gray-800">Certificado Verificado</h3>
                    <p className="text-gray-600">Este certificado é válido e autêntico</p>
                  </div>
                </div>
                
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(certificate.status || 'active')}`}>
                  {getStatusText(certificate.status || 'active')}
                </div>
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Certificate Info */}
              <div className="lg:col-span-2 space-y-6">
                <GlassCard className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-gray-800">Detalhes do Certificado</h3>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Copiar código</span>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-gray-600 text-sm">Código do Certificado</label>
                        <div className="text-gray-800 font-mono bg-gray-50/50 p-3 rounded-lg">
                          {certificate.certificateNumber}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-gray-600 text-sm">ID da Transação</label>
                        <div className="text-gray-800 font-mono bg-gray-50/50 p-3 rounded-lg">
                          {'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-gray-600 text-sm">Beneficiário</label>
                        <div className="text-gray-800 bg-gray-50/50 p-3 rounded-lg">
                          {certificate.buyerName || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-gray-600 text-sm">E-mail</label>
                        <div className="text-gray-800 bg-gray-50/50 p-3 rounded-lg">
                          {certificate.buyerEmail || 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-gray-600 text-sm">Projeto</label>
                      <div className="text-gray-800 bg-gray-50/50 p-3 rounded-lg flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{certificate.projectName || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-8">
                  <h3 className="text-gray-800 mb-6">Compensação Ambiental</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-green-50/50 rounded-lg">
                      <div className="text-3xl font-medium text-green-600 mb-2">
                        {(certificate.area || 0).toLocaleString()}
                      </div>
                      <div className="text-gray-600">metros quadrados</div>
                    </div>
                    
                    <div className="text-center p-6 bg-blue-50/50 rounded-lg">
                      <div className="text-3xl font-medium text-blue-600 mb-2">
                        {(certificate.co2Offset || 0).toLocaleString()}
                      </div>
                      <div className="text-gray-600">kg CO₂ compensados</div>
                    </div>
                    
                    <div className="text-center p-6 bg-emerald-50/50 rounded-lg">
                      <div className="text-3xl font-medium text-emerald-600 mb-2">
                        R$ {(certificate.price || 0).toLocaleString()}
                      </div>
                      <div className="text-gray-600">valor investido</div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-8">
                  <h3 className="text-gray-800 mb-6">Informações de Validade</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-gray-600 text-sm">Data de Emissão</div>
                        <div className="text-gray-800">{formatDate(certificate.issueDate)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-gray-600 text-sm">Válido até</div>
                        <div className="text-gray-800">{formatDate(certificate.validUntil)}</div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* QR Code & Actions */}
              <div className="space-y-6">
                <GlassCard className="p-6 text-center">
                  <h4 className="text-gray-800 mb-4">QR Code de Verificação</h4>
                  <div className="w-48 h-48 mx-auto mb-4 bg-white p-4 rounded-lg">
                    <img
                      src={certificate.qrCode || 'https://via.placeholder.com/200x200?text=QR+Code'}
                      alt="QR Code do certificado"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-gray-600 text-sm">
                    Escaneie para verificar rapidamente
                  </p>
                </GlassCard>

                <GlassCard className="p-6">
                  <h4 className="text-gray-800 mb-4">Ações</h4>
                  <div className="space-y-3">
                    <button
                      onClick={handleDownload}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download PDF</span>
                    </button>
                    
                    <button
                      onClick={handleCopyCode}
                      className="w-full border-2 border-green-500/30 text-green-600 py-3 rounded-lg hover:bg-green-500/10 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Copy className="w-5 h-5" />
                      <span>Copiar Código</span>
                    </button>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Award className="w-5 h-5 text-green-600" />
                    <h4 className="text-gray-800">Certificação</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Este certificado é emitido em conformidade com padrões internacionais 
                    de compensação de carbono e possui validade legal.
                  </p>
                </GlassCard>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <GlassCard className="p-8 mt-12">
          <h3 className="text-gray-800 mb-6 text-center">Precisa de Ajuda?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-gray-800 mb-2">Não encontrou seu código?</h4>
              <p className="text-gray-600 text-sm">Verifique sua caixa de spam ou entre em contato conosco</p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-gray-800 mb-2">Problemas no download?</h4>
              <p className="text-gray-600 text-sm">Verifique seu navegador ou tente novamente mais tarde</p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-gray-800 mb-2">Dúvidas sobre o certificado?</h4>
              <p className="text-gray-600 text-sm">Entre em contato com nosso suporte técnico</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300">
              Falar com Suporte
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}