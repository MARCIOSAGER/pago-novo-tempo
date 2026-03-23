import { useCorporate } from "@/contexts/CorporateContext";
import { trpc } from "@/lib/trpc";
import { Users, ClipboardList, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { statusColors, getStatusKey, statusLabels } from "@/data/questions-corporate";

const pillarNames: Record<string, string> = {
  P: "Princípio", A: "Alinhamento", G: "Governo", O: "Obediência",
};

const chartConfig: ChartConfig = { avg: { label: "Média Org", color: "#B8A88A" } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function HRDashboard() {
  const { orgId, orgName } = useCorporate();
  const { data: metrics, isLoading } = trpc.corporate.hrMetrics.useQuery({ orgId });

  const hasData = metrics && metrics.diagnosticCount > 0;

  const radarData = hasData
    ? (["P", "A", "G", "O"] as const).map((p) => ({
        name: pillarNames[p],
        avg: metrics[`avg${p}` as keyof typeof metrics] as number,
        fullMark: 10,
      }))
    : [];

  return (
    <div className="space-y-8 max-w-5xl">
      <motion.div {...fadeUp}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">Recursos Humanos</p>
        <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8]">Painel RH</h1>
        <p className="text-sm text-[#FAFAF8]/40 mt-1">{orgName}</p>
      </motion.div>

      {/* KPIs */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Membros Ativos", value: isLoading ? "—" : String(metrics?.activeMembers ?? 0), sub: `${metrics?.totalMembers ?? 0} total` },
          { icon: ClipboardList, label: "Diagnósticos", value: isLoading ? "—" : String(metrics?.diagnosticCount ?? 0), sub: hasData ? `Média: ${metrics.avgGeral}` : "Sem dados" },
          { icon: TrendingUp, label: "Taxa de Conclusão", value: isLoading ? "—" : `${metrics?.completionRate ?? 0}%`, sub: "Diagnósticos / Ativos" },
          { icon: AlertTriangle, label: "Pilar Mais Fraco", value: isLoading ? "—" : metrics?.weakestPillar ?? "—", sub: hasData ? pillarNames[metrics.weakestPillar] || "—" : "Sem dados" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/8 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-[#B8A88A]/50 font-medium uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className="h-4 w-4 text-[#B8A88A]/25" />
            </div>
            <p className="text-3xl font-bold text-[#FAFAF8] font-[Cormorant]">{kpi.value}</p>
            <p className="text-[10px] text-[#FAFAF8]/20 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </motion.div>

      {hasData ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Org Radar */}
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50 text-center mb-4">Perfil Médio da Organização</h2>
            <ChartContainer config={chartConfig} className="aspect-square max-w-[280px] mx-auto">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="55%">
                <PolarGrid stroke="#B8A88A" strokeOpacity={0.15} radialLines={false} />
                <PolarAngleAxis dataKey="name" tick={{ fill: "#FAFAF8", fontSize: 11, fontFamily: "Montserrat, sans-serif", fontWeight: 500 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
                <Radar name="Média Org" dataKey="avg" stroke="#B8A88A" strokeWidth={2} fill="#B8A88A" fillOpacity={0.2} dot={{ r: 4, fill: "#1A2744", stroke: "#B8A88A", strokeWidth: 2 }} />
              </RadarChart>
            </ChartContainer>
          </motion.div>

          {/* Pillar breakdown */}
          <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50 mb-6">Scores por Pilar</h2>
            <div className="space-y-5">
              {(["P", "A", "G", "O"] as const).map((p) => {
                const score = metrics[`avg${p}` as keyof typeof metrics] as number;
                const st = getStatusKey(score);
                const pct = (score / 10) * 100;
                const isWeakest = metrics.weakestPillar === p;
                return (
                  <div key={p}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isWeakest ? "text-[#C8A951]" : "text-[#B8A88A]"}`}>{p}.</span>
                        <span className="text-sm text-[#FAFAF8]">{pillarNames[p]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]" style={{ color: statusColors[st] }}>{statusLabels[st]}</span>
                        <span className="text-sm font-bold text-[#FAFAF8] font-[Cormorant] w-8 text-right">{score.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-[#FAFAF8]/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: isWeakest ? "#C8A951" : "#B8A88A", opacity: isWeakest ? 0.8 : 0.4 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-8 text-center">
          <BarChart3 className="h-12 w-12 text-[#B8A88A]/20 mx-auto mb-4" />
          <p className="text-[#FAFAF8]/40 text-sm">Os dados do dashboard serão populados conforme os membros completarem seus diagnósticos.</p>
        </motion.div>
      )}
    </div>
  );
}
