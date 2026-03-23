import { useCorporate } from "@/contexts/CorporateContext";
import { trpc } from "@/lib/trpc";
import { ClipboardList, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import CruzProfissional from "@/components/corporate/CruzProfissional";
import { getDiagnosticText } from "@/data/diagnostics-corporate";
import {
  calcSubgroupScore, getWeakestSubgroup, calcCruzProfissional,
  getStatusKey, statusLabels, statusColors, type StatusKey,
} from "@/data/questions-corporate";

const pillarNames: Record<string, string> = {
  P: "Princípio", A: "Alinhamento", G: "Governo", O: "Obediência",
};

const chartConfig: ChartConfig = {
  you: { label: "Você", color: "#B8A88A" },
  company: { label: "Empresa", color: "#4A7A9B" },
};

const subgroupLabels: Record<string, string> = {
  vertical: "Com a liderança", horizontal: "Com os pares", internal: "Consigo mesmo",
  disciplinar: "Disciplinar", emocional: "Emocional", financeiro: "Financeiro", temporal: "Temporal",
  basica: "Básica", radical: "Radical", fruto: "Fruto",
};

const pillarSubgroups: Record<string, string[]> = {
  A: ["vertical", "horizontal", "internal"],
  G: ["disciplinar", "emocional", "financeiro", "temporal"],
  O: ["basica", "radical", "fruto"],
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">Resultados</p>
          <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8]">Meus Resultados</h1>
          <p className="text-sm text-[#FAFAF8]/40 mt-1">{orgName}</p>
        </div>
        <div className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-12 text-center">
          <ClipboardList className="h-12 w-12 text-[#B8A88A]/30 mx-auto mb-4" />
          <p className="text-[#FAFAF8]/40 text-sm mb-4">Nenhum resultado disponível. Complete o diagnóstico primeiro.</p>
          <Link href={`/corporate/${orgSlug}/diagnostico`}>
            <button className="px-5 py-2 rounded-lg bg-[#B8A88A] text-[#1A2744] text-sm font-semibold hover:bg-[#D4C8A8] transition-colors">
              Iniciar Diagnóstico
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Build answers map from stored arrays to calculate subgroups & cruz
  const buildAnswersMap = () => {
    const map: Record<string, number> = {};
    const pillars = ["P", "A", "G", "O"] as const;
    const arrays = [latest.answersP, latest.answersA, latest.answersG, latest.answersO];
    pillars.forEach((p, pi) => {
      (arrays[pi] as number[]).forEach((v: number, qi: number) => {
        map[`${p}${qi + 1}`] = v;
      });
    });
    return map;
  };
  const answersMap = buildAnswersMap();

  const pillars = (["P", "A", "G", "O"] as const).map((p) => {
    const score = latest[`media${p}` as keyof typeof latest] as number;
    const statusKey = getStatusKey(score);
    const weakestSub = p === "P" ? null : getWeakestSubgroup(answersMap, p);
    const diagnostic = getDiagnosticText(p, score, weakestSub);
    return {
      key: p, name: pillarNames[p], score, statusKey, weakestSub, diagnostic,
      ...(companyAvg ? { companyScore: companyAvg[`avg${p}` as keyof typeof companyAvg] as number } : {}),
    };
  });

  const radarData = pillars.map((p) => ({
    name: p.name, you: p.score,
    ...(companyAvg ? { company: p.companyScore } : {}),
    fullMark: 10,
  }));

  const overallStatus = getStatusKey(latest.mediaGeral);
  const cruzScores = calcCruzProfissional(answersMap);

  // Emotional signaling: G < 5.5 && emocional < 4.0
  const gScore = latest.mediaG;
  const emocionalScore = calcSubgroupScore(answersMap, "emocional");
  const showEmotionalAlert = gScore < 5.5 && emocionalScore < 4.0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">Resultados</p>
        <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8]">Meus Resultados</h1>
        <p className="text-sm text-[#FAFAF8]/40 mt-1">{orgName} — {new Date(latest.createdAt).toLocaleDateString("pt-BR")}</p>
      </div>

      {/* Overall score */}
      <div className="rounded-xl bg-gradient-to-br from-[#1A2744] to-[#2A3A5C] border border-[#B8A88A]/15 p-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50 mb-2">Média Geral</p>
        <p className="text-5xl font-bold text-[#FAFAF8] font-[Cormorant]">{latest.mediaGeral.toFixed(1)}</p>
        <p className="text-sm font-medium mt-1" style={{ color: statusColors[overallStatus] }}>{statusLabels[overallStatus]}</p>
      </div>

      {/* Emotional alert */}
      {showEmotionalAlert && (
        <div className="rounded-xl bg-[#8B4C4C]/10 border border-[#8B4C4C]/30 p-5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[#8B4C4C] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#FAFAF8] mb-1">Sinalização Importante</p>
            <p className="text-xs text-[#FAFAF8]/50 leading-relaxed">
              O seu resultado em Governo Emocional sugere que pode haver uma ferida emocional que vai além do desenvolvimento profissional. Recomendamos considerar acompanhamento especializado antes de intervenções de coaching.
            </p>
          </div>
        </div>
      )}

      {/* Radar chart */}
      <div className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-6">
        <h2 className="text-sm font-medium text-[#FAFAF8]/60 mb-4 text-center">
          Perfil P.A.G.O.{companyAvg ? " (Você vs Empresa)" : ""}
        </h2>
        <div className="w-full max-w-sm mx-auto">
          <ChartContainer config={chartConfig} className="aspect-square">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="55%">
              <PolarGrid stroke="#B8A88A" strokeOpacity={0.15} radialLines={false} />
              <PolarAngleAxis dataKey="name" tick={{ fill: "#FAFAF8", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 500 }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
              {companyAvg && (
                <Radar name="Empresa" dataKey="company" stroke="#4A7A9B" strokeWidth={1.5} fill="#4A7A9B" fillOpacity={0.1} dot={{ r: 3, fill: "#0F1B2D", stroke: "#4A7A9B", strokeWidth: 1.5 }} />
              )}
              <Radar name="Você" dataKey="you" stroke="#B8A88A" strokeWidth={2} fill="#B8A88A" fillOpacity={0.2} dot={{ r: 4, fill: "#1A2744", stroke: "#B8A88A", strokeWidth: 2 }} />
            </RadarChart>
          </ChartContainer>
        </div>
        {companyAvg && (
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#B8A88A]" /><span className="text-xs text-[#FAFAF8]/40">Você</span></div>
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#4A7A9B]" /><span className="text-xs text-[#FAFAF8]/40">Empresa ({companyAvg.count})</span></div>
          </div>
        )}
      </div>

      {/* Cruz Profissional */}
      <div className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-6">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50 text-center mb-4">Cruz Profissional</h2>
        <CruzProfissional scores={cruzScores} />
      </div>

      {/* Pillar cards with diagnostics */}
      <div className="space-y-4">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50">Diagnóstico por Pilar</h2>

        {pillars.map((p) => {
          const isWeakest = latest.pilarMaisFraco === p.key;
          const subs = pillarSubgroups[p.key];

          return (
            <div
              key={p.key}
              className={`rounded-xl bg-[#1A2744] border p-5 ${isWeakest ? "border-[#C8A951]/30" : "border-[#B8A88A]/10"}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#B8A88A]">{p.key}.</span>
                  <span className="text-sm font-medium text-[#FAFAF8]">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isWeakest && (
                    <span className="text-[9px] uppercase tracking-wider text-[#C8A951] bg-[#C8A951]/10 px-2 py-0.5 rounded-full border border-[#C8A951]/20">Foco</span>
                  )}
                  <span className="text-2xl font-bold text-[#FAFAF8] font-[Cormorant]">{p.score.toFixed(1)}</span>
                </div>
              </div>

              {/* Status */}
              <p className="text-xs font-medium mb-3" style={{ color: statusColors[p.statusKey] }}>{statusLabels[p.statusKey]}</p>

              {/* Subgroup mini-bars */}
              {subs && (
                <div className="space-y-2 mb-4">
                  {subs.map((sg) => {
                    const sgScore = calcSubgroupScore(answersMap, sg);
                    const sgPct = (sgScore / 10) * 100;
                    const isWeakSub = p.weakestSub === sg;
                    return (
                      <div key={sg} className="flex items-center gap-3">
                        <span className={`text-[10px] w-28 shrink-0 ${isWeakSub ? "text-[#C8A951] font-semibold" : "text-[#FAFAF8]/35"}`}>
                          {subgroupLabels[sg]}
                        </span>
                        <div className="flex-1 h-1.5 bg-[#FAFAF8]/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${sgPct}%`,
                              backgroundColor: isWeakSub ? "#C8A951" : "#B8A88A",
                              opacity: isWeakSub ? 1 : 0.4,
                            }}
                          />
                        </div>
                        <span className={`text-[10px] w-8 text-right ${isWeakSub ? "text-[#C8A951] font-semibold" : "text-[#FAFAF8]/30"}`}>
                          {sgScore.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Diagnostic text */}
              <div className="bg-[#0F1B2D]/50 rounded-lg p-4 border border-[#B8A88A]/5">
                <p className="text-xs text-[#D4C8A8] font-medium italic mb-2">{p.diagnostic.summary}</p>
                <p className="text-xs text-[#FAFAF8]/40 leading-relaxed mb-3">{p.diagnostic.analysis}</p>
                <div className="border-t border-[#B8A88A]/10 pt-2">
                  <p className="text-[10px] uppercase tracking-wider text-[#B8A88A]/40 mb-1">Recomendação</p>
                  <p className="text-xs text-[#FAFAF8]/50 leading-relaxed">{p.diagnostic.recommendation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
