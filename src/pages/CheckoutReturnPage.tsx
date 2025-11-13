import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';

export default function CheckoutReturnPage() {
  const [status, setStatus] = useState<'loading'|'ok'|'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        // Parse session_id from hash query
        const hash = window.location.hash || '';
        const [, query = ''] = hash.replace(/^#/, '').split('?');
        const params = new URLSearchParams(query);
        const sessionId = params.get('session_id');
        if (!sessionId) {
          setStatus('error');
          toast.error('Sessão de pagamento não encontrada.');
          // Fallback: enviar ao dashboard
          window.location.hash = 'dashboard';
          return;
        }

        // Limpar o hash para evitar reprocesso
        params.delete('session_id');
        const newHash = '#checkout-return' + (params.toString() ? `?${params.toString()}` : '');
        history.replaceState(null, '', window.location.pathname + window.location.search + newHash);

        // Reconcile
        const url = `https://${projectId}.supabase.co/functions/v1/stripe-reconcile?session_id=${encodeURIComponent(sessionId)}`;
        const res = await fetch(url, { method: 'GET', headers: { 'Authorization': `Bearer ${publicAnonKey}` } });
        if (!res.ok) throw new Error('Falha ao reconciliar pagamento');
        const data = await res.json();
        if (cancelled) return;
        setStatus('ok');
        toast.success('Pagamento confirmado!');
        
        // Try to get the certificate number and redirect to visualizar-certificado
        try {
          if (data.email) {
            const dashUrl = `https://${projectId}.supabase.co/functions/v1/user-dashboard?email=${encodeURIComponent(data.email)}`;
            const dashRes = await fetch(dashUrl, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } });
            if (dashRes.ok) {
              const dashData = await dashRes.json();
              const latestCert = dashData.certificates?.[0];
              if (latestCert?.certificate_number) {
                // Redirect to certificate visualization
                window.location.hash = `visualizar-certificado?numero=${encodeURIComponent(latestCert.certificate_number)}`;
                return;
              }
            }
          }
        } catch {}
        
        // Fallback: redirect to dashboard
        window.location.hash = 'dashboard';
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        toast.error('Não foi possível confirmar o pagamento.');
        window.location.hash = 'dashboard?p=purchases';
      }
    };
    // Rodar no próximo frame para evitar alterações na primeira renderização
    const raf = requestAnimationFrame(run);
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="min-h-screen pt-56 sm:pt-52 pb-16 sm:pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-blue-50/80"></div>
      <div className="relative z-10 max-w-xl mx-auto px-6 text-center">
        <h1 className="text-gray-800 mb-4">Confirmando pagamento...</h1>
        <p className="text-gray-600">{status === 'loading' ? 'Aguarde, estamos validando sua compra.' : status === 'ok' ? 'Redirecionando ao seu painel...' : 'Redirecionando ao painel...'}</p>
      </div>
    </div>
  );
}
