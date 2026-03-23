import { useState } from "react";
import { useCorporate } from "@/contexts/CorporateContext";
import { trpc } from "@/lib/trpc";
import { Search, Users } from "lucide-react";

const statusLabels: Record<string, string> = {
  invited: "Convidado",
  active: "Ativo",
  deactivated: "Desativado",
};

const statusColors: Record<string, string> = {
  invited: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  deactivated: "bg-red-500/20 text-red-300 border-red-500/30",
};

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  hr_admin: "Admin RH",
  hr_viewer: "Visualizador",
  employee: "Colaborador",
};

export default function HRMembers() {
  const { orgId, orgName } = useCorporate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.corporate.listMembers.useQuery({
    orgId,
    search: search || undefined,
    page,
    pageSize: 20,
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">
          Recursos Humanos
        </p>
        <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8] tracking-tight">
          Membros
        </h1>
        <p className="text-sm text-[#FAFAF8]/40 mt-1">{orgName} — {data?.total ?? 0} membros</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B8A88A]/40" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nome ou email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#1A2744] border border-[#B8A88A]/15 text-[#FAFAF8] text-sm placeholder:text-[#FAFAF8]/25 focus:outline-none focus:border-[#B8A88A]/40 transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-[#1A2744] animate-pulse" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-12 text-center">
          <Users className="h-12 w-12 text-[#B8A88A]/30 mx-auto mb-4" />
          <p className="text-[#FAFAF8]/40">Nenhum membro encontrado</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#B8A88A]/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1A2744] border-b border-[#B8A88A]/10">
                <th className="text-left p-3 font-medium text-[#B8A88A]/60 text-xs uppercase tracking-wider">Nome</th>
                <th className="text-left p-3 font-medium text-[#B8A88A]/60 text-xs uppercase tracking-wider">Email</th>
                <th className="text-left p-3 font-medium text-[#B8A88A]/60 text-xs uppercase tracking-wider">Função</th>
                <th className="text-left p-3 font-medium text-[#B8A88A]/60 text-xs uppercase tracking-wider">Departamento</th>
                <th className="text-left p-3 font-medium text-[#B8A88A]/60 text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((member) => (
                <tr key={member.id} className="border-t border-[#B8A88A]/5 bg-[#1A2744]/50 hover:bg-[#1A2744] transition-colors">
                  <td className="p-3 font-medium text-[#FAFAF8]">{member.name || "—"}</td>
                  <td className="p-3 text-[#FAFAF8]/50">{member.email}</td>
                  <td className="p-3 text-[#FAFAF8]/70">{roleLabels[member.role] ?? member.role}</td>
                  <td className="p-3 text-[#FAFAF8]/40">{member.department || "—"}</td>
                  <td className="p-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[member.status] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}>
                      {statusLabels[member.status] ?? member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 p-3 border-t border-[#B8A88A]/10 bg-[#1A2744]/50">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-md text-xs border border-[#B8A88A]/20 text-[#B8A88A] hover:bg-[#B8A88A]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="text-xs text-[#FAFAF8]/40">{page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-md text-xs border border-[#B8A88A]/20 text-[#B8A88A] hover:bg-[#B8A88A]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
