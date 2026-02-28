import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
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

function FlipCard({
  letter,
  title,
  subtitle,
  description,
}: {
  letter: string;
  title: string;
  subtitle: string;
  description: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="h-52 sm:h-56 cursor-pointer"
      style={{ perspective: "800px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onTouchStart={() => setFlipped((prev) => !prev)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transition: "transform 0.6s ease",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="flex flex-col items-center justify-center p-5 border border-sand-dark/30 bg-warm-white"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
          }}
        >
          <span
            className="font-display text-5xl font-bold text-gold/30 leading-none select-none"
            style={{ position: "absolute", top: "8px", right: "12px" }}
          >
            {letter}
          </span>
          <p className="font-display text-2xl sm:text-3xl font-semibold text-navy mb-2">
            {title}
          </p>
          <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-blue-muted text-center whitespace-pre-line">
            {subtitle}
          </p>
        </div>

        {/* Back */}
        <div
          className="flex flex-col items-center justify-center p-5 bg-navy border border-gold/20"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span
            className="font-display text-5xl font-bold text-gold/20 leading-none select-none"
            style={{ position: "absolute", top: "8px", right: "12px" }}
          >
            {letter}
          </span>
          <p className="font-display text-lg font-semibold text-gold mb-3">
            {title}
          </p>
          <p className="font-body text-xs text-warm-white/80 leading-relaxed text-center">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function JeffersonSection() {
  const { t } = useLanguage();

  const pillarCards = t.jefferson.cards.map((card, i) => ({
    letter: ["P", "A", "G", "O"][i],
    ...card,
  }));

  return (
    <section id="jefferson" className="py-28 lg:py-36 bg-warm-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left - Visual Element */}
          <div className="lg:col-span-4">
            <FadeIn>
              <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
                {t.jefferson.label}
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold text-navy leading-[1.15] mb-8">
                {t.jefferson.name}
                <br />
                <span className="text-gold">{t.jefferson.nameSurname}</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="section-divider mb-8" />
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-blue-muted mb-4">
                {t.jefferson.role1}
              </p>
              <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-blue-muted mb-4">
                {t.jefferson.role2}
              </p>
              <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-blue-muted">
                {t.jefferson.role3}
              </p>
            </FadeIn>
          </div>

          {/* Right - Content */}
          <div className="lg:col-span-8 space-y-8">
            <FadeIn delay={0.1}>
              <p className="font-body text-lg text-navy/80 leading-relaxed">
                {t.jefferson.bio1}
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="font-body text-base text-navy/70 leading-relaxed">
                {t.jefferson.bio2}
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="gold-line" />
            </FadeIn>

            <FadeIn delay={0.4}>
              <blockquote className="border-l-2 border-gold pl-6 py-4 bg-sand/50">
                <p className="font-display text-xl text-navy italic leading-relaxed mb-4">
                  {t.jefferson.quote}
                </p>
                <footer className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold">
                  — {t.jefferson.quoteAuthor}
                </footer>
              </blockquote>
            </FadeIn>

            <FadeIn delay={0.5}>
              <p className="font-body text-base text-navy/70 leading-relaxed">
                {t.jefferson.bio3}
              </p>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                {pillarCards.map((card) => (
                  <FlipCard key={card.letter} {...card} />
                ))}
              </div>
              <p className="font-accent text-[9px] uppercase tracking-[0.2em] text-blue-muted/50 text-center mt-3">
                {t.jefferson.flipHint}
              </p>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
