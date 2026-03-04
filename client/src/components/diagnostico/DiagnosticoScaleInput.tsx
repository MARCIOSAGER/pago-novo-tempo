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
  anchorType: "F" | "E";
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
  anchorType,
}: DiagnosticoScaleInputProps) {
  const { t } = useLanguage();

  const anchors = t.diagnostico.anchors[anchorType];

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

      {/* 4 anchor buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {anchors.map((label: string, i: number) => {
          const num = i + 1; // 1-4
          const isSelected = value === num;

          let btnClass =
            "flex items-center justify-center w-full px-2 py-3 font-accent text-[11px] uppercase tracking-[0.15em] transition-all duration-200 cursor-pointer select-none text-center leading-tight min-h-[48px]";

          if (isSelected) {
            btnClass += darkBackground
              ? " bg-gold border border-gold text-navy font-medium"
              : " bg-navy border border-navy text-warm-white font-medium";
          } else {
            btnClass += darkBackground
              ? " border border-gold/50 text-warm-white/80 hover:border-gold hover:bg-gold/15"
              : " border border-navy/30 text-navy/70 hover:border-navy/60 hover:bg-navy/5";
          }

          return (
            <button
              key={num}
              type="button"
              onClick={() => onSelect(num)}
              className={btnClass}
              aria-label={label}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
