import { useLanguage } from "@/contexts/LanguageContext";
import type { PillarKey } from "./useDiagnosticoReducer";

interface DiagnosticoProgressBarProps {
  currentStep: number; // 1-5 (1=P, 2=A, 3=G, 4=O, 5=results)
  completedSteps: boolean[];
  onStepClick: (step: number) => void;
}

const STEPS: { pillar: PillarKey | null; label: string }[] = [
  { pillar: "P", label: "P" },
  { pillar: "A", label: "A" },
  { pillar: "G", label: "G" },
  { pillar: "O", label: "O" },
];

export default function DiagnosticoProgressBar({
  currentStep,
  completedSteps,
  onStepClick,
}: DiagnosticoProgressBarProps) {
  const { t } = useLanguage();

  // Get current section name
  const getCurrentLabel = () => {
    if (currentStep === 5) return t.diagnostico.progress.results;
    const pillarKey = STEPS[currentStep - 1]?.pillar;
    if (!pillarKey) return "";
    const pillar = t.diagnostico.pillars[pillarKey];
    return pillar.name;
  };

  // Progress percentage (0-100)
  const progressPercent = currentStep === 5 ? 100 : ((currentStep - 1) / 4) * 100;

  return (
    <div className="sticky top-20 z-30 bg-warm-white/95 backdrop-blur-md border-b border-sand/50 py-3 no-print">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Step label */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-accent text-[10px] uppercase tracking-[0.3em] text-navy/50">
            {currentStep <= 4
              ? `${t.diagnostico.progress.step} ${currentStep} ${t.diagnostico.progress.of} 4 — ${getCurrentLabel()}`
              : t.diagnostico.progress.results}
          </span>
          <span className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold">
            {Math.round(progressPercent)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-[2px] bg-sand/60 mb-3">
          <div
            className="absolute top-0 left-0 h-full bg-gold transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => {
            const stepNum = i + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = completedSteps[i];
            const canClick = isCompleted || stepNum < currentStep;

            return (
              <button
                key={step.label}
                type="button"
                onClick={() => canClick && onStepClick(stepNum)}
                disabled={!canClick}
                className={`flex items-center gap-2 font-accent text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
                  isActive
                    ? "text-gold font-medium"
                    : isCompleted
                      ? "text-navy cursor-pointer hover:text-gold"
                      : "text-navy/30 cursor-default"
                }`}
              >
                <span
                  className={`w-6 h-6 flex items-center justify-center text-[10px] transition-all duration-300 ${
                    isActive
                      ? "bg-gold text-navy"
                      : isCompleted
                        ? "bg-navy text-warm-white"
                        : "border border-navy/20 text-navy/30"
                  }`}
                >
                  {step.label}
                </span>
                <span className="hidden sm:inline">{t.diagnostico.pillars[step.pillar!].name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
