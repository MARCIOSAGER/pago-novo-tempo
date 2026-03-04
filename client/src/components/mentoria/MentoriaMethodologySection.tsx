import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MentoriaMethodologySection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-16 lg:py-24 bg-sand">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
            {t.mentoria.methodology.label}
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-navy leading-[1.15] mb-6">
            {t.mentoria.methodology.titleLine1}
            <br />
            <span className="text-gold">{t.mentoria.methodology.titleLine2}</span>
          </h2>
          <div className="w-12 h-[1px] bg-gold mx-auto mb-8" />
          <p className="font-body text-base text-navy/60 leading-relaxed">
            {t.mentoria.methodology.description}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-[1px] bg-gold/20 lg:-translate-x-[0.5px]" />

          <div className="space-y-12 lg:space-y-16">
            {t.mentoria.methodology.steps.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.2 * i }}
                  className={`relative flex items-start gap-6 lg:gap-0 ${
                    isLeft ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Number circle */}
                  <div className="absolute left-6 lg:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-navy flex items-center justify-center border-2 border-gold/30 z-10 shrink-0">
                    <span className="font-display text-sm font-bold text-gold">
                      {step.number}
                    </span>
                  </div>

                  {/* Content card */}
                  <div
                    className={`ml-16 lg:ml-0 lg:w-[calc(50%-40px)] ${
                      isLeft ? "lg:pr-0" : "lg:pl-0"
                    }`}
                  >
                    <div className="bg-warm-white p-6 lg:p-8 rounded-xl border border-sand-dark/10 shadow-sm">
                      <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold mb-2">
                        {step.subtitle}
                      </p>
                      <h3 className="font-display text-2xl font-semibold text-navy mb-3">
                        {step.title}
                      </h3>
                      <div className="w-8 h-[2px] bg-gold/30 mb-4" />
                      <p className="font-body text-sm text-navy/65 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden lg:block lg:w-[calc(50%-40px)]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
