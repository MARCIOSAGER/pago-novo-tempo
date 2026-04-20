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
import AdminEmail from "./pages/AdminEmail";
import AdminDiagnosticos from "./pages/AdminDiagnosticos";
import AdminDiagnosticoDetalhe from "./pages/AdminDiagnosticoDetalhe";
import AdminOrganizations from "./pages/AdminOrganizations";
import AdminOfertas from "./pages/AdminOfertas";
import AdminCompras from "./pages/AdminCompras";
import AdminAcessos from "./pages/AdminAcessos";
import CorporateHome from "./pages/corporate/CorporateHome";
import InviteAccept from "./pages/corporate/InviteAccept";
import CorporateLayout from "./components/corporate/CorporateLayout";
import EmployeeDashboard from "./pages/corporate/EmployeeDashboard";
import EmployeeDiagnostico from "./pages/corporate/EmployeeDiagnostico";
import EmployeeResults from "./pages/corporate/EmployeeResults";
import EmployeeHistory from "./pages/corporate/EmployeeHistory";
import HRDashboard from "./pages/corporate/HRDashboard";
import HRMembers from "./pages/corporate/HRMembers";
import HRReports from "./pages/corporate/HRReports";
import HRInvites from "./pages/corporate/HRInvites";
import Fundador from "./pages/Fundador";
import Mentoria from "./pages/Mentoria";
import Diagnostico from "./pages/Diagnostico";
import Obrigado from "./pages/Obrigado";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ProfilePage from "./pages/auth/ProfilePage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/privacidade"} component={PrivacyPolicy} />
      <Route path={"/termos"} component={TermsOfUse} />
      <Route path={"/cookies"} component={CookiePolicy} />
      <Route path={"/fundador"} component={Fundador} />
      <Route path={"/mentoria"} component={Mentoria} />
      <Route path={"/diagnostico"} component={Diagnostico} />
      <Route path={"/obrigado"} component={Obrigado} />

      {/* Auth routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password/:token" component={ResetPasswordPage} />
      <Route path="/profile" component={ProfilePage} />

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
      <Route path="/admin/email">
        <AdminLayout>
          <AdminEmail />
        </AdminLayout>
      </Route>
      <Route path="/admin/diagnosticos">
        <AdminLayout>
          <AdminDiagnosticos />
        </AdminLayout>
      </Route>
      <Route path="/admin/diagnosticos/:id">
        <AdminLayout>
          <AdminDiagnosticoDetalhe />
        </AdminLayout>
      </Route>
      <Route path="/admin/acessos">
        <AdminLayout>
          <AdminAcessos />
        </AdminLayout>
      </Route>
      <Route path="/admin/organizations">
        <AdminLayout>
          <AdminOrganizations />
        </AdminLayout>
      </Route>
      <Route path="/admin/ofertas">
        <AdminLayout>
          <AdminOfertas />
        </AdminLayout>
      </Route>
      <Route path="/admin/compras">
        <AdminLayout>
          <AdminCompras />
        </AdminLayout>
      </Route>

      {/* Corporate routes */}
      <Route path="/corporate/invite/:token" component={InviteAccept} />
      <Route path="/corporate/:slug/hr/convites">
        <CorporateLayout><HRInvites /></CorporateLayout>
      </Route>
      <Route path="/corporate/:slug/hr/membros">
        <CorporateLayout><HRMembers /></CorporateLayout>
      </Route>
      <Route path="/corporate/:slug/hr/relatorios">
        <CorporateLayout><HRReports /></CorporateLayout>
      </Route>
      <Route path="/corporate/:slug/hr">
        <CorporateLayout><HRDashboard /></CorporateLayout>
      </Route>
      <Route path="/corporate/:slug/diagnostico">
        <CorporateLayout><EmployeeDiagnostico /></CorporateLayout>
      </Route>
      <Route path="/corporate/:slug/resultados">
        <CorporateLayout><EmployeeResults /></CorporateLayout>
      </Route>
      <Route path="/corporate/:slug/historico">
        <CorporateLayout><EmployeeHistory /></CorporateLayout>
      </Route>
      <Route path="/corporate/:slug">
        <CorporateLayout><EmployeeDashboard /></CorporateLayout>
      </Route>
      <Route path="/corporate" component={CorporateHome} />

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
