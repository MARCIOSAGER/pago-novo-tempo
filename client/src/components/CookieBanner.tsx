import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "pago_cookie_consent";

type ConsentLevel = "all" | "essential" | null;

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to avoid showing immediately on page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ level: "all", date: new Date().toISOString() }));
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ level: "essential", date: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
        >
          <div
            className="max-w-4xl mx-auto rounded-2xl shadow-2xl border p-6 md:p-8"
            style={{
              backgroundColor: "#1A2744",
              borderColor: "rgba(184,168,138,0.2)",
            }}
          >
            {/* Close button */}
            <button
              onClick={handleEssentialOnly}
              className="absolute top-4 right-4 p-1 rounded-full hover:opacity-70 transition-opacity"
              style={{ color: "rgba(250,250,248,0.5)" }}
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: "rgba(184,168,138,0.15)" }}>
                <Cookie size={24} style={{ color: "#B8A88A" }} />
              </div>

              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold mb-2" style={{ color: "#FAFAF8" }}>
                  Respeitamos sua privacidade
                </h3>
                <p className="font-body text-sm leading-relaxed mb-4" style={{ color: "rgba(250,250,248,0.7)" }}>
                  Utilizamos cookies para melhorar sua experiência na plataforma. Cookies essenciais são necessários para o funcionamento básico. Cookies de desempenho nos ajudam a entender como você usa o site, de forma anônima.
                </p>

                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4 p-4 rounded-lg text-sm space-y-3"
                    style={{ backgroundColor: "rgba(250,250,248,0.05)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold" style={{ color: "#FAFAF8" }}>Cookies Essenciais</p>
                        <p style={{ color: "rgba(250,250,248,0.5)" }}>Necessários para o funcionamento da plataforma</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(184,168,138,0.2)", color: "#B8A88A" }}>Sempre ativos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold" style={{ color: "#FAFAF8" }}>Cookies de Desempenho</p>
                        <p style={{ color: "rgba(250,250,248,0.5)" }}>Analytics anônimo para melhorias</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(184,168,138,0.2)", color: "#B8A88A" }}>Opcional</span>
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2.5 rounded-lg font-accent text-xs uppercase tracking-[0.15em] transition-all hover:opacity-90"
                    style={{ backgroundColor: "#B8A88A", color: "#1A2744" }}
                  >
                    Aceitar Todos
                  </button>
                  <button
                    onClick={handleEssentialOnly}
                    className="px-6 py-2.5 rounded-lg font-accent text-xs uppercase tracking-[0.15em] border transition-all hover:opacity-80"
                    style={{ borderColor: "rgba(250,250,248,0.2)", color: "#FAFAF8" }}
                  >
                    Apenas Essenciais
                  </button>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="font-accent text-xs uppercase tracking-[0.15em] underline underline-offset-4 transition-opacity hover:opacity-70"
                    style={{ color: "rgba(250,250,248,0.5)" }}
                  >
                    {showDetails ? "Ocultar detalhes" : "Ver detalhes"}
                  </button>
                </div>

                <p className="font-body text-xs mt-4" style={{ color: "rgba(250,250,248,0.4)" }}>
                  Ao continuar navegando, você concorda com o uso de cookies essenciais. Saiba mais em nossa{" "}
                  <Link href="/cookies">
                    <span className="underline cursor-pointer hover:opacity-80" style={{ color: "#B8A88A" }}>Política de Cookies</span>
                  </Link>{" "}
                  e{" "}
                  <Link href="/privacidade">
                    <span className="underline cursor-pointer hover:opacity-80" style={{ color: "#B8A88A" }}>Política de Privacidade</span>
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper to check consent level from other components
export function getCookieConsent(): ConsentLevel {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.level as ConsentLevel;
    }
  } catch {
    // ignore
  }
  return null;
}
