import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MentoriaCTASection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-16 lg:py-24 bg-navy">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-warm-white leading-[1.15] mb-6">
            {t.mentoria.cta.titleLine1}
            <br />
            <span className="text-gold">{t.mentoria.cta.titleLine2}</span>
          </h2>

          <div className="w-12 h-[1px] bg-gold mx-auto mb-8" />

          <p className="font-body text-base text-warm-white/60 leading-relaxed max-w-2xl mx-auto mb-10">
            {t.mentoria.cta.description}
          </p>

          <a
            href="/#inscricao"
            className="inline-flex items-center gap-2 font-accent text-xs uppercase tracking-[0.2em] bg-gold text-navy px-8 py-4 hover:bg-gold-light transition-all duration-300"
          >
            {t.mentoria.cta.button}
          </a>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16"
        >
          <p className="font-body text-sm text-warm-white/40 italic">
            {t.mentoria.cta.quote}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
