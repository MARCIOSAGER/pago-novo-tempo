import { useCorporate } from "@/contexts/CorporateContext";
import { trpc } from "@/lib/trpc";
import { BarChart3, ClipboardList, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

function getStatusLabel(score: number): { label: string; color: string } {
  if (score >= 8) return { label: "Pilar Sólido", color: "#2E8B6A" };
  if (score >= 5.5) return { label: "Em Construção", color: "#B8A88A" };
  if (score >= 3) return { label: "Pilar Frágil", color: "#C8A951" };
  return { label: "Em Colapso", color: "#8B4C4C" };
}

const pillarNames: Record<string, string> = {
  P: "Princípio",
  A: "Alinhamento",
  G: "Governo",
  O: "Obediência",
};

const chartConfig: ChartConfig = {
  you: { label: "Você", color: "#B8A88A" },
  company: { label: "Empresa", color: "#4A7A9B" },
};

export default function EmployeeResults() {
  const { orgId, orgName, orgSlug } = useCorporate();

  const { data: results, isLoading } = trpc.corporate.myResults.useQuery({ orgId });
  const { data: companyAvg } = trpc.corporate.companyAverage.useQuery({ orgId });

  const latest = results?.[0];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-[#1A2744] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">
            Resultados
          </p>
          <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8]">
            Meus Resultados
          </h1>
          <p className="text-sm text-[#FAFAF8]/40 mt-1">{orgName}</p>
        </div>
        <div className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-12 text-center">
          <ClipboardList className="h-12 w-12 text-[#B8A88A]/30 mx-auto mb-4" />
          <p className="text-[#FAFAF8]/40 text-sm mb-4">
            Nenhum resultado disponível. Complete o diagnóstico primeiro.
          </p>
          <Link href={`/corporate/${orgSlug}/diagnostico`}>
            <button className="px-5 py-2 rounded-lg bg-[#B8A88A] text-[#1A2744] text-sm font-semibold hover:bg-[#D4C8A8] transition-colors">
              Iniciar Diagnóstico
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const pillars = (["P", "A", "G", "O"] as const).map((p) => ({
    key: p,
    name: pillarNames[p],
    score: latest[`media${p}` as keyof typeof latest] as number,
    ...(companyAvg ? { companyScore: companyAvg[`avg${p}` as keyof typeof companyAvg] as number } : {}),
  }));

  const radarData = pillars.map((p) => ({
    name: p.name,
    you: p.score,
    ...(companyAvg ? { company: p.companyScore } : {}),
    fullMark: 10,
  }));

  const overallStatus = getStatusLabel(latest.mediaGeral);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">
          Resultados
        </p>
        <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8]">
          Meus Resultados
        </h1>
        <p className="text-sm text-[#FAFAF8]/40 mt-1">
          {orgName} — {new Date(latest.createdAt).toLocaleDateString("pt-BR")}
        </p>
      </div>

      {/* Overall score */}
      <div className="rounded-xl bg-gradient-to-br from-[#1A2744] to-[#2A3A5C] border border-[#B8A88A]/15 p-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50 mb-2">Média Geral</p>
        <p className="text-5xl font-bold text-[#FAFAF8] font-[Cormorant]">
          {latest.mediaGeral.toFixed(1)}
        </p>
        <p className="text-sm font-medium mt-1" style={{ color: overallStatus.color }}>
          {overallStatus.label}
        </p>
      </div>

      {/* Radar chart */}
      <div className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-6">
        <h2 className="text-sm font-medium text-[#FAFAF8]/60 mb-4 text-center">
          Perfil P.A.G.O.{companyAvg ? " (Você vs Empresa)" : ""}
        </h2>
        <div className="w-full max-w-sm mx-auto">
          <ChartContainer config={chartConfig} className="aspect-square">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="55%">
              <PolarGrid stroke="#B8A88A" strokeOpacity={0.15} radialLines={false} />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fill: "#FAFAF8", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
              {companyAvg && (
                <Radar
                  name="Empresa"
                  dataKey="company"
                  stroke="#4A7A9B"
                  strokeWidth={1.5}
                  fill="#4A7A9B"
                  fillOpacity={0.1}
                  dot={{ r: 3, fill: "#0F1B2D", stroke: "#4A7A9B", strokeWidth: 1.5 }}
                />
              )}
              <Radar
                name="Você"
                dataKey="you"
                stroke="#B8A88A"
                strokeWidth={2}
                fill="#B8A88A"
                fillOpacity={0.2}
                dot={{ r: 4, fill: "#1A2744", stroke: "#B8A88A", strokeWidth: 2 }}
              />
            </RadarChart>
          </ChartContainer>
        </div>
        {companyAvg && (
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#B8A88A]" />
              <span className="text-xs text-[#FAFAF8]/40">Você</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#4A7A9B]" />
              <span className="text-xs text-[#FAFAF8]/40">Empresa ({companyAvg.count} respostas)</span>
            </div>
          </div>
        )}
      </div>

      {/* Pillar scores */}
      <div className="grid sm:grid-cols-2 gap-4">
        {pillars.map((p) => {
          const status = getStatusLabel(p.score);
          const isWeakest = latest.pilarMaisFraco === p.key;
          return (
            <div
              key={p.key}
              className={`rounded-xl bg-[#1A2744] border p-5 ${
                isWeakest ? "border-[#C8A951]/30" : "border-[#B8A88A]/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#B8A88A]">{p.key}.</span>
                  <span className="text-sm font-medium text-[#FAFAF8]">{p.name}</span>
                </div>
                {isWeakest && (
                  <span className="text-[9px] uppercase tracking-wider text-[#C8A951] bg-[#C8A951]/10 px-2 py-0.5 rounded-full">
                    Foco
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-[#FAFAF8] font-[Cormorant]">
                    {p.score.toFixed(1)}
                  </p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: status.color }}>
                    {status.label}
                  </p>
                </div>
                {p.companyScore !== undefined && (
                  <div className="text-right">
                    <p className="text-xs text-[#FAFAF8]/25">Empresa</p>
                    <p className="text-sm text-[#4A7A9B] font-medium">
                      {p.companyScore.toFixed(1)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
