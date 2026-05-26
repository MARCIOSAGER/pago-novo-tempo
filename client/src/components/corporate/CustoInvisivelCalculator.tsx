import { useMemo, useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  onCta?: () => void;
  currency?: "BRL" | "USD";
}

function formatMoney(v: number, currency: "BRL" | "USD") {
  const locale = currency === "BRL" ? "pt-BR" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(v);
}

export default function CustoInvisivelCalculator({ onCta, currency }: Props) {
  const { t, language } = useLanguage();
  const c = t.corporate.home.calculadora;

  const ccy = currency ?? (language === "pt" ? "BRL" : "USD");

  const [employees, setEmployees] = useState(700);
  const [turnover, setTurnover] = useState(15);
  const [salary, setSalary] = useState(ccy === "BRL" ? 8000 : 4000);

  // Annual invisible cost = employees × monthlySalary × 12 × turnoverPct × 0.34
  // The 0.34 multiplier maps to "34% of annual salary is the cost of disengagement"
  const result = useMemo(
    () => Math.round(employees * salary * 12 * (turnover / 100) * 0.34),
    [employees, turnover, salary]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto bg-[#0F1B2D]/70 border border-[#C9A84C]/30 rounded-2xl p-8 sm:p-12 backdrop-blur-sm"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <Calculator className="w-5 h-5 text-[#C9A84C]" />
        <h3 className="font-[Cormorant] text-2xl sm:text-3xl font-semibold text-[#FAFAF8] text-center">
          {c.title}
        </h3>
      </div>
      <p className="font-[Montserrat] text-sm text-[#FAFAF8]/60 text-center mb-10 max-w-xl mx-auto">
        {c.subtitle}
      </p>

      {/* Slider: employees */}
      <SliderRow
        label={c.colaboradoresLabel}
        value={employees}
        display={employees.toLocaleString(language === "pt" ? "pt-BR" : "en-US")}
        min={50}
        max={5000}
        step={10}
        onChange={setEmployees}
        minLabel="50"
        maxLabel="5.000"
      />

      <SliderRow
        label={c.turnoverLabel}
        value={turnover}
        display={`${turnover}%`}
        min={5}
        max={50}
        step={1}
        onChange={setTurnover}
        minLabel="5%"
        maxLabel="50%"
      />

      <SliderRow
        label={c.salarioLabel}
        value={salary}
        display={formatMoney(salary, ccy)}
        min={ccy === "BRL" ? 2000 : 1000}
        max={ccy === "BRL" ? 30000 : 15000}
        step={ccy === "BRL" ? 500 : 250}
        onChange={setSalary}
        minLabel={formatMoney(ccy === "BRL" ? 2000 : 1000, ccy)}
        maxLabel={formatMoney(ccy === "BRL" ? 30000 : 15000, ccy)}
      />

      {/* Result */}
      <div className="mt-10 pt-8 border-t border-[#C9A84C]/15 text-center">
        <p className="font-[Montserrat] text-sm text-[#FAFAF8]/60 mb-3">
          {c.resultLead}
        </p>
        <motion.p
          key={result}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="font-[Cormorant] text-4xl sm:text-5xl font-bold text-[#C9A84C] mb-2"
        >
          {formatMoney(result, ccy)}
        </motion.p>
        <p className="font-[Montserrat] text-xs sm:text-sm text-[#FAFAF8]/50 mb-8">
          {c.resultSuffix}
        </p>

        <button
          onClick={onCta}
          className="group inline-flex items-center gap-2 bg-[#C9A84C] text-[#0F1B2D] font-[Montserrat] font-semibold text-sm uppercase tracking-wider px-7 py-3.5 rounded-lg hover:bg-[#D4B86A] transition-colors duration-300"
        >
          {c.cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
}

function SliderRow({ label, display, min, max, step, value, onChange, minLabel, maxLabel }: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-7">
      <div className="flex items-end justify-between mb-3">
        <label className="font-[Montserrat] text-sm text-[#FAFAF8]/85 font-medium">
          {label}
        </label>
        <span className="font-[Cormorant] text-xl sm:text-2xl font-bold text-[#C9A84C]">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
        style={{
          background: `linear-gradient(to right, #C9A84C 0%, #C9A84C ${pct}%, rgba(250,250,248,0.12) ${pct}%, rgba(250,250,248,0.12) 100%)`,
        }}
      />
      <div className="flex justify-between mt-1.5 font-[Montserrat] text-[10px] text-[#FAFAF8]/40">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
