/**
 * ✅ Checkout Success Page
 * Página de confirmação após pagamento bem-sucedido
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, FileText, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { supabase } from '../services/supabaseClient';
import { formatBRL } from '../utils/supabase/stripeConfig';

interface PaymentDetails {
  type: 'purchase' | 'donation';
  amount: number;
  area?: number;
  certificates: Array<{
    id: string;
    certificate_number: string;
    area_sqm: number;
    project_name: string;
  }>;
  email: string;
}

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Support hash-based routing: extract params from window.location.hash when searchParams are empty
  const { paymentIntentId, paymentIntentClientSecret } = useMemo(() => {
    let id = searchParams.get('payment_intent');
    let secret = searchParams.get('payment_intent_client_secret');
    if (!id || !secret) {
      const hash = window.location.hash || '';
      // Expected formats:
      // #checkout-success?payment_intent=pi_...&payment_intent_client_secret=...
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const query = new URLSearchParams(hash.substring(qIndex + 1));
        id = id || query.get('payment_intent') || undefined as any;
        secret = secret || query.get('payment_intent_client_secret') || undefined as any;
      }
    }
    return { paymentIntentId: id || null, paymentIntentClientSecret: secret || null };
  }, [searchParams]);

  useEffect(() => {
    if (!paymentIntentId) {
      setError('Informações de pagamento não encontradas');
      setLoading(false);
      return;
    }

    loadPaymentDetails();
  }, [paymentIntentId]);

  const loadPaymentDetails = async () => {
    try {
      setLoading(true);

      // Buscar payment intent
      const { data: paymentIntent, error: piError } = await supabase
        .from('stripe_payment_intents')
        .select('*, purchases(*), donations(*)')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (piError || !paymentIntent) {
        throw new Error('Pagamento não encontrado');
      }

      // Determinar tipo
      const type = paymentIntent.purchase_id ? 'purchase' : 'donation';

      if (type === 'purchase') {
        // Buscar certificados
        const { data: certificates } = await supabase
          .from('certificates')
          .select(`
            id,
            certificate_number,
            area_sqm,
            pdf_url,
            projects(name)
          `)
          .eq('purchase_id', paymentIntent.purchase_id)
          .eq('status', 'issued');

        setPaymentDetails({
          type: 'purchase',
          amount: paymentIntent.amount,
          area: certificates?.reduce((sum, cert) => sum + cert.area_sqm, 0) || 0,
          certificates: certificates?.map(cert => ({
            id: cert.id,
            certificate_number: cert.certificate_number,
            area_sqm: cert.area_sqm,
            project_name: (cert.projects as any)?.name || 'Projeto',
            pdf_url: (cert as any).pdf_url || null,
          })) || [],
          email: paymentIntent.purchases?.email || '',
        });
      } else {
        setPaymentDetails({
          type: 'donation',
          amount: paymentIntent.amount,
          certificates: [],
          email: paymentIntent.donations?.donor_email || '',
        });
      }

    } catch (err) {
      console.error('Error loading payment details:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto" />
          <p className="text-gray-600">Confirmando pagamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/loja')} className="w-full">
            Voltar à Loja
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xl animate-in fade-in zoom-in duration-500">
            <CheckCircle className="w-12 h-12" />
          </div>
          
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl text-gray-900">
              {paymentDetails?.type === 'purchase' ? 'Compra Confirmada!' : 'Doação Recebida!'}
            </h1>
            <p className="text-xl text-gray-600">
              Pagamento processado com sucesso
            </p>
          </div>
        </div>

        {/* Payment Summary */}
        <Card className="glass-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <span className="text-gray-600">Valor Pago</span>
              <span className="text-3xl text-gray-900">
                {formatBRL(paymentDetails?.amount || 0)}
              </span>
            </div>

            {paymentDetails?.type === 'purchase' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Área Total</span>
                  <span className="text-xl text-green-600">
                    {paymentDetails.area}m²
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Certificados Gerados</span>
                  <span className="text-xl text-gray-900">
                    {paymentDetails.certificates.length}
                  </span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email de Confirmação</span>
              <span className="text-sm text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {paymentDetails?.email}
              </span>
            </div>
          </div>
        </Card>

        {/* Certificates (Para compras) */}
        {paymentDetails?.type === 'purchase' && paymentDetails.certificates.length > 0 && (
          <Card className="glass-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <h2 className="text-2xl text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              Seus Certificados
            </h2>

            <div className="space-y-4">
              {paymentDetails.certificates.map((cert, index) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                >
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">
                      {cert.project_name}
                    </div>
                    <div className="font-mono text-sm text-gray-900">
                      {cert.certificate_number}
                    </div>
                    <div className="text-sm text-green-600">
                      {cert.area_sqm}m²
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigate(`/certificado/${cert.certificate_number}`)}
                  >
                    <Download className="w-4 h-4" />
                    Baixar
                  </Button>
                </div>
              ))}
            </div>

            <Alert className="mt-6 bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                📧 Os certificados também foram enviados para seu email
              </AlertDescription>
            </Alert>
          </Card>
        )}

        {/* Impact Message */}
        <Card className="glass-card p-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <h3 className="text-2xl mb-3">🌱 Obrigado por fazer a diferença!</h3>
          {paymentDetails?.type === 'purchase' ? (
            <p className="text-green-50 leading-relaxed">
              Você acaba de contribuir para a preservação de <strong>{paymentDetails.area}m²</strong> de floresta. 
              Sua ação ajuda a capturar CO₂, proteger a biodiversidade e combater as mudanças climáticas.
            </p>
          ) : (
            <p className="text-green-50 leading-relaxed">
              Sua doação faz parte de um movimento global pela preservação ambiental. 
              Juntos, estamos construindo um futuro mais verde e sustentável!
            </p>
          )}
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="gap-2 h-14"
          >
            Ver Meu Painel
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          <Button
            size="lg"
            onClick={() => navigate('/loja')}
            className="gap-2 h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            Continuar Comprando
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Share */}
        <div className="text-center space-y-2 animate-in fade-in duration-700 delay-600">
          <p className="text-gray-600">Compartilhe sua contribuição:</p>
          <div className="flex items-center justify-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const text = `Acabei de contribuir para preservação de ${paymentDetails?.area}m² de floresta! 🌱`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
              }}
            >
              Twitter
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const text = `Acabei de contribuir para preservação de ${paymentDetails?.area}m² de floresta! 🌱`;
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`, '_blank');
              }}
            >
              Facebook
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
