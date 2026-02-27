import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/i18n";
import { Globe } from "lucide-react";

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "pt", label: "PT", flag: "🇧🇷" },
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "es", label: "ES", flag: "🇪🇸" },
];

interface LanguageSelectorProps {
  variant?: "navbar" | "mobile";
}

export default function LanguageSelector({ variant = "navbar" }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = languages.find((l) => l.code === language)!;

  if (variant === "mobile") {
    return (
      <div className="flex items-center gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-accent uppercase tracking-[0.15em] transition-all duration-300 ${
              language === lang.code
                ? "text-gold border-b border-gold"
                : "text-warm-white/50 hover:text-warm-white"
            }`}
          >
            <span className="text-sm">{lang.flag}</span>
            {lang.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-warm-white/60 hover:text-warm-white transition-colors duration-300 group"
        aria-label="Select language"
      >
        <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span className="font-accent text-[10px] uppercase tracking-[0.15em]">
          {current.flag} {current.label}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-navy/95 backdrop-blur-md border border-warm-white/10 shadow-lg z-50 min-w-[120px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all duration-200 ${
                language === lang.code
                  ? "text-gold bg-warm-white/5"
                  : "text-warm-white/60 hover:text-warm-white hover:bg-warm-white/5"
              }`}
            >
              <span className="text-sm">{lang.flag}</span>
              <span className="font-accent text-[10px] uppercase tracking-[0.15em]">
                {lang.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
