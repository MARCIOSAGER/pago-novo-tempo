import { useLanguage } from "@/contexts/LanguageContext";

interface DiagnosticoScaleInputProps {
  question: string;
  example?: string;
  value: number | null;
  onSelect: (value: number) => void;
  questionNumber: number;
  totalQuestions: number;
  darkBackground?: boolean;
  highlight?: boolean;
}

export default function DiagnosticoScaleInput({
  question,
  example,
  value,
  onSelect,
  questionNumber,
  totalQuestions,
  darkBackground = false,
  highlight = false,
}: DiagnosticoScaleInputProps) {
  const { t } = useLanguage();

  return (
    <div
      className={`py-6 ${highlight && value === null ? "ring-1 ring-gold/40 rounded px-4 -mx-4" : ""}`}
    >
      {/* Question number + text */}
      <div className="mb-4">
        <span
          className={`font-accent text-[10px] uppercase tracking-[0.3em] ${
            darkBackground ? "text-gold/80" : "text-navy/40"
          }`}
        >
          {questionNumber}/{totalQuestions}
        </span>
        <p
          className={`font-body text-base lg:text-lg leading-relaxed mt-1 ${
            darkBackground ? "text-warm-white" : "text-navy"
          }`}
        >
          {question}
        </p>
        {example && (
          <p
            className={`font-body text-xs leading-relaxed mt-1.5 italic ${
              darkBackground ? "text-warm-white/50" : "text-navy/50"
            }`}
          >
            {example}
          </p>
        )}
      </div>

      {/* Scale labels */}
      <div className="flex justify-between mb-2">
        <span
          className={`font-accent text-[9px] uppercase tracking-[0.2em] ${
            darkBackground ? "text-warm-white/60" : "text-navy/60"
          }`}
        >
          {t.diagnostico.scale.low}
        </span>
        <span
          className={`font-accent text-[9px] uppercase tracking-[0.2em] ${
            darkBackground ? "text-warm-white/60" : "text-navy/60"
          }`}
        >
          {t.diagnostico.scale.high}
        </span>
      </div>

      {/* 1-10 buttons */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
          const isSelected = value === num;
          let baseClass =
            "flex items-center justify-center w-full aspect-square font-accent text-sm font-medium transition-all duration-200 cursor-pointer select-none";

          if (isSelected) {
            baseClass += darkBackground
              ? " bg-gold border border-gold text-navy"
              : " bg-navy border border-navy text-warm-white";
          } else {
            baseClass += darkBackground
              ? " border border-gold/50 text-warm-white/80 hover:border-gold hover:bg-gold/15"
              : " border border-navy/30 text-navy/70 hover:border-navy/60 hover:bg-navy/5";
          }

          return (
            <button
              key={num}
              type="button"
              onClick={() => onSelect(num)}
              className={baseClass}
              aria-label={`${num}`}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}
