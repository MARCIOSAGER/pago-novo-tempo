import { useState, useCallback } from "react";
import { corporateQuestions, calcPillarScore, type Question } from "@/data/questions-corporate";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Answers = Record<string, 1 | 2 | 3 | 4>;

interface Props {
  onComplete: (data: {
    answers: Answers;
    answersP: number[];
    answersA: number[];
    answersG: number[];
    answersO: number[];
    mediaP: number;
    mediaA: number;
    mediaG: number;
    mediaO: number;
    mediaGeral: number;
    pilarMaisFraco: "P" | "A" | "G" | "O";
  }) => void;
}

const pillarInfo: Record<string, { name: string; color: string }> = {
  P: { name: "Princípio", color: "#B8A88A" },
  A: { name: "Alinhamento", color: "#2E8B6A" },
  G: { name: "Governo", color: "#C8A951" },
  O: { name: "Obediência", color: "#8B4C4C" },
};

export default function CorporateDiagnosticoFlow({ onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [direction, setDirection] = useState(1);

  const question = corporateQuestions[currentIndex];
  const total = corporateQuestions.length;
  const progress = (Object.keys(answers).length / total) * 100;
  const isAnswered = answers[question.id] !== undefined;
  const isLast = currentIndex === total - 1;
  const allAnswered = Object.keys(answers).length === total;

  const handleAnswer = useCallback((questionId: string, value: 1 | 2 | 3 | 4) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const goNext = () => {
    if (currentIndex < total - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleSubmit = () => {
    if (!allAnswered) return;

    const byPillar = (p: string) =>
      corporateQuestions.filter((q) => q.pillar === p).map((q) => answers[q.id]);

    const answersP = byPillar("P");
    const answersA = byPillar("A");
    const answersG = byPillar("G");
    const answersO = byPillar("O");

    const mediaP = calcPillarScore(answers, "P");
    const mediaA = calcPillarScore(answers, "A");
    const mediaG = calcPillarScore(answers, "G");
    const mediaO = calcPillarScore(answers, "O");
    const mediaGeral = parseFloat(((mediaP + mediaA + mediaG + mediaO) / 4).toFixed(2));

    const scores = { P: mediaP, A: mediaA, G: mediaG, O: mediaO };
    const pilarMaisFraco = (Object.entries(scores) as [
      "P" | "A" | "G" | "O",
      number,
    ][]).reduce((a, b) => (b[1] < a[1] ? b : a))[0];

    onComplete({
      answers,
      answersP,
      answersA,
      answersG,
      answersO,
      mediaP,
      mediaA,
      mediaG,
      mediaO,
      mediaGeral,
      pilarMaisFraco,
    });
  };

  const optionLabels = ["A", "B", "C", "D"];
  const info = pillarInfo[question.pillar];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#B8A88A]/50 font-[Montserrat]">
            {info.name} — Pergunta {currentIndex + 1} de {total}
          </span>
          <span className="text-xs text-[#FAFAF8]/30">
            {Object.keys(answers).length}/{total} respondidas
          </span>
        </div>
        <div className="h-1 bg-[#1A2744] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#B8A88A] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Pillar indicator dots */}
        <div className="flex gap-1 mt-3">
          {corporateQuestions.map((q, i) => {
            const isCurrentPillar = q.pillar === question.pillar;
            const isCurrent = i === currentIndex;
            const isComplete = answers[q.id] !== undefined;
            return (
              <button
                key={q.id}
                onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
                  isCurrent
                    ? "bg-[#B8A88A]"
                    : isComplete
                    ? "bg-[#B8A88A]/40"
                    : isCurrentPillar
                    ? "bg-[#FAFAF8]/10"
                    : "bg-[#FAFAF8]/5"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={question.id}
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.25 }}
        >
          <div className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-6 lg:p-8">
            {/* Pillar tag */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border"
                style={{
                  color: info.color,
                  borderColor: `${info.color}33`,
                  backgroundColor: `${info.color}11`,
                }}
              >
                {question.pillar} — {info.name}
              </span>
              {question.subgroup && (
                <span className="text-[10px] text-[#FAFAF8]/25 uppercase tracking-wider">
                  {question.subgroup}
                </span>
              )}
            </div>

            {/* Question text */}
            <h2 className="text-lg lg:text-xl font-[Cormorant] text-[#FAFAF8] leading-relaxed mb-6">
              {question.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((opt, i) => {
                const isSelected = answers[question.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(question.id, opt.value)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-start gap-3 ${
                      isSelected
                        ? "bg-[#B8A88A]/10 border-[#B8A88A]/40 text-[#FAFAF8]"
                        : "bg-[#0F1B2D]/50 border-[#B8A88A]/5 text-[#FAFAF8]/60 hover:border-[#B8A88A]/20 hover:text-[#FAFAF8]/80"
                    }`}
                  >
                    <span
                      className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold border ${
                        isSelected
                          ? "bg-[#B8A88A] text-[#1A2744] border-[#B8A88A]"
                          : "border-[#B8A88A]/20 text-[#B8A88A]/50"
                      }`}
                    >
                      {optionLabels[i]}
                    </span>
                    <span className="text-sm leading-relaxed pt-0.5">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-[#B8A88A] hover:bg-[#B8A88A]/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </button>

        {isLast && allAnswered ? (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm bg-[#B8A88A] text-[#1A2744] font-semibold hover:bg-[#D4C8A8] transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" /> Finalizar Diagnóstico
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!isAnswered}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-[#B8A88A] hover:bg-[#B8A88A]/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            Próxima <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
