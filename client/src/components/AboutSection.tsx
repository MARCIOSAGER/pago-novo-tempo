import { motion, useInView } from "framer-motion";
import { useRef } from "react";

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

export default function AboutSection() {
  return (
    <section id="sobre" className="py-28 lg:py-36 bg-warm-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Label */}
        <FadeIn>
          <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
            Sobre o P.A.G.O.
          </p>
        </FadeIn>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left Column - Main Statement */}
          <div className="lg:col-span-5">
            <FadeIn delay={0.1}>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold text-navy leading-[1.15] mb-8">
                Um sistema de
                <br />
                reorganização
                <br />
                <span className="text-gold">de vida.</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="section-divider mb-8" />
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="font-body text-base text-navy/70 leading-relaxed">
                O P.A.G.O. não foi uma ideia simplesmente criada. Foi uma visão
                que o Espírito Santo entregou. Apenas organizada, estruturada e
                sistematizada para transformar vidas.
              </p>
            </FadeIn>
          </div>

          {/* Right Column - Expanded Content */}
          <div className="lg:col-span-7 space-y-8">
            <FadeIn delay={0.2}>
              <p className="font-body text-lg text-navy/80 leading-relaxed">
                Muitas pessoas não fracassam por falta de capacidade, mas por falta de
                governo interior. Vivem com fé genuína, mas sem estrutura. Possuem um
                chamado claro, mas sem direção estratégica. Amam a Deus, mas experimentam
                desorganização em suas vidas.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="gold-line" />
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <p className="font-accent text-[11px] uppercase tracking-[0.3em] text-gold">
                    O Problema
                  </p>
                  <p className="font-body text-sm text-navy/70 leading-relaxed">
                    Prosperidade sem governo gera queda. Crescimento sem estrutura
                    gera colapso. Fé sem alinhamento gera confusão.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="font-accent text-[11px] uppercase tracking-[0.3em] text-gold">
                    A Resposta
                  </p>
                  <p className="font-body text-sm text-navy/70 leading-relaxed">
                    O P.A.G.O. é um caminho para estruturar a vida espiritual,
                    emocional e prática com maturidade e direção.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <blockquote className="border-l-2 border-gold pl-6 py-2">
                <p className="font-display text-xl text-navy italic leading-relaxed">
                  "Homens restaurados constroem famílias fortes. Famílias fortes
                  sustentam empresas sólidas. Empresas sólidas impactam territórios."
                </p>
              </blockquote>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
