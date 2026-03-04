import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import DiagnosticoProgressBar from "./DiagnosticoProgressBar";
import DiagnosticoQuestionGroup from "./DiagnosticoQuestionGroup";
import DiagnosticoResults from "./DiagnosticoResults";
import { useDiagnosticoReducer } from "./useDiagnosticoReducer";
import type { PillarKey } from "./useDiagnosticoReducer";
import DiagnosticoHeroSection from "./DiagnosticoHeroSection";
import DiagnosticoIntro from "./DiagnosticoIntro";

export default function DiagnosticoQuestionnaire() {
  const { t } = useLanguage();
  const {
    state,
    dispatch,
    pillarAverage,
    overallAverage,
    weakestPillar,
    emotionalAverage,
    isStepComplete,
    chartData,
    hasSavedState,
    getPillarForStep,
    PILLAR_ORDER,
  } = useDiagnosticoReducer();

  const [showHighlights, setShowHighlights] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  const handleStart = useCallback(
    (nome: string) => {
      dispatch({ type: "SET_NAME", nome });
      setShowIntro(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [dispatch]
  );

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    dispatch({ type: "NEXT_STEP" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch]);

  const handleContinue = useCallback(() => {
    // Keep existing state, just make sure we're on the right step
    if (state.currentStep === 0) {
      dispatch({ type: "GO_TO_STEP", step: 1 });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch, state.currentStep]);

  const handleRestart = useCallback(() => {
    dispatch({ type: "RESET" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch]);

  const handleNext = useCallback(() => {
    const currentStep = state.currentStep;
    if (!isStepComplete(currentStep)) {
      setShowHighlights(true);
      toast.error(t.diagnostico.navigation.answerAll);
      return;
    }
    setShowHighlights(false);

    if (currentStep === 4) {
      dispatch({ type: "COMPLETE" });
    } else {
      dispatch({ type: "NEXT_STEP" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.currentStep, isStepComplete, dispatch, t]);

  const handlePrev = useCallback(() => {
    setShowHighlights(false);
    dispatch({ type: "PREV_STEP" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch]);

  const handleStepClick = useCallback(
    (step: number) => {
      setShowHighlights(false);
      dispatch({ type: "GO_TO_STEP", step });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [dispatch]
  );

  const handleAnswer = useCallback(
    (pillar: PillarKey, index: number, value: number) => {
      dispatch({ type: "SET_ANSWER", pillar, index, value });
    },
    [dispatch]
  );

  // Hero/start screen
  if (state.currentStep === 0 && !showIntro) {
    return (
      <DiagnosticoHeroSection
        nome={state.nome}
        onStart={handleStart}
        hasSavedState={hasSavedState && state.nome !== ""}
        onContinue={handleContinue}
        onRestart={handleRestart}
      />
    );
  }

  // Intro screen (between hero and questions)
  if (state.currentStep === 0 && showIntro) {
    return (
      <div className="pt-20">
        <DiagnosticoIntro onStart={handleIntroComplete} />
      </div>
    );
  }

  // Results screen
  if (state.currentStep === 5) {
    const pillarAverages = PILLAR_ORDER.reduce(
      (acc, p) => {
        acc[p] = pillarAverage(p);
        return acc;
      },
      {} as Record<PillarKey, number>
    );

    return (
      <DiagnosticoResults
        nome={state.nome}
        pillarAverages={pillarAverages}
        overallAverage={overallAverage()}
        weakestPillar={weakestPillar()}
        chartData={chartData}
        answers={state.answers}
        onRestart={handleRestart}
        emotionalAverage={emotionalAverage()}
      />
    );
  }

  // Questionnaire steps 1-4
  const currentPillar = getPillarForStep(state.currentStep);
  if (!currentPillar) return null;

  const completedSteps = PILLAR_ORDER.map((_, i) => isStepComplete(i + 1));

  return (
    <div className="pt-20">
      <DiagnosticoProgressBar
        currentStep={state.currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <DiagnosticoQuestionGroup
            pillar={currentPillar}
            answers={state.answers[currentPillar]}
            onAnswer={(index, value) => handleAnswer(currentPillar, index, value)}
            showHighlights={showHighlights}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="py-12 lg:py-16 bg-warm-white border-t border-navy/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={state.currentStep <= 1}
            className="font-accent text-xs uppercase tracking-[0.2em] px-8 py-4 border border-navy/30 text-navy hover:border-navy/60 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t.diagnostico.navigation.previous}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="btn-shine font-accent text-xs uppercase tracking-[0.2em] bg-gold text-navy px-8 py-4 hover:bg-gold-light transition-all duration-300"
          >
            {state.currentStep === 4
              ? t.diagnostico.navigation.seeResults
              : t.diagnostico.navigation.next}
          </button>
        </div>
      </div>
    </div>
  );
}
