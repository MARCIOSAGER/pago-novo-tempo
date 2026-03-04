import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { X, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MentoriaResultsSection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-16 lg:py-24 bg-warm-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
            {t.mentoria.results.label}
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-navy leading-[1.15] mb-6">
            {t.mentoria.results.titleLine1}
            <br />
            <span className="text-gold">{t.mentoria.results.titleLine2}</span>
          </h2>
          <div className="w-12 h-[1px] bg-gold mx-auto mb-8" />
          <p className="font-body text-base text-navy/60 leading-relaxed">
            {t.mentoria.results.description}
          </p>
        </motion.div>

        {/* Before / After */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="p-8 lg:p-10 rounded-xl bg-navy/5 border border-navy/10"
          >
            <p className="font-accent text-[11px] uppercase tracking-[0.3em] text-navy/40 mb-8">
              {t.mentoria.results.before.label}
            </p>
            <div className="space-y-5">
              {t.mentoria.results.before.items.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-navy/10 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-navy/30" strokeWidth={2} />
                  </div>
                  <p className="font-body text-sm text-navy/50 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="p-8 lg:p-10 rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20"
          >
            <p className="font-accent text-[11px] uppercase tracking-[0.3em] text-gold mb-8">
              {t.mentoria.results.after.label}
            </p>
            <div className="space-y-5">
              {t.mentoria.results.after.items.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-gold" strokeWidth={2.5} />
                  </div>
                  <p className="font-body text-sm text-navy/80 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
