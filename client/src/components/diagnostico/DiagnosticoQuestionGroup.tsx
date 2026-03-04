import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import DiagnosticoScaleInput from "./DiagnosticoScaleInput";
import type { PillarKey } from "./useDiagnosticoReducer";

interface DiagnosticoQuestionGroupProps {
  pillar: PillarKey;
  answers: (number | null)[];
  onAnswer: (index: number, value: number) => void;
  showHighlights: boolean;
}

const PILLAR_IMAGES: Record<PillarKey, string> = {
  P: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=2560&q=85",
  A: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2560&q=85",
  G: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2560&q=85",
  O: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2560&q=85",
};

export default function DiagnosticoQuestionGroup({
  pillar,
  answers,
  onAnswer,
  showHighlights,
}: DiagnosticoQuestionGroupProps) {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const pillarData = t.diagnostico.pillars[pillar];

  return (
    <>
      {/* Pillar hero — full-width background image */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            src={PILLAR_IMAGES[pillar]}
            alt=""
            className="w-full h-full object-cover"
            initial={{ scale: 1.08 }}
            animate={isInView ? { scale: 1 } : { scale: 1.08 }}
            transition={{ duration: 18, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-navy/60 to-navy/80" />
        </div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center py-20 lg:py-28 px-6"
        >
          <span className="font-display text-7xl lg:text-9xl font-semibold text-gold drop-shadow-lg">
            {pillarData.letter}
          </span>

          <p className="font-accent text-[11px] uppercase tracking-[0.4em] mt-3 text-gold-light">
            {pillarData.subtitle}
          </p>

          <h2 className="font-display text-3xl lg:text-5xl font-semibold mt-2 text-warm-white drop-shadow-md">
            {pillarData.name}
          </h2>

          <div className="w-16 h-[1px] bg-gold mx-auto mt-5 mb-6" />

          <p className="font-body text-base leading-relaxed max-w-2xl mx-auto text-warm-white/80">
            {pillarData.description}
          </p>
        </motion.div>
      </section>

      {/* Questions — always light background for readability and life */}
      <section className="py-16 lg:py-24 bg-warm-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="space-y-2">
            {pillarData.questions.map((question: { text: string; example: string } | string, index: number) => {
              const questionText = typeof question === "string" ? question : question.text;
              const questionExample = typeof question === "string" ? undefined : question.example;

              const subgroups = "subgroups" in pillarData ? (pillarData as any).subgroups : undefined;
              const subgroup = subgroups?.find(
                (sg: { label: string; startIndex: number }) => sg.startIndex === index
              );

              return (
                <div key={index}>
                  {subgroup && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`flex items-center gap-4 pt-8 pb-4 ${index > 0 ? "mt-4" : ""}`}
                    >
                      <div className="flex-1 h-[1px] bg-gold/40" />
                      <span className="font-accent text-[10px] uppercase tracking-[0.3em] shrink-0 text-gold">
                        {subgroup.label}
                      </span>
                      <div className="flex-1 h-[1px] bg-gold/40" />
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(index * 0.05, 0.5),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <DiagnosticoScaleInput
                      question={questionText}
                      example={questionExample}
                      value={answers[index]}
                      onSelect={(value) => onAnswer(index, value)}
                      questionNumber={index + 1}
                      totalQuestions={pillarData.questions.length}
                      darkBackground={false}
                      highlight={showHighlights}
                    />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
