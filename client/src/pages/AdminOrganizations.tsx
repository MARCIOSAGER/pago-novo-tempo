import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Plus,
  Search,
  Users,
  Trash2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Crown,
  Shield,
  Eye,
  UserCheck,
  UserPlus,
  Mail,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500",
  trial: "bg-amber-500",
  suspended: "bg-red-500",
};

const roleIcons: Record<string, typeof Crown> = {
  owner: Crown,
  hr_admin: Shield,
  hr_viewer: Eye,
  employee: Users,
};

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  hr_admin: "Admin RH",
  hr_viewer: "Visualizador RH",
  employee: "Colaborador",
};

const memberStatusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "Ativo", color: "text-emerald-600" },
  invited: { label: "Convidado", color: "text-amber-600" },
  deactivated: { label: "Desativado", color: "text-red-600" },
};

function OrgMembers({ orgId }: { orgId: number }) {
  const { data, isLoading } = trpc.corporate.getOrgMembers.useQuery({
    orgId,
    page: 1,
    pageSize: 50,
  });

  if (isLoading) return <Skeleton className="h-20 w-full" />;
  if (!data?.items.length) return <p className="text-sm text-muted-foreground py-3 text-center">Nenhum membro</p>;

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
            <th className="text-left px-4 py-2.5 font-medium">Nome</th>
            <th className="text-left px-4 py-2.5 font-medium">Email</th>
            <th className="text-left px-4 py-2.5 font-medium">Função</th>
            <th className="text-left px-4 py-2.5 font-medium">Status</th>
            <th className="text-left px-4 py-2.5 font-medium">Departamento</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.items.map((m) => {
            const RoleIcon = roleIcons[m.role] || Users;
            const statusInfo = memberStatusLabels[m.status] || { label: m.status, color: "text-gray-600" };
            return (
              <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2.5 font-medium">{m.name || "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{m.email}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1.5">
                    <RoleIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {roleLabels[m.role] || m.role}
                  </span>
                </td>
                <td className={`px-4 py-2.5 font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{m.department || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.total > 50 && (
        <p className="text-xs text-muted-foreground text-center py-2 bg-muted/30">
          Mostrando 50 de {data.total} membros
        </p>
      )}
    </div>
  );
}

function OrgCard({ org, onDelete }: { org: any; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [activeUntilInput, setActiveUntilInput] = useState(org.activeUntil ? new Date(org.activeUntil).toISOString().split("T")[0] : "");
  const utils = trpc.useUtils();
  const { data: details } = trpc.corporate.getOrg.useQuery({ id: org.id });

  const updateMutation = trpc.corporate.updateOrg.useMutation({
    onSuccess: () => {
      utils.corporate.listOrgs.invalidate();
      utils.corporate.getOrg.invalidate({ id: org.id });
      toast.success("Organização atualizada!");
      setEditingDate(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const changeStatus = (status: "active" | "trial" | "suspended") => {
    updateMutation.mutate({ id: org.id, status });
  };

  const saveActiveUntil = () => {
    updateMutation.mutate({ id: org.id, activeUntil: activeUntilInput || null });
  };

  const stats = details || { totalMembers: 0, activeMembers: 0, invitedMembers: 0, diagnosticsCount: 0, owner: null };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {org.name}
                <Badge className={`text-[10px] ${statusColors[org.status] || "bg-gray-500"}`}>
                  {org.status}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">/corporate/{org.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {org.status !== "active" && (
              <Button variant="outline" size="sm" className="h-7 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50" onClick={() => changeStatus("active")}>
                Ativar
              </Button>
            )}
            {org.status !== "suspended" && (
              <Button variant="outline" size="sm" className="h-7 text-xs text-red-600 border-red-300 hover:bg-red-50" onClick={() => changeStatus("suspended")}>
                Suspender
              </Button>
            )}
            {org.status !== "trial" && (
              <Button variant="outline" size="sm" className="h-7 text-xs text-amber-600 border-amber-300 hover:bg-amber-50" onClick={() => changeStatus("trial")}>
                Trial
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (confirm(`Excluir "${org.name}"? Esta ação não pode ser desfeita.`)) {
                  onDelete();
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mt-3 ml-7">
          <div className="flex items-center gap-1.5 text-sm">
            <UserCheck className="h-4 w-4 text-emerald-500" />
            <span className="font-semibold">{stats.activeMembers}</span>
            <span className="text-muted-foreground">ativos</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <UserPlus className="h-4 w-4 text-amber-500" />
            <span className="font-semibold">{stats.invitedMembers}</span>
            <span className="text-muted-foreground">convidados</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="font-semibold">{stats.totalMembers}</span>
            <span className="text-muted-foreground">/ {org.maxMembers} máx</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <ClipboardList className="h-4 w-4 text-purple-500" />
            <span className="font-semibold">{stats.diagnosticsCount}</span>
            <span className="text-muted-foreground">diagnósticos</span>
          </div>
          {stats.owner && (
            <div className="flex items-center gap-1.5 text-sm">
              <Crown className="h-4 w-4 text-amber-600" />
              <span className="text-muted-foreground">{stats.owner.name || stats.owner.email}</span>
            </div>
          )}
          {/* Active Until */}
          <div className="flex items-center gap-1.5 text-sm">
            <CalendarClock className="h-4 w-4 text-orange-500" />
            {editingDate ? (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={activeUntilInput}
                  onChange={(e) => setActiveUntilInput(e.target.value)}
                  className="text-xs border rounded px-1.5 py-0.5"
                />
                <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs" onClick={saveActiveUntil}>OK</Button>
                <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs" onClick={() => setEditingDate(false)}>X</Button>
              </div>
            ) : (
              <button onClick={() => setEditingDate(true)} className="text-muted-foreground hover:text-foreground transition-colors">
                {org.activeUntil ? (
                  <span className={new Date(org.activeUntil) < new Date() ? "text-red-500 font-semibold" : ""}>
                    Valido ate {format(new Date(org.activeUntil), "dd/MM/yyyy")}
                  </span>
                ) : (
                  <span className="text-muted-foreground/50 italic">Sem validade</span>
                )}
              </button>
            )}
          </div>
          <span className="text-xs text-muted-foreground/60 self-center">
            Criada em {format(new Date(org.createdAt), "dd/MM/yyyy")}
          </span>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 pl-7">
          <OrgMembers orgId={org.id} />
        </CardContent>
      )}
    </Card>
  );
}

export default function AdminOrganizations() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: "", slug: "", cnpj: "", maxMembers: 50 });

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.corporate.listOrgs.useQuery({
    search: search || undefined,
    page,
    pageSize: 15,
  });

  const createMutation = trpc.corporate.createOrg.useMutation({
    onSuccess: () => {
      toast.success("Organização criada com sucesso");
      setDialogOpen(false);
      setNewOrg({ name: "", slug: "", cnpj: "", maxMembers: 50 });
      utils.corporate.listOrgs.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.corporate.deleteOrg.useMutation({
    onSuccess: () => {
      toast.success("Organização removida");
      utils.corporate.listOrgs.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSlugify = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setNewOrg((prev) => ({ ...prev, name, slug }));
  };

  const totalPages = data ? Math.ceil(data.total / 15) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organizações</h1>
          <p className="text-muted-foreground text-sm">
            {data ? `${data.total} empresa${data.total !== 1 ? "s" : ""} cadastrada${data.total !== 1 ? "s" : ""}` : "Gerenciar empresas do módulo corporativo"}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Nova Organização
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Organização</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Nome</Label>
                <Input
                  value={newOrg.name}
                  onChange={(e) => handleSlugify(e.target.value)}
                  placeholder="Empresa XYZ"
                />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input
                  value={newOrg.slug}
                  onChange={(e) => setNewOrg((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="empresa-xyz"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL: metodopago.com/corporate/{newOrg.slug || "..."}
                </p>
              </div>
              <div>
                <Label>CNPJ (opcional)</Label>
                <Input
                  value={newOrg.cnpj}
                  onChange={(e) => setNewOrg((prev) => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div>
                <Label>Máximo de membros</Label>
                <Input
                  type="number"
                  value={newOrg.maxMembers}
                  onChange={(e) => setNewOrg((prev) => ({ ...prev, maxMembers: parseInt(e.target.value) || 50 }))}
                />
              </div>
              <Button onClick={() => {
                if (!newOrg.name || !newOrg.slug) { toast.error("Nome e slug são obrigatórios"); return; }
                createMutation.mutate(newOrg);
              }} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? "Criando..." : "Criar Organização"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nome ou slug..."
          className="pl-9"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : !data?.items.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma organização encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.items.map((org) => (
            <OrgCard
              key={org.id}
              org={org}
              onDelete={() => deleteMutation.mutate({ id: org.id })}
            />
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground self-center">
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Próxima
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
