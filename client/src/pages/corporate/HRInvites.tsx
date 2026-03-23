import { useState } from "react";
import { useCorporate } from "@/contexts/CorporateContext";
import { trpc } from "@/lib/trpc";
import { Mail, Plus, Send, X } from "lucide-react";
import { toast } from "sonner";

export default function HRInvites() {
  const { orgId, orgName, isHRWriter } = useCorporate();
  const [invites, setInvites] = useState([{ email: "", name: "", role: "employee" as const, department: "" }]);

  const sendMutation = trpc.corporate.sendInvites.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.sent} convite(s) enviado(s)${result.skipped.length ? `. ${result.skipped.length} já existente(s).` : ""}`);
      setInvites([{ email: "", name: "", role: "employee", department: "" }]);
    },
    onError: (err) => toast.error(err.message),
  });

  const addRow = () => {
    setInvites((prev) => [...prev, { email: "", name: "", role: "employee" as const, department: "" }]);
  };

  const updateRow = (index: number, field: string, value: string) => {
    setInvites((prev) => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const removeRow = (index: number) => {
    if (invites.length <= 1) return;
    setInvites((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    const valid = invites.filter((inv) => inv.email.includes("@"));
    if (!valid.length) {
      toast.error("Adicione pelo menos um email válido.");
      return;
    }
    sendMutation.mutate({
      orgId,
      invites: valid.map((inv) => ({
        email: inv.email,
        name: inv.name || undefined,
        role: inv.role as "hr_admin" | "hr_viewer" | "employee",
        department: inv.department || undefined,
      })),
    });
  };

  if (!isHRWriter) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">
            Recursos Humanos
          </p>
          <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8]">Convites</h1>
          <p className="text-sm text-[#FAFAF8]/40 mt-1">{orgName}</p>
        </div>
        <div className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-8 text-center">
          <Mail className="h-12 w-12 text-[#B8A88A]/30 mx-auto mb-4" />
          <p className="text-[#FAFAF8]/40 text-sm">
            Você não tem permissão para enviar convites. Contate o administrador RH.
          </p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-[#0F1B2D] border border-[#B8A88A]/15 text-[#FAFAF8] text-sm placeholder:text-[#FAFAF8]/25 focus:outline-none focus:border-[#B8A88A]/40 transition-colors";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">
          Recursos Humanos
        </p>
        <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8]">Enviar Convites</h1>
        <p className="text-sm text-[#FAFAF8]/40 mt-1">{orgName}</p>
      </div>

      <div className="rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-6">
        <h2 className="text-base font-semibold text-[#FAFAF8] mb-5">Convidar Membros</h2>

        <div className="space-y-4">
          {invites.map((inv, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px_1fr_36px] gap-3 items-end">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8A88A]/50 mb-1.5 block">Email *</label>
                <input
                  type="email"
                  value={inv.email}
                  onChange={(e) => updateRow(i, "email", e.target.value)}
                  placeholder="email@empresa.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8A88A]/50 mb-1.5 block">Nome</label>
                <input
                  value={inv.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                  placeholder="Nome completo"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8A88A]/50 mb-1.5 block">Função</label>
                <select
                  value={inv.role}
                  onChange={(e) => updateRow(i, "role", e.target.value)}
                  className={inputClass}
                >
                  <option value="employee">Colaborador</option>
                  <option value="hr_viewer">Visualizador RH</option>
                  <option value="hr_admin">Admin RH</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8A88A]/50 mb-1.5 block">Departamento</label>
                <input
                  value={inv.department}
                  onChange={(e) => updateRow(i, "department", e.target.value)}
                  placeholder="Ex: TI"
                  className={inputClass}
                />
              </div>
              <div className="flex items-end">
                {invites.length > 1 && (
                  <button
                    onClick={() => removeRow(i)}
                    className="h-[42px] w-[36px] flex items-center justify-center rounded-lg text-[#FAFAF8]/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-5 mt-5 border-t border-[#B8A88A]/10">
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border border-[#B8A88A]/20 text-[#B8A88A] hover:bg-[#B8A88A]/10 transition-colors"
          >
            <Plus className="h-4 w-4" /> Adicionar Linha
          </button>
          <button
            onClick={handleSend}
            disabled={sendMutation.isPending}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm bg-[#B8A88A] text-[#1A2744] font-medium hover:bg-[#D4C8A8] disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
            {sendMutation.isPending ? "Enviando..." : "Enviar Convites"}
          </button>
        </div>
      </div>
    </div>
  );
}
