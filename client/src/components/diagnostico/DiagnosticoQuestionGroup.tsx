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
  const isDark = pillar === "P" || pillar === "G";

  return (
    <>
      {/* Pillar hero with background image */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            src={PILLAR_IMAGES[pillar]}
            alt=""
            className="w-full h-full object-cover"
            initial={{ scale: 1.05 }}
            animate={isInView ? { scale: 1 } : { scale: 1.05 }}
            transition={{ duration: 15, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-navy/70" />
        </div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center py-16 lg:py-24 px-6"
        >
          <span className="font-display text-6xl lg:text-8xl font-semibold text-gold">
            {pillarData.letter}
          </span>

          <p className="font-accent text-[11px] uppercase tracking-[0.4em] mt-2 text-gold/80">
            {pillarData.subtitle}
          </p>

          <h2 className="font-display text-3xl lg:text-4xl font-semibold mt-2 text-warm-white">
            {pillarData.name}
          </h2>

          <div className="w-12 h-[1px] bg-gold mx-auto mt-4 mb-6" />

          <p className="font-body text-sm leading-relaxed max-w-2xl mx-auto text-warm-white/75">
            {pillarData.description}
          </p>
        </motion.div>
      </section>

      {/* Questions */}
      <section className={`py-16 lg:py-24 ${isDark ? "bg-navy" : "bg-sand/40"}`}>
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="space-y-2">
            {pillarData.questions.map((question: { text: string; example: string } | string, index: number) => {
              const questionText = typeof question === "string" ? question : question.text;
              const questionExample = typeof question === "string" ? undefined : question.example;

              // Check if we need a subgroup separator
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
                      <div
                        className={`flex-1 h-[1px] ${isDark ? "bg-gold/30" : "bg-gold/40"}`}
                      />
                      <span
                        className={`font-accent text-[10px] uppercase tracking-[0.3em] shrink-0 ${
                          isDark ? "text-gold/70" : "text-gold"
                        }`}
                      >
                        {subgroup.label}
                      </span>
                      <div
                        className={`flex-1 h-[1px] ${isDark ? "bg-gold/30" : "bg-gold/40"}`}
                      />
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
                      darkBackground={isDark}
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
