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
              <Navigation />
              <main>
                <PageRouter />
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