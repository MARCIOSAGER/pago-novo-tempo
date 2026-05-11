import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";
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

export default function ForWhomSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 lg:py-24 bg-warm-white border-t border-sand-dark/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <FadeIn>
            <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
              {t.forWhom.label}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold text-navy leading-[1.15] max-w-2xl mx-auto">
              {t.forWhom.title}
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="h-[1px] w-20 bg-gold mx-auto mt-8" />
          </FadeIn>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {t.forWhom.items.map((item, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.08}>
              <div className="border border-navy/15 bg-warm-white p-8 lg:p-10 h-full hover:border-gold/60 transition-colors duration-300">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 inline-flex items-center justify-center h-9 w-9 border border-gold text-gold mt-1">
                    <Check className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl lg:text-2xl font-semibold text-navy mb-3 leading-snug">
                      {item.title}
                    </h3>
                    <p className="font-body text-sm lg:text-base text-navy/70 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.5}>
          <p className="font-display text-lg lg:text-xl text-navy italic leading-relaxed max-w-3xl mx-auto text-center">
            {t.forWhom.closing}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
