import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
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

function FAQItem({ faq, index }: { faq: { question: string; answer: string }; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <FadeIn delay={0.05 * index}>
      <div className="border-b border-sand-dark/30">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between py-6 text-left group"
        >
          <span className="font-display text-lg text-navy group-hover:text-gold transition-colors duration-300 pr-4">
            {faq.question}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gold shrink-0 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
            strokeWidth={1.5}
          />
        </button>
        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <p className="font-body text-sm text-navy/60 leading-relaxed pb-6">
            {faq.answer}
          </p>
        </motion.div>
      </div>
    </FadeIn>
  );
}

export default function FAQSection() {
  const { t } = useLanguage();

  return (
    <section id="faq" className="py-28 lg:py-36 bg-sand">
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
              {t.faq.label}
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold text-navy leading-[1.15]">
              {t.faq.titleLine1} <span className="text-gold">{t.faq.titleLine2}</span>
            </h2>
          </div>
        </FadeIn>

        <div>
          {t.faq.items.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
