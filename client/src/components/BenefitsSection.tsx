import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function BenefitsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 lg:py-24 bg-navy">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <FadeIn>
            <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
              {t.benefits.label}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold text-warm-white leading-[1.15] max-w-3xl mx-auto">
              {t.benefits.title}
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="font-body text-base lg:text-lg text-warm-white/70 leading-relaxed max-w-2xl mx-auto mt-6">
              {t.benefits.subtitle}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="h-[1px] w-20 bg-gold mx-auto mt-8" />
          </FadeIn>
        </div>

        <div className="grid sm:grid-cols-2 gap-px bg-gold/20 mb-12 border border-gold/20">
          {t.benefits.items.map((item, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.08}>
              <div className="bg-navy p-8 lg:p-10 h-full">
                <div className="flex items-start gap-5">
                  <span className="font-display text-5xl lg:text-6xl font-bold text-gold leading-none">
                    {item.letter}
                  </span>
                  <div>
                    <h3 className="font-display text-xl lg:text-2xl font-semibold text-warm-white mb-3 leading-snug">
                      {item.title}
                    </h3>
                    <p className="font-body text-sm lg:text-base text-warm-white/75 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.5}>
          <p className="font-display text-xl lg:text-2xl text-warm-white italic leading-relaxed text-center max-w-3xl mx-auto">
            {t.benefits.closing}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
