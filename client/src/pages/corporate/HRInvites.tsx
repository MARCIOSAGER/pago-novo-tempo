import { useState } from "react";
import { useCorporate } from "@/contexts/CorporateContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Plus, Send } from "lucide-react";
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
          <h1 className="text-2xl font-semibold tracking-tight">Convites</h1>
          <p className="text-muted-foreground text-sm">{orgName}</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Você não tem permissão para enviar convites. Contate o administrador RH.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Enviar Convites</h1>
        <p className="text-muted-foreground text-sm">{orgName}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Convidar Membros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invites.map((inv, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <Label className="text-xs">Email *</Label>
                <Input
                  type="email"
                  value={inv.email}
                  onChange={(e) => updateRow(i, "email", e.target.value)}
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <Label className="text-xs">Nome</Label>
                <Input
                  value={inv.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label className="text-xs">Função</Label>
                <Select value={inv.role} onValueChange={(v) => updateRow(i, "role", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Colaborador</SelectItem>
                    <SelectItem value="hr_viewer">Visualizador RH</SelectItem>
                    <SelectItem value="hr_admin">Admin RH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Departamento</Label>
                  <Input
                    value={inv.department}
                    onChange={(e) => updateRow(i, "department", e.target.value)}
                    placeholder="Ex: TI"
                  />
                </div>
                {invites.length > 1 && (
                  <Button variant="ghost" size="icon" className="mt-5" onClick={() => removeRow(i)}>
                    ×
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar Linha
            </Button>
            <Button size="sm" onClick={handleSend} disabled={sendMutation.isPending}>
              <Send className="h-4 w-4 mr-1" />
              {sendMutation.isPending ? "Enviando..." : "Enviar Convites"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
