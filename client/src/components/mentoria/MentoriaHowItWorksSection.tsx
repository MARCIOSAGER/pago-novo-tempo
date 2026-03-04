import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CalendarDays, PenTool, Package, UsersRound } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const howIcons = [CalendarDays, PenTool, Package, UsersRound];

export default function MentoriaHowItWorksSection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-16 lg:py-24 bg-navy">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
            {t.mentoria.howItWorks.label}
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-warm-white leading-[1.15]">
            {t.mentoria.howItWorks.titleLine1}
            <br />
            <span className="text-gold">{t.mentoria.howItWorks.titleLine2}</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.mentoria.howItWorks.items.map((item, i) => {
            const Icon = howIcons[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1 * i }}
                className="group p-8 rounded-xl bg-warm-white shadow-lg shadow-black/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/20 transition-all duration-500 h-full"
              >
                <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center mb-6 group-hover:bg-gold/25 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-7 h-7 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold text-navy mb-3">
                  {item.title}
                </h3>
                <div className="w-8 h-[2px] bg-gold/30 mb-4 group-hover:w-12 transition-all duration-500" />
                <p className="font-body text-sm text-navy/75 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
