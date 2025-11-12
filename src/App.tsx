import { useEffect } from "react";
import { AppProvider, useApp } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SupabaseProvider } from "./contexts/SupabaseContext";
import { Navigation } from "./components/Navigation";
import { PageRouter } from "./components/PageRouter";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import { SEOHead } from "./components/SEOHead";
import { NotificationProvider } from "./components/NotificationSystem";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { initializeErrorHandler } from "./utils/errorHandler";
import { supabase } from "./services/supabaseClient";
import { toast } from "sonner";

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
              <main>
                <ErrorBoundary>
                  <PageRouter />
                </ErrorBoundary>
              </main>
              <Footer />
              <Toaster
                position="top-right"
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
  const { setCurrentPage } = useApp();
  useEffect(() => {
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
      supabase.auth.setSession({ access_token, refresh_token }).then(() => {
        toast.success("E-mail confirmado!");
        history.replaceState(null, "", window.location.pathname + window.location.search);
        setCurrentPage("dashboard");
      }).catch(() => {
        toast.error("Não foi possível conectar. Tente fazer login novamente.");
        history.replaceState(null, "", window.location.pathname + window.location.search);
      });
    }
  }, [setCurrentPage]);
  return null;
}