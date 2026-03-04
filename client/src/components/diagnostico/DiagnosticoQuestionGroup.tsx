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

const ROMAN_NUMERALS: Record<PillarKey, string> = {
  P: "I",
  A: "II",
  G: "III",
  O: "IV",
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
    <section
      className={`py-16 lg:py-24 ${isDark ? "bg-navy" : "bg-warm-white"}`}
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        {/* Pillar header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 relative"
        >
          {/* Large roman numeral as background ornament */}
          <span
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[120px] lg:text-[180px] font-semibold select-none pointer-events-none ${
              isDark ? "text-gold/5" : "text-gold/8"
            }`}
          >
            {ROMAN_NUMERALS[pillar]}
          </span>

          <div className="relative z-10">
            <span
              className={`font-display text-6xl lg:text-8xl font-semibold ${
                isDark ? "text-gold" : "text-gold"
              }`}
            >
              {pillarData.letter}
            </span>

            <p
              className={`font-accent text-[11px] uppercase tracking-[0.4em] mt-2 ${
                isDark ? "text-gold/80" : "text-gold"
              }`}
            >
              {pillarData.subtitle}
            </p>

            <h2
              className={`font-display text-3xl lg:text-4xl font-semibold mt-2 ${
                isDark ? "text-warm-white" : "text-navy"
              }`}
            >
              {pillarData.name}
            </h2>

            <div className="w-12 h-[1px] bg-gold mx-auto mt-4 mb-6" />

            <p
              className={`font-body text-sm leading-relaxed max-w-2xl mx-auto ${
                isDark ? "text-warm-white/75" : "text-navy/70"
              }`}
            >
              {pillarData.description}
            </p>
          </div>
        </motion.div>

        {/* Questions */}
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
  );
}
