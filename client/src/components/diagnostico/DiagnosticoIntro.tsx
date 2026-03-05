import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DiagnosticoIntroProps {
  onStart: () => void;
}

export default function DiagnosticoIntro({ onStart }: DiagnosticoIntroProps) {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const intro = t.diagnostico.intro;

  return (
    <section className="bg-navy-dark py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
            {intro.label}
          </p>

          <h2 className="font-display text-3xl lg:text-5xl font-semibold text-warm-white leading-[1.15] mb-2">
            {intro.title}
          </h2>
          <h2 className="font-display text-3xl lg:text-5xl font-semibold text-gold italic leading-[1.15] mb-8">
            {intro.titleItalic}
          </h2>

          <div className="w-16 h-[1px] bg-gold mx-auto mb-8" />

          <p className="font-body text-base leading-relaxed max-w-2xl mx-auto text-warm-white/70">
            {intro.subtitle}
          </p>
        </motion.div>

        {/* 3 cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {intro.cards.map((card: { tag: string; title: string; text: string }, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="border border-gold/20 bg-navy/40 p-6 lg:p-8"
            >
              <span className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold">
                {card.tag}
              </span>
              <h3 className="font-display text-xl font-semibold text-warm-white mt-3 mb-4">
                {card.title}
              </h3>
              <p className="font-body text-sm leading-relaxed text-warm-white/60">
                {card.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          {(intro as any).disclaimer && (
            <p className="text-sm italic text-warm-white/40 text-center max-w-md mx-auto mb-8">
              {(intro as any).disclaimer}
            </p>
          )}
          <button
            type="button"
            onClick={onStart}
            className="btn-shine font-accent text-xs uppercase tracking-[0.2em] bg-gold text-navy px-10 py-4 hover:bg-gold-light transition-all duration-300"
          >
            {intro.cta}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
