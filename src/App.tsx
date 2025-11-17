import { useEffect, useRef } from "react";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SupabaseProvider } from "./contexts/SupabaseContext";
import { Navigation } from "./components/Navigation";
import { PageRouter } from "./components/PageRouter";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import { SEOHead } from "./components/SEOHead";
import { NotificationProvider } from "./components/NotificationSystem";
import { initializeErrorHandler } from "./utils/errorHandler";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { supabase } from "./services/supabaseClient";
import { toast } from "sonner";

// Pre-render cleanup: remove session_id from hash to avoid re-entrant effects on first render
if (typeof window !== 'undefined') {
  try {
    const hash = window.location.hash || '';
    if (hash) {
      const [path, query = ''] = hash.replace(/^#/, '').split('?');
      const params = new URLSearchParams(query);
      // Não remover o session_id quando estamos na rota de retorno do checkout
      if (path !== 'checkout-return' && params.has('session_id')) {
        params.delete('session_id');
        const newHash = '#' + path + (params.toString() ? `?${params.toString()}` : '');
        history.replaceState(null, '', window.location.pathname + window.location.search + newHash);
      }
    }
  } catch {}
}

export default function App() {
  // Initialize error handler
  initializeErrorHandler();

  return (
    <SupabaseProvider>
      <AppProvider>
        <AuthProvider>
          <NotificationProvider>
            <SEOHead />
            <div className="min-h-screen">
              <SessionHashHandler />
              <Navigation />
              <main className="pt-40 sm:pt-44 lg:pt-48">
                <ErrorBoundary>
                  <PageRouter />
                </ErrorBoundary>
              </main>
              <Footer />
              <Toaster
                position="bottom-right"
                closeButton={true}
                richColors={true}
                expand={false}
                visibleToasts={2}
              />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </AppProvider>
    </SupabaseProvider>
  );
}

function SessionHashHandler() {
  const ranRef = useRef(false);
  useEffect(() => {
    if (ranRef.current) return;
    const h = window.location.hash || "";
    if (!h) return;
    const params = new URLSearchParams(h.startsWith("#") ? h.slice(1) : h);
    const err = params.get("error") || "";
    const errCode = params.get("error_code") || "";
    if (err === "access_denied" || errCode === "otp_expired") {
      toast.error("Link de confirmação inválido ou expirado.");
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return;
    }
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (access_token && refresh_token) {
      ranRef.current = true;
      supabase.auth.setSession({ access_token, refresh_token }).then(() => {
        toast.success("E-mail confirmado!");
        history.replaceState(null, "", window.location.pathname + window.location.search);
        // Evita depender de contextos aqui; usa hash para navegar
        window.location.hash = "dashboard";
      }).catch(() => {
        toast.error("Não foi possível conectar. Tente fazer login novamente.");
        history.replaceState(null, "", window.location.pathname + window.location.search);
      });
    }
  }, []);
  return null;
}