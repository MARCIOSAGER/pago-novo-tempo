import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

interface DiagnosticoEvolutionProps {
  email: string;
}

const PILLAR_COLORS: Record<string, string> = {
  P: "#B8A88A",
  A: "#2E5E3E",
  G: "#8B6914",
  O: "#7A3030",
};

export default function DiagnosticoEvolution({ email }: DiagnosticoEvolutionProps) {
  const { t } = useLanguage();
  const historyQuery = trpc.diagnostico.history.useQuery(
    { email },
    { enabled: !!email && email.includes("@") }
  );

  if (!historyQuery.data || historyQuery.data.items.length < 2) {
    return null;
  }

  const items = historyQuery.data.items;

  const chartData = items.map((item, index) => ({
    date: new Date(item.createdAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: index === 0 || new Date(item.createdAt).getFullYear() !== new Date(items[0].createdAt).getFullYear() ? "numeric" : undefined,
    }),
    P: item.mediaP,
    A: item.mediaA,
    G: item.mediaG,
    O: item.mediaO,
    Geral: Number(item.mediaGeral.toFixed(1)),
  }));

  const pillarNames = t.diagnostico.pillars;

  return (
    <section className="bg-navy py-16 lg:py-24 no-print">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold text-center mb-4">
            {(t.diagnostico.results as any).evolutionLabel}
          </p>
          <p className="font-body text-sm text-warm-white/50 text-center mb-10">
            {(t.diagnostico.results as any).evolutionDescription}
          </p>

          <div className="bg-warm-white/5 border border-warm-white/10 p-6 lg:p-8 backdrop-blur-sm">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a2332",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#f5f0eb",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  formatter={(value: string) => {
                    if (value === "Geral") return (t.diagnostico.results as any).overallLabel ?? "Média Geral";
                    return pillarNames[value as keyof typeof pillarNames]?.name ?? value;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Geral"
                  stroke="#D4AF37"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#D4AF37" }}
                  activeDot={{ r: 6 }}
                />
                {(["P", "A", "G", "O"] as const).map((pillar) => (
                  <Line
                    key={pillar}
                    type="monotone"
                    dataKey={pillar}
                    stroke={PILLAR_COLORS[pillar]}
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={{ r: 3, fill: PILLAR_COLORS[pillar] }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary of changes */}
          {items.length >= 2 && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-4">
              {(["Geral", "P", "A", "G", "O"] as const).map((key) => {
                const first = key === "Geral" ? items[0].mediaGeral : items[0][`media${key}` as keyof typeof items[0]] as number;
                const last = key === "Geral" ? items[items.length - 1].mediaGeral : items[items.length - 1][`media${key}` as keyof typeof items[0]] as number;
                const diff = Number((last - first).toFixed(1));
                const label = key === "Geral"
                  ? ((t.diagnostico.results as any).overallLabel ?? "Geral")
                  : pillarNames[key as keyof typeof pillarNames]?.letter ?? key;

                return (
                  <div key={key} className="text-center">
                    <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-warm-white/40 mb-1">
                      {label}
                    </p>
                    <p
                      className="font-display text-lg font-semibold"
                      style={{ color: diff > 0 ? "#2E5E3E" : diff < 0 ? "#7A3030" : "rgba(255,255,255,0.5)" }}
                    >
                      {diff > 0 ? "+" : ""}{diff}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
