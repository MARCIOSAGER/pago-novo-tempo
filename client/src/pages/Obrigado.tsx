import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

function getQueryParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export default function Obrigado() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const sessionId = getQueryParam("session_id");
  const copy = t.diagnostico.thankYou;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/15 mb-8">
              <CheckCircle2 className="h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>

            <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
              P.A.G.O.
            </p>

            <h1 className="font-display text-3xl lg:text-5xl font-semibold text-navy leading-[1.15] mb-6">
              {copy.headline}
            </h1>

            <div className="w-16 h-[1px] bg-gold mx-auto mb-6" />

            <p className="font-body text-base lg:text-lg leading-relaxed text-navy/70 mb-10 max-w-xl mx-auto">
              {copy.subheadline}
            </p>

            <div className="inline-flex items-center gap-2 bg-white border border-navy/10 px-5 py-3 mb-10">
              <Mail className="h-4 w-4 text-navy/50" />
              <span className="font-accent text-xs uppercase tracking-[0.15em] text-navy/70">
                {copy.nextStep}
              </span>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="font-accent text-xs uppercase tracking-[0.2em] bg-navy text-warm-white px-8 py-4 hover:bg-navy-dark transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {copy.backHome}
              </button>
            </div>

            {sessionId && (
              <p className="mt-12 font-mono text-[10px] text-navy/30 break-all">
                Ref: {sessionId}
              </p>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
