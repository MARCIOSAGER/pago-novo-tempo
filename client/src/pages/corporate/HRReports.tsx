import { useCorporate } from "@/contexts/CorporateContext";
import { trpc } from "@/lib/trpc";
import { FileText, Download, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { getStatusKey, statusLabels, statusColors } from "@/data/questions-corporate";

const pillarNames: Record<string, string> = {
  P: "Princípio", A: "Alinhamento", G: "Governo", O: "Obediência",
};

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function HRReports() {
  const { orgId, orgName } = useCorporate();
  const { data: metrics, isLoading } = trpc.corporate.hrMetrics.useQuery({ orgId });
  const { data: members } = trpc.corporate.listMembers.useQuery({ orgId, page: 1, pageSize: 100 });

  const hasData = metrics && metrics.diagnosticCount > 0;

  const handleExportCSV = () => {
    if (!hasData) return;
    const rows = [
      ["Pilar", "Média", "Status"],
      ["Princípio", String(metrics.avgP), statusLabels[getStatusKey(metrics.avgP)]],
      ["Alinhamento", String(metrics.avgA), statusLabels[getStatusKey(metrics.avgA)]],
      ["Governo", String(metrics.avgG), statusLabels[getStatusKey(metrics.avgG)]],
      ["Obediência", String(metrics.avgO), statusLabels[getStatusKey(metrics.avgO)]],
      ["", "", ""],
      ["Média Geral", String(metrics.avgGeral), statusLabels[getStatusKey(metrics.avgGeral)]],
      ["Total Diagnósticos", String(metrics.diagnosticCount), ""],
      ["Membros Ativos", String(metrics.activeMembers), ""],
      ["Taxa de Conclusão", `${metrics.completionRate}%`, ""],
      ["Pilar Mais Fraco", metrics.weakestPillar, ""],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pago-relatorio-${orgName.replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div {...fadeUp} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">Recursos Humanos</p>
          <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8]">Relatórios</h1>
          <p className="text-sm text-[#FAFAF8]/40 mt-1">{orgName}</p>
        </div>
        {hasData && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#B8A88A]/20 text-[#B8A88A] text-xs font-medium hover:bg-[#B8A88A]/10 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
        )}
      </motion.div>

      {!hasData ? (
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-12 text-center">
          <FileText className="h-12 w-12 text-[#B8A88A]/20 mx-auto mb-4" />
          <h2 className="text-lg font-[Cormorant] font-semibold text-[#FAFAF8] mb-2">Sem Dados Suficientes</h2>
          <p className="text-[#FAFAF8]/40 text-sm max-w-md mx-auto">
            Os relatórios serão gerados quando houver diagnósticos corporativos completados pelos membros da organização.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Summary card */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }}
            className="rounded-xl bg-gradient-to-br from-[#1A2744] to-[#2A3A5C] border border-[#B8A88A]/15 p-6"
          >
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50 mb-4">Resumo Organizacional</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-3xl font-bold text-[#FAFAF8] font-[Cormorant]">{metrics.avgGeral}</p>
                <p className="text-[10px] text-[#FAFAF8]/25">Média Geral</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#FAFAF8] font-[Cormorant]">{metrics.diagnosticCount}</p>
                <p className="text-[10px] text-[#FAFAF8]/25">Diagnósticos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#FAFAF8] font-[Cormorant]">{metrics.completionRate}%</p>
                <p className="text-[10px] text-[#FAFAF8]/25">Conclusão</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#C8A951] font-[Cormorant]">{metrics.weakestPillar}</p>
                <p className="text-[10px] text-[#FAFAF8]/25">Pilar Mais Fraco</p>
              </div>
            </div>
          </motion.div>

          {/* Pillar breakdown */}
          <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50 mb-4">Breakdown por Pilar</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {(["P", "A", "G", "O"] as const).map((p) => {
                const score = metrics[`avg${p}` as keyof typeof metrics] as number;
                const st = getStatusKey(score);
                const isWeakest = metrics.weakestPillar === p;
                return (
                  <div key={p} className={`rounded-xl bg-[#1A2744] border p-5 ${isWeakest ? "border-[#C8A951]/30" : "border-[#B8A88A]/8"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-[#B8A88A]">{p}.</span>
                        <span className="text-sm font-semibold text-[#FAFAF8]">{pillarNames[p]}</span>
                      </div>
                      <p className="text-2xl font-bold text-[#FAFAF8] font-[Cormorant]">{score.toFixed(1)}</p>
                    </div>
                    <div className="h-2 bg-[#FAFAF8]/5 rounded-full overflow-hidden mb-2">
                      <div className="h-full rounded-full" style={{ width: `${(score / 10) * 100}%`, backgroundColor: statusColors[st] }} />
                    </div>
                    <p className="text-[10px] font-medium" style={{ color: statusColors[st] }}>{statusLabels[st]}</p>
                    {isWeakest && (
                      <p className="text-[9px] text-[#C8A951]/60 mt-1">Área que mais precisa de atenção na organização</p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Members overview */}
          {members && members.items.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/50 mb-4">Membros ({members.total})</h2>
              <div className="rounded-xl border border-[#B8A88A]/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#1A2744] border-b border-[#B8A88A]/10">
                      <th className="text-left p-3 font-medium text-[#B8A88A]/60 text-xs uppercase tracking-wider">Nome</th>
                      <th className="text-left p-3 font-medium text-[#B8A88A]/60 text-xs uppercase tracking-wider">Departamento</th>
                      <th className="text-left p-3 font-medium text-[#B8A88A]/60 text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.items.slice(0, 20).map((m: any) => (
                      <tr key={m.id} className="border-t border-[#B8A88A]/5 bg-[#1A2744]/50">
                        <td className="p-3 text-[#FAFAF8]">{m.name || m.email}</td>
                        <td className="p-3 text-[#FAFAF8]/40">{m.department || "—"}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === "active" ? "bg-[#2E8B6A]/20 text-[#2E8B6A]" : "bg-[#C8A951]/20 text-[#C8A951]"}`}>
                            {m.status === "active" ? "Ativo" : "Convidado"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
