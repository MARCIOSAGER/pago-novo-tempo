import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface DiagnosticoHeroSectionProps {
  nome: string;
  onStart: (nome: string) => void;
  hasSavedState: boolean;
  onContinue: () => void;
  onRestart: () => void;
}

export default function DiagnosticoHeroSection({
  nome,
  onStart,
  hasSavedState,
  onContinue,
  onRestart,
}: DiagnosticoHeroSectionProps) {
  const { t } = useLanguage();
  const [inputNome, setInputNome] = useState(nome);

  const handleStart = () => {
    if (inputNome.trim().length < 2) {
      toast.error(t.diagnostico.hero.nameRequired);
      return;
    }
    onStart(inputNome.trim());
  };

  return (
    <section className="bg-gradient-to-b from-navy-dark via-navy to-navy-light/90 pt-32 pb-20 lg:pb-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Link href="/">
          <span className="inline-flex items-center gap-2 font-accent text-xs uppercase tracking-[0.2em] text-gold hover:text-gold-light transition-colors mb-10 cursor-pointer">
            <ArrowLeft size={14} /> {t.diagnostico.hero.backToHome}
          </span>
        </Link>

        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6"
          >
            {t.diagnostico.hero.label}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl lg:text-6xl font-semibold text-warm-white leading-[1.1] mb-6"
          >
            {t.diagnostico.hero.titleLine1}
            <br />
            <span className="text-gold">{t.diagnostico.hero.titleLine2}</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="w-16 h-[1px] bg-gold mb-8" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-body text-lg text-warm-white/70 leading-relaxed max-w-2xl mb-4"
          >
            {t.diagnostico.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="inline-flex items-center gap-2 font-accent text-[10px] uppercase tracking-[0.3em] text-warm-white/40 mb-10"
          >
            <Clock size={12} />
            {t.diagnostico.hero.badge}
          </motion.div>

          {/* Saved state dialog */}
          {hasSavedState ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="bg-warm-white/5 border border-warm-white/10 p-6 lg:p-8"
            >
              <p className="font-body text-base text-warm-white/80 mb-6">
                {t.diagnostico.navigation.continueOrRestart}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={onContinue}
                  className="font-accent text-xs uppercase tracking-[0.2em] bg-gold text-navy px-8 py-4 hover:bg-gold-light transition-all duration-300"
                >
                  {t.diagnostico.navigation.continueButton}
                </button>
                <button
                  type="button"
                  onClick={onRestart}
                  className="font-accent text-xs uppercase tracking-[0.2em] border border-warm-white/30 text-warm-white px-8 py-4 hover:border-warm-white/60 transition-all duration-300"
                >
                  {t.diagnostico.navigation.restartButton}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 max-w-lg"
            >
              <input
                type="text"
                value={inputNome}
                onChange={(e) => setInputNome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder={t.diagnostico.hero.namePlaceholder}
                className="flex-1 bg-transparent border-b border-warm-white/20 text-warm-white font-body text-base py-3 focus:border-gold outline-none transition-colors placeholder:text-warm-white/30"
              />
              <button
                type="button"
                onClick={handleStart}
                className="font-accent text-xs uppercase tracking-[0.2em] bg-gold text-navy px-8 py-4 hover:bg-gold-light transition-all duration-300 shrink-0"
              >
                {t.diagnostico.hero.startButton}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
