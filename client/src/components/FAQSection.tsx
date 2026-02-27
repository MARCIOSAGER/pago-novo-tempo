import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

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

const faqs = [
  {
    question: "O que é o P.A.G.O.?",
    answer:
      "O P.A.G.O. é um sistema de reorganização de vida baseado em quatro pilares bíblicos: Princípio (acima de resultados), Alinhamento (gera autoridade), Governo (inicia no secreto) e Obediência (sustenta o invisível). É uma metodologia de mentoria que ajuda pessoas a estruturarem sua vida espiritual, emocional e prática.",
  },
  {
    question: "Para quem é a mentoria P.A.G.O.?",
    answer:
      "Para homens e mulheres que amam a Deus mas vivem desorganizados. Para quem tem fé genuína mas precisa de estrutura. Para líderes, empreendedores e cristãos que desejam construir um legado duradouro fundamentado em princípios bíblicos imutáveis.",
  },
  {
    question: "O que está incluído no Kit de Mentoria?",
    answer:
      "O kit inclui: Bíblia BKJ (tradução King James em português), Caderno de Estudos dedicado para reflexões e exercícios, Caneta para registrar compromissos, e o Ebook P.A.G.O. com a metodologia completa, exercícios práticos e versículos fundamentadores.",
  },
  {
    question: "Quanto tempo dura a mentoria?",
    answer:
      "A mentoria é estruturada para acompanhar cada participante em sua jornada de transformação. O ritmo é personalizado, respeitando o processo individual de cada pessoa. O P.A.G.O. não é sobre velocidade — é sobre permanência e constância.",
  },
  {
    question: "Preciso ter experiência bíblica prévia?",
    answer:
      "Não. O P.A.G.O. foi desenhado para ser acessível a todos que desejam reorganizar sua vida com base em princípios bíblicos. A metodologia guia o participante passo a passo, desde os fundamentos até a aplicação prática.",
  },
  {
    question: "Como funciona o modelo White-Label?",
    answer:
      "O P.A.G.O. está desenvolvendo uma plataforma escalável que permitirá que igrejas, organizações e mentores apliquem a metodologia com sua própria marca. Se você tem interesse em levar o P.A.G.O. para sua comunidade, entre em contato conosco.",
  },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
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
  return (
    <section id="faq" className="py-28 lg:py-36 bg-sand">
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
              Perguntas Frequentes
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold text-navy leading-[1.15]">
              Tire suas <span className="text-gold">dúvidas.</span>
            </h2>
          </div>
        </FadeIn>

        <div>
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
