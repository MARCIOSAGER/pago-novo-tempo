import { useCorporate } from "@/contexts/CorporateContext";
import { Users, ClipboardList, TrendingUp, AlertTriangle } from "lucide-react";

export default function HRDashboard() {
  const { orgName } = useCorporate();

  const kpis = [
    { icon: Users, label: "Membros Ativos", value: "—" },
    { icon: ClipboardList, label: "Diagnósticos", value: "—" },
    { icon: TrendingUp, label: "Taxa de Conclusão", value: "—" },
    { icon: AlertTriangle, label: "Pilar Mais Fraco", value: "—" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">
          Recursos Humanos
        </p>
        <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8]">Painel RH</h1>
        <p className="text-sm text-[#FAFAF8]/40 mt-1">{orgName}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#B8A88A]/50 font-medium">{kpi.label}</span>
              <kpi.icon className="h-4 w-4 text-[#B8A88A]/30" />
            </div>
            <p className="text-2xl font-bold text-[#FAFAF8]">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-8 text-center">
        <p className="text-[#FAFAF8]/40 text-sm">
          Os dados do dashboard serão populados conforme os membros completarem seus diagnósticos.
        </p>
      </div>
    </div>
  );
}
