import { useCorporate } from "@/contexts/CorporateContext";
import { trpc } from "@/lib/trpc";
import { History, TrendingUp, TrendingDown, Minus, ClipboardList } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { getStatusKey, statusLabels, statusColors } from "@/data/questions-corporate";

const PILLAR_COLORS: Record<string, string> = {
  P: "#B8A88A",
  A: "#2E8B6A",
  G: "#C8A951",
  O: "#8B4C4C",
};

const pillarNames: Record<string, string> = {
  P: "Princípio", A: "Alinhamento", G: "Governo", O: "Obediência",
};

const chartConfig: ChartConfig = {
  Geral: { label: "Média Geral", color: "#D4C8A8" },
  P: { label: "Princípio", color: PILLAR_COLORS.P },
  A: { label: "Alinhamento", color: PILLAR_COLORS.A },
  G: { label: "Governo", color: PILLAR_COLORS.G },
  O: { label: "Obediência", color: PILLAR_COLORS.O },
};

export default function EmployeeHistory() {
  const { orgId, orgName, orgSlug } = useCorporate();
  const { data: results, isLoading } = trpc.corporate.myResults.useQuery({ orgId });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-[#1A2744] animate-pulse" />
        ))}
      </div>
    );
  }

  const hasResults = results && results.length > 0;
  const hasMultiple = results && results.length >= 2;

  // Chart data (chronological — oldest first)
  const chartData = hasResults
    ? [...results].reverse().map((r, i) => ({
        date: new Date(r.createdAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          ...(i === 0 ? { year: "numeric" as const } : {}),
        }),
        Geral: Number(r.mediaGeral.toFixed(1)),
        P: Number(r.mediaP.toFixed(1)),
        A: Number(r.mediaA.toFixed(1)),
        G: Number(r.mediaG.toFixed(1)),
        O: Number(r.mediaO.toFixed(1)),
      }))
    : [];

  // Delta calculation (latest vs previous)
  const latest = results?.[0];
  const previous = results?.[1];
  const deltas = hasMultiple && latest && previous
    ? {
        Geral: Number((latest.mediaGeral - previous.mediaGeral).toFixed(1)),
        P: Number((latest.mediaP - previous.mediaP).toFixed(1)),
        A: Number((latest.mediaA - previous.mediaA).toFixed(1)),
        G: Number((latest.mediaG - previous.mediaG).toFixed(1)),
        O: Number((latest.mediaO - previous.mediaO).toFixed(1)),
      }
    : null;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">Evolução</p>
        <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8]">Histórico de Evolução</h1>
        <p className="text-sm text-[#FAFAF8]/40 mt-1">{orgName} — {results?.length ?? 0} diagnóstico(s)</p>
      </motion.div>

      {!hasResults ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-12 text-center">
          <History className="h-12 w-12 text-[#B8A88A]/30 mx-auto mb-4" />
          <p className="text-[#FAFAF8]/40 text-sm mb-4">Seu histórico aparecerá aqui conforme completar diagnósticos.</p>
          <Link href={`/corporate/${orgSlug}/diagnostico`}>
            <button className="px-5 py-2 rounded-lg bg-[#B8A88A] text-[#1A2744] text-sm font-semibold hover:bg-[#D4C8A8] transition-colors">
              Iniciar Diagnóstico
            </button>
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Delta cards */}
          {deltas && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-5 gap-3"
            >
              {(["Geral", "P", "A", "G", "O"] as const).map((key) => {
                const d = deltas[key];
                const isPositive = d > 0;
                const isNeutral = d === 0;
                const Icon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown;
                return (
                  <div key={key} className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/8 p-4 text-center">
                    <p className="text-[9px] uppercase tracking-wider text-[#FAFAF8]/25 font-[Montserrat] mb-2">
                      {key === "Geral" ? "Média Geral" : pillarNames[key] || key}
                    </p>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Icon className={`h-3.5 w-3.5 ${isPositive ? "text-[#2E8B6A]" : isNeutral ? "text-[#FAFAF8]/20" : "text-[#8B4C4C]"}`} />
                      <span className={`text-sm font-bold ${isPositive ? "text-[#2E8B6A]" : isNeutral ? "text-[#FAFAF8]/30" : "text-[#8B4C4C]"}`}>
                        {isPositive ? "+" : ""}{d}
                      </span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Evolution chart */}
          {hasMultiple && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-6"
            >
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50 font-[Montserrat] mb-6 text-center">
                Evolução ao Longo do Tempo
              </h2>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid stroke="#FAFAF8" strokeOpacity={0.03} />
                    <XAxis dataKey="date" tick={{ fill: "#FAFAF8", fontSize: 10, opacity: 0.3 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: "#FAFAF8", fontSize: 10, opacity: 0.3 }} axisLine={false} tickLine={false} ticks={[0, 3, 6, 10]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1A2744", border: "1px solid rgba(184,168,138,0.2)", borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: "#B8A88A", fontWeight: 600, marginBottom: 4 }}
                      itemStyle={{ color: "#FAFAF8", opacity: 0.7 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, opacity: 0.5 }} />
                    <Line type="monotone" dataKey="Geral" stroke="#D4C8A8" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 4, fill: "#1A2744", stroke: "#D4C8A8", strokeWidth: 2 }} />
                    {(["P", "A", "G", "O"] as const).map((p) => (
                      <Line key={p} type="monotone" dataKey={p} stroke={PILLAR_COLORS[p]} strokeWidth={1.5} strokeOpacity={0.6} dot={{ r: 3, fill: "#1A2744", stroke: PILLAR_COLORS[p], strokeWidth: 1.5 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </motion.div>
          )}

          {/* History list */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50 font-[Montserrat] mb-4">Todos os Diagnósticos</h2>
            <div className="space-y-3">
              {results.map((r, idx) => {
                const st = getStatusKey(r.mediaGeral);
                return (
                  <div
                    key={r.id}
                    className={`rounded-xl bg-[#1A2744] border p-5 ${idx === 0 ? "border-[#B8A88A]/20" : "border-[#B8A88A]/5"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? "bg-[#B8A88A]/15 text-[#B8A88A]" : "bg-[#FAFAF8]/5 text-[#FAFAF8]/30"}`}>
                          {idx === 0 ? <ClipboardList className="h-4 w-4" /> : `#${results.length - idx}`}
                        </div>
                        <div>
                          <p className="text-sm text-[#FAFAF8] font-medium">
                            {new Date(r.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                          </p>
                          <p className="text-[10px] text-[#FAFAF8]/25">
                            {idx === 0 ? "Mais recente" : `${Math.round((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24))} dias atrás`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#FAFAF8] font-[Cormorant]">{r.mediaGeral.toFixed(1)}</p>
                        <p className="text-[10px] font-medium" style={{ color: statusColors[st] }}>{statusLabels[st]}</p>
                      </div>
                    </div>

                    {/* Pillar scores row */}
                    <div className="grid grid-cols-4 gap-2">
                      {(["P", "A", "G", "O"] as const).map((p) => {
                        const score = r[`media${p}` as keyof typeof r] as number;
                        const pct = (score / 10) * 100;
                        return (
                          <div key={p} className="text-center">
                            <div className="h-1 bg-[#FAFAF8]/5 rounded-full overflow-hidden mb-1">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: PILLAR_COLORS[p], opacity: 0.5 }} />
                            </div>
                            <p className="text-[9px] text-[#FAFAF8]/20">{pillarNames[p]}</p>
                            <p className="text-xs text-[#FAFAF8]/50 font-semibold">{score.toFixed(1)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
