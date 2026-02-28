import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/hero-bg-fyJtxWkcWj2UeE7kR85wJt.webp";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-start overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={HERO_BG}
          alt="P.A.G.O. Novo Tempo - Farol ao pôr do sol simbolizando direção e propósito"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-navy/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full py-32">
        <div className="max-w-2xl">
          {/* Micro-label */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold-light mb-8"
          >
            {t.hero.microLabel}
          </motion.p>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-warm-white leading-[1.1] mb-6"
          >
            {t.hero.title1}
            <br />
            {t.hero.title2}
            <br />
            {t.hero.title3}
            <br />
            {t.hero.title4}
          </motion.h1>

          {/* Gold line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="h-[1px] bg-gold mb-8"
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="font-body text-lg text-warm-white/80 leading-relaxed mb-10 max-w-lg"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#inscricao"
              className="font-accent text-xs uppercase tracking-[0.2em] bg-gold text-navy px-8 py-4 hover:bg-gold-light transition-all duration-300 text-center"
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#pilares"
              className="font-accent text-xs uppercase tracking-[0.2em] border border-warm-white/30 text-warm-white px-8 py-4 hover:bg-warm-white/10 transition-all duration-300 text-center"
            >
              {t.hero.ctaSecondary}
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-gradient-to-b from-warm-white/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
