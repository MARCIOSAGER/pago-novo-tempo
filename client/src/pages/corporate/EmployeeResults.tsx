import { useCorporate } from "@/contexts/CorporateContext";
import { trpc } from "@/lib/trpc";
import { ClipboardList, AlertTriangle, Mail, Download, ArrowRight, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import CruzProfissional from "@/components/corporate/CruzProfissional";
import { getDiagnosticText } from "@/data/diagnostics-corporate";
import {
  calcSubgroupScore, getWeakestSubgroup, calcCruzProfissional,
  getStatusKey, statusLabels, statusColors,
} from "@/data/questions-corporate";
import { toast } from "sonner";

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

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function EmployeeResults() {
  const { orgId, orgName, orgSlug } = useCorporate();
  const { data: results, isLoading } = trpc.corporate.myResults.useQuery({ orgId });
  const { data: companyAvg } = trpc.corporate.companyAverage.useQuery({ orgId });

  const sendPdfMutation = trpc.corporate.sendPdfEmail.useMutation({
    onSuccess: () => toast.success("PDF enviado para o seu email!"),
    onError: (err) => toast.error(err.message || "Erro ao enviar PDF."),
  });

  const latest = results?.[0];

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-[#1A2744] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="space-y-6 max-w-4xl">
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

  // Build answers map
  const answersMap: Record<string, number> = {};
  const pillarsArr = ["P", "A", "G", "O"] as const;
  const arrays = [latest.answersP, latest.answersA, latest.answersG, latest.answersO];
  pillarsArr.forEach((p, pi) => {
    (arrays[pi] as number[]).forEach((v: number, qi: number) => {
      answersMap[`${p}${qi + 1}`] = v;
    });
  });

  const pillars = pillarsArr.map((p) => {
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
  const gScore = latest.mediaG;
  const emocionalScore = calcSubgroupScore(answersMap, "emocional");
  const showEmotionalAlert = gScore < 5.5 && emocionalScore < 4.0;
  const weakestPillar = pillars.find((p) => p.key === latest.pilarMaisFraco);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header with actions */}
      <motion.div {...fadeUp} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">Resultados</p>
          <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8]">Meus Resultados</h1>
          <p className="text-sm text-[#FAFAF8]/40 mt-1">{orgName} — {new Date(latest.createdAt).toLocaleDateString("pt-BR")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => sendPdfMutation.mutate({ orgId, diagnosticId: latest.id })}
            disabled={sendPdfMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#B8A88A]/20 text-[#B8A88A] text-xs font-medium hover:bg-[#B8A88A]/10 disabled:opacity-50 transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            {sendPdfMutation.isPending ? "Enviando..." : "Enviar PDF por Email"}
          </button>
        </div>
      </motion.div>

      {/* Overall score */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}
        className="rounded-2xl bg-gradient-to-br from-[#1A2744] via-[#1F2F50] to-[#2A3A5C] border border-[#B8A88A]/15 p-8 text-center"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#B8A88A]/50 mb-3">Média Geral P.A.G.O.</p>
        <p className="text-6xl font-bold text-[#FAFAF8] font-[Cormorant]">{latest.mediaGeral.toFixed(1)}</p>
        <p className="text-sm font-medium mt-2" style={{ color: statusColors[overallStatus] }}>{statusLabels[overallStatus]}</p>

        {/* Pillar mini scores */}
        <div className="grid grid-cols-4 gap-3 mt-6 max-w-md mx-auto">
          {pillars.map((p) => (
            <div key={p.key} className={`rounded-lg p-2 ${p.key === latest.pilarMaisFraco ? "bg-[#C8A951]/10 border border-[#C8A951]/20" : "bg-[#0F1B2D]/30"}`}>
              <p className="text-xs text-[#B8A88A]/50">{p.key}</p>
              <p className="text-lg font-bold text-[#FAFAF8] font-[Cormorant]">{p.score.toFixed(1)}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Emotional alert */}
      {showEmotionalAlert && (
        <motion.div {...fadeUp} transition={{ delay: 0.15 }}
          className="rounded-xl bg-[#8B4C4C]/10 border border-[#8B4C4C]/30 p-5 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-[#8B4C4C] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#FAFAF8] mb-1">Sinalização Importante</p>
            <p className="text-xs text-[#FAFAF8]/50 leading-relaxed">
              O seu resultado em Governo Emocional ({emocionalScore.toFixed(1)}) sugere que pode haver uma ferida emocional que vai além do desenvolvimento profissional. Recomendamos considerar acompanhamento especializado antes de intervenções de coaching.
            </p>
          </div>
        </motion.div>
      )}

      {/* Radar + Cruz side by side on desktop */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar chart */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}
          className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-6"
        >
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50 mb-4 text-center">
            Perfil P.A.G.O.{companyAvg ? " — Você vs Empresa" : ""}
          </h2>
          <ChartContainer config={chartConfig} className="aspect-square max-w-[280px] mx-auto">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="55%">
              <PolarGrid stroke="#B8A88A" strokeOpacity={0.15} radialLines={false} />
              <PolarAngleAxis dataKey="name" tick={{ fill: "#FAFAF8", fontSize: 11, fontFamily: "Montserrat, sans-serif", fontWeight: 500 }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
              {companyAvg && (
                <Radar name="Empresa" dataKey="company" stroke="#4A7A9B" strokeWidth={1.5} fill="#4A7A9B" fillOpacity={0.1} dot={{ r: 3, fill: "#0F1B2D", stroke: "#4A7A9B", strokeWidth: 1.5 }} />
              )}
              <Radar name="Você" dataKey="you" stroke="#B8A88A" strokeWidth={2} fill="#B8A88A" fillOpacity={0.2} dot={{ r: 4, fill: "#1A2744", stroke: "#B8A88A", strokeWidth: 2 }} />
            </RadarChart>
          </ChartContainer>
          {companyAvg && (
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#B8A88A]" /><span className="text-[10px] text-[#FAFAF8]/40">Você</span></div>
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#4A7A9B]" /><span className="text-[10px] text-[#FAFAF8]/40">Empresa ({companyAvg.count})</span></div>
            </div>
          )}
        </motion.div>

        {/* Cruz Profissional */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}
          className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-6"
        >
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50 text-center mb-2">Cruz Profissional</h2>
          <CruzProfissional scores={cruzScores} />
        </motion.div>
      </div>

      {/* Pillar diagnostics */}
      <div className="space-y-5">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50">Diagnóstico por Pilar</h2>

        {pillars.map((p, idx) => {
          const isWeakest = latest.pilarMaisFraco === p.key;
          const subs = pillarSubgroups[p.key];

          return (
            <motion.div
              key={p.key}
              {...fadeUp}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className={`rounded-xl bg-[#1A2744] border p-6 ${isWeakest ? "border-[#C8A951]/30" : "border-[#B8A88A]/8"}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold text-[#B8A88A]">{p.key}.</span>
                    <span className="text-base font-semibold text-[#FAFAF8]">{p.name}</span>
                    {isWeakest && (
                      <span className="text-[8px] uppercase tracking-wider text-[#C8A951] bg-[#C8A951]/10 px-2 py-0.5 rounded-full border border-[#C8A951]/20">Foco</span>
                    )}
                  </div>
                  <p className="text-xs font-medium" style={{ color: statusColors[p.statusKey] }}>{statusLabels[p.statusKey]}</p>
                </div>
                <p className="text-3xl font-bold text-[#FAFAF8] font-[Cormorant]">{p.score.toFixed(1)}</p>
              </div>

              {/* Subgroup bars */}
              {subs && (
                <div className="space-y-2 mb-5">
                  {subs.map((sg) => {
                    const sgScore = calcSubgroupScore(answersMap, sg);
                    const sgPct = (sgScore / 10) * 100;
                    const isWeakSub = p.weakestSub === sg;
                    return (
                      <div key={sg} className="flex items-center gap-3">
                        <span className={`text-[10px] w-28 shrink-0 ${isWeakSub ? "text-[#C8A951] font-semibold" : "text-[#FAFAF8]/30"}`}>
                          {subgroupLabels[sg]}
                        </span>
                        <div className="flex-1 h-2 bg-[#FAFAF8]/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${sgPct}%` }}
                            transition={{ duration: 0.8, delay: 0.5 + idx * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: isWeakSub ? "#C8A951" : "#B8A88A", opacity: isWeakSub ? 0.8 : 0.3 }}
                          />
                        </div>
                        <span className={`text-[10px] w-8 text-right tabular-nums ${isWeakSub ? "text-[#C8A951] font-semibold" : "text-[#FAFAF8]/25"}`}>
                          {sgScore.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Diagnostic text */}
              <div className="bg-[#0F1B2D]/40 rounded-lg p-5 border border-[#B8A88A]/5">
                <p className="text-sm text-[#D4C8A8] font-[Cormorant] italic mb-3 leading-relaxed">{p.diagnostic.summary}</p>
                <p className="text-xs text-[#FAFAF8]/40 leading-relaxed mb-4">{p.diagnostic.analysis}</p>
                <div className="border-t border-[#B8A88A]/8 pt-3">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#B8A88A]/40 mb-1.5">Recomendação</p>
                  <p className="text-xs text-[#FAFAF8]/50 leading-relaxed">{p.diagnostic.recommendation}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Orientation / Next Steps */}
      <motion.div {...fadeUp} transition={{ delay: 0.8 }}
        className="rounded-2xl bg-gradient-to-br from-[#1A2744] via-[#1F2F50] to-[#2A3A5C] border border-[#B8A88A]/15 p-8"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="h-10 w-10 rounded-xl bg-[#B8A88A]/10 flex items-center justify-center shrink-0">
            <Lightbulb className="h-5 w-5 text-[#B8A88A]" />
          </div>
          <div>
            <h2 className="text-lg font-[Cormorant] font-semibold text-[#FAFAF8] mb-1">Próximos Passos</h2>
            <p className="text-xs text-[#FAFAF8]/40">Recomendações baseadas no seu perfil</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Focus pillar */}
          {weakestPillar && (
            <div className="flex items-start gap-3 bg-[#0F1B2D]/30 rounded-lg p-4 border border-[#C8A951]/10">
              <span className="text-lg font-bold text-[#C8A951]">1.</span>
              <div>
                <p className="text-sm text-[#FAFAF8] font-medium mb-1">
                  Priorize {weakestPillar.name} ({weakestPillar.key})
                </p>
                <p className="text-xs text-[#FAFAF8]/40 leading-relaxed">
                  Com score {weakestPillar.score.toFixed(1)} ({statusLabels[weakestPillar.statusKey]}), este é o pilar que mais limita o seu potencial. Foque as próximas semanas em trabalhar especificamente esta dimensão.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 bg-[#0F1B2D]/30 rounded-lg p-4 border border-[#B8A88A]/5">
            <span className="text-lg font-bold text-[#B8A88A]/50">2.</span>
            <div>
              <p className="text-sm text-[#FAFAF8] font-medium mb-1">Agende uma sessão de devolutiva</p>
              <p className="text-xs text-[#FAFAF8]/40 leading-relaxed">
                Os resultados ganham profundidade quando discutidos com um facilitador certificado P.A.G.O. Solicite uma sessão de devolutiva para construir um plano de desenvolvimento personalizado.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#0F1B2D]/30 rounded-lg p-4 border border-[#B8A88A]/5">
            <span className="text-lg font-bold text-[#B8A88A]/50">3.</span>
            <div>
              <p className="text-sm text-[#FAFAF8] font-medium mb-1">Reavalie em 3-6 meses</p>
              <p className="text-xs text-[#FAFAF8]/40 leading-relaxed">
                O desenvolvimento é mensurável. Refaça o diagnóstico após implementar as recomendações para medir a evolução concreta.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-[#B8A88A]/10">
          <button
            onClick={() => sendPdfMutation.mutate({ orgId, diagnosticId: latest.id })}
            disabled={sendPdfMutation.isPending}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#B8A88A] text-[#1A2744] text-sm font-semibold hover:bg-[#D4C8A8] disabled:opacity-50 transition-colors"
          >
            <Mail className="h-4 w-4" />
            {sendPdfMutation.isPending ? "Enviando..." : "Receber Relatório por Email"}
          </button>
          <Link href={`/corporate/${orgSlug}/historico`}>
            <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[#B8A88A]/20 text-[#B8A88A] text-sm hover:bg-[#B8A88A]/10 transition-colors">
              Ver Histórico <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <p className="text-[10px] text-[#FAFAF8]/15 text-center italic max-w-lg mx-auto leading-relaxed">
        Este diagnóstico é uma ferramenta de reflexão. Os resultados são um ponto de partida para conversa com um mentor ou facilitador certificado P.A.G.O.
      </p>
    </div>
  );
}
