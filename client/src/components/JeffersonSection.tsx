import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";

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

export default function JeffersonSection() {
  const { t } = useLanguage();

  return (
    <section id="jefferson" className="py-28 lg:py-36 bg-warm-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Photo */}
          <FadeIn>
            <div className="relative">
              <img
                src="/images/jefferson.png"
                alt="Jefferson Evangelista"
                className="w-full max-w-md mx-auto lg:mx-0 object-cover"
              />
            </div>
          </FadeIn>

          {/* Right — Info */}
          <div className="space-y-6">
            <FadeIn>
              <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-2">
                {t.jefferson.label}
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold text-navy leading-[1.15]">
                {t.jefferson.name}
                <br />
                <span className="text-gold">{t.jefferson.nameSurname}</span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="flex flex-col gap-2">
                <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-blue-muted flex items-center gap-2">
                  <span className="text-gold">—</span> {t.jefferson.role1}
                </p>
                <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-blue-muted flex items-center gap-2">
                  <span className="text-gold">—</span> {t.jefferson.role2}
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="gold-line" />
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="font-body text-base text-navy/75 leading-relaxed">
                {t.jefferson.bio1}
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <a
                href="/fundador"
                className="inline-flex items-center gap-2 font-accent text-xs uppercase tracking-[0.2em] border border-navy/30 text-navy px-8 py-4 hover:bg-navy hover:text-warm-white transition-all duration-300"
              >
                {t.jefferson.ctaMore}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
