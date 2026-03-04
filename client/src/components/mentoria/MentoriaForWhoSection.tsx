import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Heart, Users, Compass } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const personaIcons = [Briefcase, Heart, Users, Compass];

export default function MentoriaForWhoSection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-16 lg:py-24 bg-warm-white">
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
            {t.mentoria.forWho.label}
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-navy leading-[1.15] mb-6">
            {t.mentoria.forWho.titleLine1}
            <br />
            <span className="text-gold">{t.mentoria.forWho.titleLine2}</span>
          </h2>
          <div className="w-12 h-[1px] bg-gold mx-auto mb-8" />
          <p className="font-body text-base text-navy/60 leading-relaxed">
            {t.mentoria.forWho.description}
          </p>
        </motion.div>

        {/* Persona Cards */}
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {t.mentoria.forWho.personas.map((persona, i) => {
            const Icon = personaIcons[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.15 * i }}
                className="group p-8 bg-sand/40 border border-sand-dark/15 rounded-xl hover:bg-sand/70 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center mb-5 group-hover:bg-gold/25 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold text-navy mb-3">
                  {persona.title}
                </h3>
                <p className="font-body text-sm text-navy/65 leading-relaxed">
                  {persona.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
