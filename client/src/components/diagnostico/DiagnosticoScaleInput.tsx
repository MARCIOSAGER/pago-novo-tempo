import { useLanguage } from "@/contexts/LanguageContext";

interface DiagnosticoScaleInputProps {
  question: string;
  value: number | null;
  onSelect: (value: number) => void;
  questionNumber: number;
  totalQuestions: number;
  darkBackground?: boolean;
  highlight?: boolean;
}

export default function DiagnosticoScaleInput({
  question,
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
            darkBackground ? "text-gold/60" : "text-gold"
          }`}
        >
          {questionNumber}/{totalQuestions}
        </span>
        <p
          className={`font-body text-base lg:text-lg leading-relaxed mt-1 ${
            darkBackground ? "text-warm-white/90" : "text-navy/90"
          }`}
        >
          {question}
        </p>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between mb-2">
        <span
          className={`font-accent text-[9px] uppercase tracking-[0.2em] ${
            darkBackground ? "text-warm-white/40" : "text-navy/40"
          }`}
        >
          {t.diagnostico.scale.low}
        </span>
        <span
          className={`font-accent text-[9px] uppercase tracking-[0.2em] ${
            darkBackground ? "text-warm-white/40" : "text-navy/40"
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
              ? " border border-gold/30 text-warm-white/60 hover:border-gold/60 hover:bg-gold/10"
              : " border border-gold/40 text-navy/60 hover:border-gold hover:bg-gold/10";
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
