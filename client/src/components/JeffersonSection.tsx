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

export default function JeffersonSection() {
  return (
    <section id="jefferson" className="py-28 lg:py-36 bg-warm-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left - Visual Element */}
          <div className="lg:col-span-4">
            <FadeIn>
              <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
                O Fundador
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold text-navy leading-[1.15] mb-8">
                Jefferson
                <br />
                <span className="text-gold">Evangelista</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="section-divider mb-8" />
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-blue-muted mb-4">
                Construtor de Estruturas
              </p>
              <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-blue-muted mb-4">
                Organizador de Destinos
              </p>
              <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-blue-muted">
                Atleta de Resistência
              </p>
            </FadeIn>
          </div>

          {/* Right - Content */}
          <div className="lg:col-span-8 space-y-8">
            <FadeIn delay={0.1}>
              <p className="font-body text-lg text-navy/80 leading-relaxed">
                Jefferson Evangelista não é apenas um empreendedor. Ele é um construtor de
                estruturas e um organizador de destinos. Sua história não começou nos negócios,
                mas na consciência de que sem governo espiritual, emocional e estratégico,
                qualquer crescimento desmorona.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="font-body text-base text-navy/70 leading-relaxed">
                À frente da Interaja e de múltiplas frentes empresariais, Jefferson nunca buscou
                apenas lucro. Sempre buscou estrutura, sustentabilidade e legado. Ele pensa em
                governança antes de pensar em expansão. Pensa em base antes de pensar em
                visibilidade.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="gold-line" />
            </FadeIn>

            <FadeIn delay={0.4}>
              <blockquote className="border-l-2 border-gold pl-6 py-4 bg-sand/50">
                <p className="font-display text-xl text-navy italic leading-relaxed mb-4">
                  "O P.A.G.O. não foi uma ideia que eu simplesmente criei. Foi uma visão que
                  o Espírito Santo me entregou. Eu apenas organizei, estruturei e sistematizei
                  aquilo que recebi."
                </p>
                <footer className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold">
                  Jefferson Evangelista
                </footer>
              </blockquote>
            </FadeIn>

            <FadeIn delay={0.5}>
              <p className="font-body text-base text-navy/70 leading-relaxed">
                Como atleta de resistência, Jefferson carrega no corpo o que acredita na alma:
                disciplina diária, constância silenciosa e avanço estratégico. Não é sobre
                velocidade. É sobre permanência. Ele não lidera para aparecer. Ele estrutura
                para permanecer.
              </p>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                <div className="text-center p-6 border border-sand-dark/30">
                  <p className="font-display text-3xl font-semibold text-navy mb-2">Princípio</p>
                  <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-blue-muted">
                    Acima de<br />resultados
                  </p>
                </div>
                <div className="text-center p-6 border border-sand-dark/30">
                  <p className="font-display text-3xl font-semibold text-navy mb-2">Alinhamento</p>
                  <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-blue-muted">
                    Gera<br />autoridade
                  </p>
                </div>
                <div className="text-center p-6 border border-sand-dark/30">
                  <p className="font-display text-3xl font-semibold text-navy mb-2">Governo</p>
                  <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-blue-muted">
                    Inicia no<br />secreto
                  </p>
                </div>
                <div className="text-center p-6 border border-sand-dark/30">
                  <p className="font-display text-3xl font-semibold text-navy mb-2">Obediência</p>
                  <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-blue-muted">
                    Sustenta o<br />invisível
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
