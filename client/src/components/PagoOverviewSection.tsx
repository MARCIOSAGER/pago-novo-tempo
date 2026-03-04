import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

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
      className="h-64 sm:h-72 cursor-pointer"
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
        {/* Front — Navy */}
        <div
          className="flex flex-col items-center justify-center p-6 bg-navy border border-gold/20"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
          }}
        >
          <span
            className="font-display text-6xl lg:text-7xl font-bold text-gold/15 leading-none select-none"
            style={{ position: "absolute", top: "12px", right: "16px" }}
          >
            {letter}
          </span>
          <p className="font-display text-3xl sm:text-4xl font-semibold text-warm-white mb-3">
            {title}
          </p>
          <p className="font-accent text-[10px] uppercase tracking-[0.25em] text-gold-light/70 text-center">
            {subtitle}
          </p>
        </div>

        {/* Back — White */}
        <div
          className="flex flex-col items-center justify-center p-6 bg-sand border border-sand-dark/30"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span
            className="font-display text-6xl lg:text-7xl font-bold text-gold/25 leading-none select-none"
            style={{ position: "absolute", top: "12px", right: "16px" }}
          >
            {letter}
          </span>
          <p className="font-display text-xl font-semibold text-navy mb-4">
            {title}
          </p>
          <p className="font-body text-sm text-navy/70 leading-relaxed text-center">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PagoOverviewSection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const letters = ["P", "A", "G", "O"];

  return (
    <section className="py-16 lg:py-24 bg-warm-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
            {t.overview.label}
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-navy">
            {t.overview.title}
          </h2>
        </motion.div>

        {/* Cards Grid — uses unique overview descriptions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {t.pillars.items.map((pillar, i) => (
              <FlipCard
                key={letters[i]}
                letter={letters[i]}
                title={pillar.title}
                subtitle={pillar.subtitle}
                description={t.overview.cards[i].description}
              />
            ))}
          </div>
          <p className="font-accent text-[9px] uppercase tracking-[0.2em] text-blue-muted/50 text-center mt-4">
            {t.overview.flipHint}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
