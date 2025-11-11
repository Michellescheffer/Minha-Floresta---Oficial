/**
 * ✅ Checkout Success Page
 * Página de confirmação após pagamento bem-sucedido
 */

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Download, FileText, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { supabase } from '../services/supabaseClient';
import { formatBRL, STRIPE_EDGE_FUNCTION_URL } from '../utils/supabase/stripeConfig';
import { publicAnonKey } from '../utils/supabase/info';
import { useApp } from '../contexts/AppContext';

interface PaymentDetails {
  type: 'purchase' | 'donation';
  amount: number;
  area?: number;
  certificates: Array<{
    id: string;
    certificate_number: string;
    area_sqm: number;
    project_name: string;
    pdf_url?: string | null;
  }>;
  email: string;
}

export default function CheckoutSuccessPage() {
  const { setCurrentPage } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  // Support hash-based routing: extract params from window.location.hash when searchParams are empty
  const { paymentIntentId, paymentIntentClientSecret, sessionId } = useMemo(() => {
    const hash = window.location.hash || '';
    const qIndex = hash.indexOf('?');
    let id: string | null = null;
    let secret: string | null = null;
    let session: string | null = null;
    if (qIndex !== -1) {
      const query = new URLSearchParams(hash.substring(qIndex + 1));
      id = query.get('payment_intent');
      secret = query.get('payment_intent_client_secret');
      session = query.get('session_id');
    }
    return { paymentIntentId: id, paymentIntentClientSecret: secret, sessionId: session };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        // If we didn't get payment_intent, try resolving from session_id (Hosted Checkout) with retries
        if (!paymentIntentId && sessionId) {
          let resolvedPi: string | null = null;
          let attempt = 0;
          const maxAttempts = 10;
          while (attempt < maxAttempts) {
            const resp = await fetch(`${STRIPE_EDGE_FUNCTION_URL}/stripe-session?session_id=${encodeURIComponent(sessionId)}`, {
              headers: { 'Authorization': `Bearer ${publicAnonKey}` },
            });
            const data = await resp.json().catch(() => ({}));
            if (resp.ok && data && data.payment_intent_id) {
              resolvedPi = data.payment_intent_id as string;
              break;
            }
            attempt += 1;
            const waitMs = Math.min(1000 * attempt, 8000);
            await new Promise(res => setTimeout(res, waitMs));
          }

          if (resolvedPi) {
            // Instant reconcile before any polling
            try {
              const params = new URLSearchParams();
              params.set('payment_intent_id', resolvedPi);
              await fetch(`${STRIPE_EDGE_FUNCTION_URL}/stripe-reconcile?${params.toString()}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${publicAnonKey}` },
              }).catch(() => {});
            } catch {}
            await loadPaymentDetails(resolvedPi);
            return;
          }
          throw new Error('Não foi possível confirmar o pagamento');
        }

        if (!paymentIntentId) {
          setError('Informações de pagamento não encontradas');
          setLoading(false);
          return;
        }

        // If we already have payment_intent_id, reconcile first to speed up
        try {
          const params = new URLSearchParams();
          params.set('payment_intent_id', paymentIntentId);
          await fetch(`${STRIPE_EDGE_FUNCTION_URL}/stripe-reconcile?${params.toString()}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          }).catch(() => {});
        } catch {}

        await loadPaymentDetails(paymentIntentId);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao confirmar pagamento');
        setLoading(false);
      }
    })();
  }, [paymentIntentId, sessionId, reloadTick]);

  const loadPaymentDetails = async (piId: string) => {
    try {
      setLoading(true);

      // Tentar buscar rapidamente e acionar reconciliação cedo
      let paymentIntent: any = null;
      let attempt = 0;
      const maxAttempts = 6;
      while (attempt < maxAttempts) {
        const { data, error: piError } = await supabase
          .from('stripe_payment_intents')
          .select('*, purchases(*), donations(*)')
          .eq('stripe_payment_intent_id', piId)
          .single();
        if (!piError && data) {
          paymentIntent = data;
          break;
        }
        // Reconciliar imediatamente na primeira falha para reduzir espera
        if (attempt === 0) {
          try {
            const params = new URLSearchParams();
            if (sessionId) params.set('session_id', sessionId);
            else params.set('payment_intent_id', piId);
            await fetch(`${STRIPE_EDGE_FUNCTION_URL}/stripe-reconcile?${params.toString()}`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${publicAnonKey}` },
            }).catch(() => {});
          } catch {}
        }
        // esperar e tentar novamente (0.5s,0.8s,1.2s,1.8s,2.5s,3.5s)
        attempt += 1;
        const backoffs = [500, 800, 1200, 1800, 2500, 3500];
        const waitMs = backoffs[Math.min(attempt - 1, backoffs.length - 1)];
        await new Promise(res => setTimeout(res, waitMs));
      }

      if (!paymentIntent) {
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
          {(sessionId || paymentIntentId) && (
            <Card className="p-3 bg-yellow-50 border-yellow-200 text-yellow-800 text-xs text-left">
              <div className="space-y-1">
                <div><span className="font-medium">session_id:</span> {sessionId || '—'}</div>
                <div><span className="font-medium">payment_intent:</span> {paymentIntentId || '—'}</div>
              </div>
            </Card>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button onClick={() => { window.location.hash = 'loja'; }} className="w-full" variant="outline">
              Voltar à Loja
            </Button>
            <Button onClick={() => { setLoading(true); setError(null); setReloadTick(t => t + 1); }} className="w-full">
              Tentar novamente
            </Button>
          </div>
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

        {(sessionId || paymentIntentId) && (
          <Card className="p-4 bg-yellow-50 border-yellow-200 text-yellow-800 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="font-medium">session_id:</span> {sessionId || '—'}
              </div>
              <div>
                <span className="font-medium">payment_intent:</span> {paymentIntentId || '—'}
              </div>
            </div>
          </Card>
        )}

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
                    onClick={() => {
                      if ((cert as any).pdf_url) {
                        const link = document.createElement('a');
                        link.href = (cert as any).pdf_url as string;
                        link.download = `certificado-${cert.certificate_number}.pdf`;
                        link.click();
                        return;
                      }
                      window.location.hash = `verificar-certificado?numero=${encodeURIComponent(cert.certificate_number)}`;
                    }}
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
            onClick={() => { window.location.hash = 'dashboard'; setCurrentPage('dashboard'); }}
            className="gap-2 h-14"
          >
            Ver Meu Painel
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          <Button
            size="lg"
            onClick={() => { window.location.hash = 'loja'; setCurrentPage('loja'); }}
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
