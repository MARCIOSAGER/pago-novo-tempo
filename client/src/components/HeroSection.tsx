import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteImages } from "@/hooks/useSiteImages";

export default function HeroSection() {
  const { t } = useLanguage();
  const images = useSiteImages();

  return (
    <section className="relative min-h-screen flex items-center justify-start overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1 }}
          animate={{ scale: 1.3 }}
          transition={{ duration: 20, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          style={{ transformOrigin: "62% 45%" }}
          src={images.hero}
          alt=""
          className="w-full h-full object-cover"
        />
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
              className="btn-shine font-accent text-xs uppercase tracking-[0.2em] bg-gold text-navy px-8 py-4 hover:bg-gold-light transition-all duration-300 text-center"
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#pilares"
              className="btn-shine btn-shine-delay font-accent text-xs uppercase tracking-[0.2em] border border-warm-white/30 text-warm-white px-8 py-4 hover:bg-warm-white/10 transition-all duration-300 text-center"
            >
              {t.hero.ctaSecondary}
            </a>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
