import { useState, useCallback, useMemo } from "react";
import { corporateQuestions, anchorLabels, calcPillarScore } from "@/data/questions-corporate";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Answers = Record<string, number>;

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

const pillarInfo: Record<string, { name: string; color: string; subtitle: string; image: string }> = {
  P: {
    name: "Princípio",
    color: "#B8A88A",
    subtitle: "Base de Confiabilidade",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&crop=center&q=80",
  },
  A: {
    name: "Alinhamento",
    color: "#2E8B6A",
    subtitle: "Aderência Estratégica",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop&crop=center&q=80",
  },
  G: {
    name: "Governo",
    color: "#C8A951",
    subtitle: "Gestão Multidimensional",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop&crop=center&q=80",
  },
  O: {
    name: "Obediência",
    color: "#8B4C4C",
    subtitle: "Execução e Resultados",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop&crop=center&q=80",
  },
};

const TIEBREAK_ORDER: ("P" | "A" | "G" | "O")[] = ["G", "O", "A", "P"];

export default function CorporateDiagnosticoFlow({ onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [direction, setDirection] = useState(1);

  const question = corporateQuestions[currentIndex];
  const total = corporateQuestions.length;
  const progress = (Object.keys(answers).length / total) * 100;
  const isAnswered = answers[question.id] != null;
  const isLast = currentIndex === total - 1;
  const allAnswered = Object.keys(answers).length === total;

  // Track which pillar we're in for section transitions
  const prevPillar = currentIndex > 0 ? corporateQuestions[currentIndex - 1].pillar : null;
  const isNewPillar = prevPillar !== question.pillar;

  // Count questions in current pillar
  const pillarQuestions = useMemo(
    () => corporateQuestions.filter((q) => q.pillar === question.pillar),
    [question.pillar],
  );
  const pillarIndex = pillarQuestions.findIndex((q) => q.id === question.id) + 1;

  const handleAnswer = useCallback((questionId: string, value: number) => {
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
    const scores: Record<"P" | "A" | "G" | "O", number> = { P: mediaP, A: mediaA, G: mediaG, O: mediaO };
    const minScore = Math.min(mediaP, mediaA, mediaG, mediaO);
    const pilarMaisFraco = TIEBREAK_ORDER.find((p) => scores[p] === minScore) || "G";
    onComplete({ answers, answersP, answersA, answersG, answersO, mediaP, mediaA, mediaG, mediaO, mediaGeral, pilarMaisFraco });
  };

  const labels = anchorLabels[question.anchor];
  const info = pillarInfo[question.pillar];

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex flex-col">
      {/* Fixed background image with parallax effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.pillar}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={info.image}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.35) saturate(0.5)" }}
            />
          </motion.div>
        </AnimatePresence>
        {/* Gradient overlay — lighter to show more photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1B2D]/30 via-[#0F1B2D]/60 to-[#0F1B2D]/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto w-full flex-1 flex flex-col py-4">
        {/* Top bar: progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border-2"
                style={{ color: info.color, borderColor: info.color, backgroundColor: `${info.color}15` }}
              >
                {question.pillar}
              </span>
              <div>
                <p className="text-sm font-semibold text-[#FAFAF8]">{info.name}</p>
                <p className="text-[10px] text-[#FAFAF8]/30">{info.subtitle}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#FAFAF8]/60 font-[Montserrat]">
                <span className="text-[#FAFAF8] font-semibold">{pillarIndex}</span>
                <span className="text-[#FAFAF8]/20"> / {pillarQuestions.length}</span>
              </p>
              <p className="text-[10px] text-[#FAFAF8]/20">{Object.keys(answers).length}/{total} total</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-[#FAFAF8]/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: info.color }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="flex-1 flex items-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={question.id}
              custom={direction}
              initial={{ opacity: 0, y: direction * 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction * -30 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Question */}
              <div className="mb-8">
                {question.subgroup && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#FAFAF8]/20 font-[Montserrat] mb-3">
                    {question.subgroup}
                  </p>
                )}
                <h2 className="text-xl lg:text-2xl font-[Cormorant] text-[#FAFAF8] leading-relaxed">
                  {question.text}
                </h2>
              </div>

              {/* Scale options */}
              <div className="space-y-2.5">
                {[1, 2, 3, 4].map((value) => {
                  const isSelected = answers[question.id] === value;
                  const label = labels[value - 1];
                  return (
                    <motion.button
                      key={value}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswer(question.id, value)}
                      className={`relative w-full text-left px-5 py-4 rounded-xl border transition-all duration-300 flex items-center gap-4 overflow-hidden ${
                        isSelected
                          ? "border-[#B8A88A]/50 text-[#FAFAF8]"
                          : "border-[#FAFAF8]/5 text-[#FAFAF8]/50 hover:border-[#FAFAF8]/15 hover:text-[#FAFAF8]/70"
                      }`}
                      style={isSelected ? { backgroundColor: `${info.color}15` } : { backgroundColor: "rgba(15,27,45,0.5)" }}
                    >
                      {/* Flash/glow effect on selected */}
                      {isSelected && (
                        <motion.div
                          layoutId="selectedGlow"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: `radial-gradient(ellipse at 20% 50%, ${info.color}20 0%, transparent 70%)`,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      <span
                        className={`relative z-10 shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                          isSelected
                            ? "border-transparent text-[#1A2744]"
                            : "border-[#FAFAF8]/10 text-[#FAFAF8]/30"
                        }`}
                        style={isSelected ? { backgroundColor: info.color } : {}}
                      >
                        {value}
                      </span>
                      <span className="relative z-10 text-sm leading-relaxed font-[Montserrat]">{label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 mt-auto">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm text-[#FAFAF8]/40 hover:text-[#FAFAF8]/70 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>

          {isLast && allAnswered ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="relative flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold overflow-hidden group"
              style={{ backgroundColor: info.color, color: "#1A2744" }}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <CheckCircle2 className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Finalizar Diagnóstico</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={goNext}
              disabled={!isAnswered}
              className="relative flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-20 disabled:cursor-not-allowed overflow-hidden group"
              style={isAnswered ? { backgroundColor: `${info.color}20`, color: info.color } : {}}
            >
              {/* Button shine effect */}
              {isAnswered && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
              <span className="relative z-10">Próxima</span>
              <ChevronRight className="h-4 w-4 relative z-10" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
