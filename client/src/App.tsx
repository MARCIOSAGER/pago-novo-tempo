import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import CookiePolicy from "./pages/CookiePolicy";
import CookieBanner from "./components/CookieBanner";
import PagoChatBot from "./components/PagoChatBot";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInscricoes from "./pages/AdminInscricoes";
import AdminInscricaoDetalhe from "./pages/AdminInscricaoDetalhe";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminDownloads from "./pages/AdminDownloads";
import AdminMediaRepo from "./pages/AdminMediaRepo";
import AdminKids from "./pages/AdminKids";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/privacidade"} component={PrivacyPolicy} />
      <Route path={"/termos"} component={TermsOfUse} />
      <Route path={"/cookies"} component={CookiePolicy} />

      {/* Admin routes — wrapped in AdminLayout with sidebar */}
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/inscricoes">
        <AdminLayout>
          <AdminInscricoes />
        </AdminLayout>
      </Route>
      <Route path="/admin/inscricoes/:id">
        <AdminLayout>
          <AdminInscricaoDetalhe />
        </AdminLayout>
      </Route>
      <Route path="/admin/analytics">
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      </Route>
      <Route path="/admin/downloads">
        <AdminLayout>
          <AdminDownloads />
        </AdminLayout>
      </Route>
      <Route path="/admin/media">
        <AdminLayout>
          <AdminMediaRepo />
        </AdminLayout>
      </Route>
      <Route path="/admin/kids">
        <AdminLayout>
          <AdminKids />
        </AdminLayout>
      </Route>

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieBanner />
          <PagoChatBot />
        </TooltipProvider>
      </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
