import { useCorporate } from "@/contexts/CorporateContext";
import { FileText } from "lucide-react";

export default function HRReports() {
  const { orgName } = useCorporate();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">
          Recursos Humanos
        </p>
        <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8]">Relatórios</h1>
        <p className="text-sm text-[#FAFAF8]/40 mt-1">{orgName}</p>
      </div>

      <div className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-12 text-center">
        <FileText className="h-12 w-12 text-[#B8A88A]/30 mx-auto mb-4" />
        <h2 className="text-lg font-[Cormorant] font-semibold text-[#FAFAF8] mb-2">Em Construção</h2>
        <p className="text-[#FAFAF8]/40 text-sm max-w-md mx-auto">
          Os relatórios por departamento e exportação CSV estarão disponíveis quando houver dados de diagnósticos corporativos.
        </p>
      </div>
    </div>
  );
}
