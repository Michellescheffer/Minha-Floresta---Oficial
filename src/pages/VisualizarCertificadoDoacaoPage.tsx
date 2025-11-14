import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Award, Calendar, DollarSign, Heart, Download, Share2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DonationCertificate {
  id: string;
  certificate_number: string;
  donor_name: string;
  donor_email: string;
  donation_amount: number;
  donation_date: string;
  message?: string;
  is_anonymous: boolean;
  donation_project?: {
    title: string;
    description: string;
    image_url?: string;
  };
}

export function VisualizarCertificadoDoacaoPage() {
  const [searchParams] = useSearchParams();
  const certificateNumber = searchParams.get('numero');
  
  const [certificate, setCertificate] = useState<DonationCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (certificateNumber) {
      loadCertificate();
    }
  }, [certificateNumber]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('donation_certificates')
        .select(`
          *,
          donation_project:donation_projects(title, description, image_url)
        `)
        .eq('certificate_number', certificateNumber)
        .single();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Certificado não encontrado');
        return;
      }

      setCertificate(data);
    } catch (err: any) {
      console.error('Error loading certificate:', err);
      setError('Erro ao carregar certificado');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Certificado de Doação - Minha Floresta',
          text: `Confira meu certificado de doação: ${certificate?.certificate_number}`,
          url: url
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificado não encontrado</h2>
          <p className="text-gray-600 mb-6">
            O certificado de doação que você está procurando não existe ou foi removido.
          </p>
          <a
            href="/#home"
            className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Voltar ao Início
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mb-6 print:hidden">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Baixar PDF
          </button>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with decorative pattern */}
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            
            <div className="relative text-center">
              <div className="inline-block p-4 bg-white/20 rounded-full mb-4">
                <Heart className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Certificado de Doação</h1>
              <p className="text-green-100">Minha Floresta - Compensação de Carbono</p>
            </div>
          </div>

          {/* Certificate Content */}
          <div className="p-8 md:p-12">
            {/* Certificate Number */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-mono font-semibold text-green-700">
                  {certificate.certificate_number}
                </span>
              </div>
            </div>

            {/* Main Text */}
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 mb-4">
                Certificamos que
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {certificate.is_anonymous ? 'Doador Anônimo' : certificate.donor_name}
              </h2>
              <p className="text-lg text-gray-700">
                realizou uma doação no valor de
              </p>
              <div className="text-4xl font-bold text-green-600 my-4">
                R$ {certificate.donation_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              {certificate.donation_project && (
                <p className="text-lg text-gray-700">
                  para o projeto <span className="font-semibold">{certificate.donation_project.title}</span>
                </p>
              )}
            </div>

            {/* Project Image */}
            {certificate.donation_project?.image_url && (
              <div className="mb-8 rounded-xl overflow-hidden">
                <img 
                  src={certificate.donation_project.image_url} 
                  alt={certificate.donation_project.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Message */}
            {certificate.message && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-gray-700 italic text-center">
                  "{certificate.message}"
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Data da Doação</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(certificate.donation_date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Valor Doado</p>
                  <p className="font-semibold text-gray-900">
                    R$ {certificate.donation_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Este certificado é válido e pode ser verificado em
              </p>
              <p className="text-sm font-mono text-green-600">
                minhafloresta.com.br/verificar-doacao?numero={certificate.certificate_number}
              </p>
            </div>

            {/* Thank You Message */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl text-center">
              <Heart className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Obrigado por fazer a diferença!
              </h3>
              <p className="text-gray-700">
                Sua contribuição ajuda a preservar e restaurar nossas florestas,
                combatendo as mudanças climáticas e protegendo a biodiversidade.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8 print:hidden">
          <a
            href="/#home"
            className="inline-block px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Voltar ao Início
          </a>
        </div>
      </div>
    </div>
  );
}
