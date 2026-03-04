import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const COVERS: Record<string, string> = {
  pt: "/images/covers/capa_pt.png",
  en: "/images/covers/capa_en.png",
  es: "/images/covers/capa_es.png",
};

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

/** Renders text with **bold** markers as <strong> elements */
function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <p className={className}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

export default function AboutSection() {
  const { t, language } = useLanguage();
  const coverSrc = COVERS[language] || COVERS.pt;

  return (
    <section id="sobre" className="pt-8 pb-16 lg:pt-12 lg:pb-24 bg-warm-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Label */}
        <FadeIn>
          <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
            {t.about.label}
          </p>
        </FadeIn>

        {/* Main grid: text + book cover */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left — Title + description */}
          <div className="lg:col-span-7">
            <FadeIn delay={0.1}>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold text-navy leading-[1.15] mb-8">
                {t.about.titleLine1}
                <br />
                {t.about.titleLine2}{" "}
                <span className="text-gold">{t.about.titleLine3}</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <RichText
                text={t.about.content}
                className="font-body text-base text-navy/70 leading-relaxed mb-6"
              />
            </FadeIn>
            <FadeIn delay={0.3}>
              <RichText
                text={t.about.description}
                className="font-body text-base text-navy/80 leading-relaxed"
              />
            </FadeIn>
          </div>

          {/* Right — Book cover */}
          <div className="lg:col-span-5 flex justify-center">
            <FadeIn delay={0.3}>
              <motion.img
                src={coverSrc}
                alt="P.A.G.O Ebook"
                className="w-64 lg:w-72 drop-shadow-2xl rounded-sm"
                whileHover={{ scale: 1.03, rotateY: -3 }}
                transition={{ duration: 0.4 }}
              />
            </FadeIn>
          </div>
        </div>

        {/* Divider */}
        <FadeIn delay={0.4}>
          <div className="gold-line my-10" />
        </FadeIn>

        {/* Problem / Answer grid */}
        <FadeIn delay={0.4}>
          <div className="grid sm:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <p className="font-accent text-[11px] uppercase tracking-[0.3em] text-gold">
                {t.about.problemLabel}
              </p>
              <RichText
                text={t.about.problemText}
                className="font-body text-sm text-navy/70 leading-relaxed"
              />
            </div>
            <div className="space-y-3">
              <p className="font-accent text-[11px] uppercase tracking-[0.3em] text-gold">
                {t.about.answerLabel}
              </p>
              <RichText
                text={t.about.answerText}
                className="font-body text-sm text-navy/70 leading-relaxed"
              />
            </div>
          </div>
        </FadeIn>

        {/* Quote */}
        <FadeIn delay={0.5}>
          <blockquote className="text-center py-4">
            <p className="font-display text-lg lg:text-xl text-navy italic leading-relaxed max-w-3xl mx-auto">
              {t.about.quote}
            </p>
          </blockquote>
        </FadeIn>

        {/* CTA Mentoria */}
        <FadeIn delay={0.6}>
          <div className="text-center mt-8">
            <a
              href="/mentoria"
              className="inline-flex items-center gap-2 font-accent text-xs uppercase tracking-[0.2em] bg-navy text-warm-white px-8 py-4 hover:bg-navy-light transition-all duration-300"
            >
              {t.nav.mentoria} →
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
