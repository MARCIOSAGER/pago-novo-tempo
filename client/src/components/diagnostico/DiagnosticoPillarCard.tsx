import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStatusInfo } from "./useDiagnosticoReducer";
import type { PillarKey } from "./useDiagnosticoReducer";

interface DiagnosticoPillarCardProps {
  pillar: PillarKey;
  average: number;
  delay?: number;
}

export default function DiagnosticoPillarCard({
  pillar,
  average,
  delay = 0,
}: DiagnosticoPillarCardProps) {
  const { t } = useLanguage();
  const pillarData = t.diagnostico.pillars[pillar];
  const status = getStatusInfo(average);
  const statusLabel = t.diagnostico.results.status[status.key];
  const progressPercent = (average / 10) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-warm-white p-6 lg:p-8"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="font-display text-4xl font-semibold text-gold">
            {pillarData.letter}
          </span>
          <h3 className="font-display text-xl font-semibold text-navy mt-1">
            {pillarData.name}
          </h3>
          <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-navy/40 mt-1">
            {pillarData.subtitle}
          </p>
        </div>
        <span className="font-display text-3xl font-semibold text-navy">
          {average.toFixed(1)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] bg-sand/60 mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
          className="h-full"
          style={{ backgroundColor: status.color }}
        />
      </div>

      {/* Status badge */}
      <span
        className="inline-block font-accent text-[10px] uppercase tracking-[0.2em] px-3 py-1 border"
        style={{ borderColor: status.color, color: status.color }}
      >
        {statusLabel}
      </span>
    </motion.div>
  );
}
