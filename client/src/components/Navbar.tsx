import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, Settings, Shield, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import LanguageSelector from "@/components/LanguageSelector";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-logo_ea5770c3.jpeg";

// Routes that are NOT the homepage — these have light backgrounds and need dark nav text always
function isLightBgRoute(pathname: string): boolean {
  return pathname !== "/";
}

export default function Navbar() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [scrolledInternal, setScrolledInternal] = useState(false);
  // Force "scrolled" styling on non-home routes so nav text has proper contrast
  const scrolled = scrolledInternal || isLightBgRoute(location);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { label: t.nav.about, href: "/#sobre" },
    { label: t.nav.mentoria, href: "/mentoria" },
    { label: t.nav.diagnostico, href: "/diagnostico" },
    { label: t.nav.pillars, href: "/#pilares" },
    { label: t.nav.jefferson, href: "/#jefferson" },
    { label: t.nav.kit, href: "/#kit" },
    { label: t.nav.kids, href: "/#kids" },
    { label: t.nav.faq, href: "/#faq" },
    { label: t.nav.corporate, href: "/corporate" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolledInternal(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-warm-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 xl:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 shrink-0 mr-4 xl:mr-8">
              <img
                src={LOGO_URL}
                alt="P.A.G.O Novo Tempo"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="hidden sm:block lg:hidden xl:block">
                <span className={`font-display text-xl font-semibold tracking-wide transition-colors duration-500 ${
                  scrolled ? "text-navy" : "text-warm-white"
                }`}>
                  P.A.G.O
                </span>
                <span className={`block font-accent text-[10px] uppercase tracking-[0.3em] transition-colors duration-500 ${
                  scrolled ? "text-blue-muted" : "text-warm-white/70"
                }`}>
                  {t.nav.tagline}
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`font-accent text-[9px] xl:text-[11px] 2xl:text-xs uppercase tracking-[0.1em] xl:tracking-[0.15em] whitespace-nowrap transition-colors duration-300 ${
                    scrolled
                      ? "text-navy/70 hover:text-navy"
                      : "text-warm-white/80 hover:text-warm-white"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <LanguageSelector scrolled={scrolled} />
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-300 ${
                      scrolled ? "hover:bg-navy/10" : "hover:bg-warm-white/10"
                    }`}
                  >
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      scrolled ? "bg-navy text-warm-white" : "bg-warm-white/20 text-warm-white border border-warm-white/40"
                    }`}>
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className={`font-accent text-[10px] xl:text-[11px] hidden xl:inline transition-colors duration-300 ${
                      scrolled ? "text-navy/70" : "text-warm-white/80"
                    }`}>
                      {user.name?.split(" ")[0] || ""}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border z-50 py-2">
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-medium text-navy truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <a href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Settings className="h-4 w-4" /> Meu Perfil
                        </a>
                        <a href="/minhas-compras" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <ShoppingBag className="h-4 w-4" /> Minhas Compras
                        </a>
                        {user.role === "admin" && (
                          <a href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                            <Shield className="h-4 w-4" /> Painel Admin
                          </a>
                        )}
                        <button
                          onClick={() => { setUserMenuOpen(false); logout(); window.location.href = "/"; }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" /> Sair
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <a
                  href="/#inscricao"
                  className={`font-accent text-[9px] xl:text-[11px] 2xl:text-xs uppercase tracking-[0.1em] xl:tracking-[0.15em] px-3 xl:px-5 py-2.5 whitespace-nowrap shrink-0 transition-colors duration-300 ${
                    scrolled
                      ? "bg-navy text-warm-white hover:bg-navy-light"
                      : "bg-warm-white/20 text-warm-white border border-warm-white/40 hover:bg-warm-white/30"
                  }`}
                >
                  {t.nav.subscribe}
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 transition-colors duration-500 ${
                scrolled ? "text-navy" : "text-warm-white"
              }`}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-warm-white pt-24 px-8"
          >
            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-3xl text-navy hover:text-gold transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="gold-line mt-4" />
              {/* Mobile Language Selector */}
              <div className="flex justify-center">
                <LanguageSelector variant="mobile" />
              </div>
              {user ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-10 w-10 rounded-full bg-navy flex items-center justify-center text-warm-white font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {user.role === "admin" && (
                    <a href="/admin" onClick={() => setMobileOpen(false)} className="font-accent text-sm uppercase tracking-[0.2em] bg-navy text-warm-white px-8 py-3 text-center hover:bg-navy-light transition-colors">
                      Painel Admin
                    </a>
                  )}
                  <button
                    onClick={() => { setMobileOpen(false); logout(); window.location.href = "/"; }}
                    className="font-accent text-sm uppercase tracking-[0.2em] border border-red-300 text-red-600 px-8 py-3 text-center hover:bg-red-50 transition-colors"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <a
                  href="/#inscricao"
                  onClick={() => setMobileOpen(false)}
                  className="font-accent text-sm uppercase tracking-[0.2em] bg-navy text-warm-white px-8 py-4 text-center hover:bg-navy-light transition-colors"
                >
                  {t.nav.subscribeMobile}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
