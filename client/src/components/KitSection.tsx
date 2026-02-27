import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BookOpen, PenLine, NotebookPen, FileText } from "lucide-react";
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

const kitIcons = [BookOpen, NotebookPen, PenLine, FileText];

export default function KitSection() {
  const { t } = useLanguage();

  return (
    <section id="kit" className="py-28 lg:py-36 bg-navy">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <FadeIn>
            <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
              {t.kit.label}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold text-warm-white leading-[1.15] mb-6">
              {t.kit.titleLine1}
              <br />
              <span className="text-gold">{t.kit.titleLine2}</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="section-divider mx-auto mb-8" />
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="font-body text-base text-warm-white/60 leading-relaxed">
              {t.kit.description}
            </p>
          </FadeIn>
        </div>

        {/* Kit Items */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.kit.items.map((item, i) => {
            const Icon = kitIcons[i];
            return (
              <FadeIn key={item.title} delay={0.1 * i}>
                <div className="group p-8 border border-warm-white/10 hover:border-gold/30 transition-all duration-500 h-full">
                  <Icon
                    className="w-8 h-8 text-gold mb-6 group-hover:scale-110 transition-transform duration-300"
                    strokeWidth={1.2}
                  />
                  <h3 className="font-display text-xl font-semibold text-warm-white mb-4">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-warm-white/50 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
