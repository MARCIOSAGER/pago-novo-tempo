import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MentoriaHeroSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-navy pt-32 pb-20 lg:pb-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Link href="/">
          <span className="inline-flex items-center gap-2 font-accent text-xs uppercase tracking-[0.2em] text-gold hover:text-gold-light transition-colors mb-10 cursor-pointer">
            <ArrowLeft size={14} /> {t.mentoria.hero.backToHome}
          </span>
        </Link>

        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6"
          >
            {t.mentoria.hero.label}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl lg:text-6xl font-semibold text-warm-white leading-[1.1] mb-6"
          >
            {t.mentoria.hero.titleLine1}
            <br />
            <span className="text-gold">{t.mentoria.hero.titleLine2}</span>
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
            className="font-body text-lg text-warm-white/70 leading-relaxed max-w-2xl"
          >
            {t.mentoria.hero.subtitle}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
