import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  Mail,
  Phone,
  MessageSquare,
  Loader2,
  Search,
  Crown,
  Shield,
  Eye,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// ─── Users Tab ──────────────────────────────────────────────────

const roleIcons: Record<string, typeof Crown> = {
  owner: Crown,
  hr_admin: Shield,
  hr_viewer: Eye,
  employee: Users,
};

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  hr_admin: "Admin RH",
  hr_viewer: "Visualizador",
  employee: "Colaborador",
};

function UsersTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.accessManagement.listUsers.useQuery({
    search: search || undefined,
    page,
    pageSize: 20,
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data ? `${data.total} usuário${data.total !== 1 ? "s" : ""} cadastrado${data.total !== 1 ? "s" : ""}` : "Carregando..."}
        </p>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar nome ou email..."
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : !data?.rows.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-4 py-2.5 font-medium">Nome</th>
                <th className="text-left px-4 py-2.5 font-medium">Email</th>
                <th className="text-left px-4 py-2.5 font-medium">Método</th>
                <th className="text-left px-4 py-2.5 font-medium">Role</th>
                <th className="text-left px-4 py-2.5 font-medium">Organizações</th>
                <th className="text-left px-4 py-2.5 font-medium">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.rows.map((u: any) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{u.name || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.email || "—"}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className="text-[10px]">
                      {u.loginMethod || "—"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={u.role === "admin" ? "default" : "outline"} className="text-[10px]">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    {u.orgs && u.orgs.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {u.orgs.map((o: any, i: number) => {
                          const RoleIcon = roleIcons[o.role] || Users;
                          return (
                            <span key={i} className="inline-flex items-center gap-1 bg-muted rounded-md px-2 py-0.5 text-xs">
                              <RoleIcon className="h-3 w-3" />
                              <span className="font-medium">{o.orgName}</span>
                              <span className="text-muted-foreground">({roleLabels[o.role] || o.role})</span>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50 text-xs">Nenhuma</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {format(new Date(u.createdAt), "dd/MM/yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Demo Requests Tab ──────────────────────────────────────────

const statusConfig = {
  pending: { label: "Pendente", variant: "outline" as const, icon: Clock, color: "text-amber-500" },
  contacted: { label: "Contactado", variant: "secondary" as const, icon: Mail, color: "text-blue-500" },
  closed: { label: "Fechado", variant: "default" as const, icon: CheckCircle2, color: "text-emerald-500" },
};

function RequestsTab() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [approveOpen, setApproveOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [slug, setSlug] = useState("");
  const [maxMembers, setMaxMembers] = useState(50);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.accessRequests.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter as any,
    page,
    pageSize: 20,
  });

  const updateStatusMutation = trpc.accessRequests.updateStatus.useMutation({
    onSuccess: () => {
      utils.accessRequests.list.invalidate();
      toast.success("Status atualizado!");
    },
    onError: (err) => toast.error(err.message),
  });

  const approveMutation = trpc.accessRequests.approve.useMutation({
    onSuccess: (result) => {
      utils.accessRequests.list.invalidate();
      setApproveOpen(false);
      setSelectedRequest(null);
      toast.success(`Organização criada! Convite enviado. Slug: ${result.orgSlug}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleApprove = (request: any) => {
    setSelectedRequest(request);
    const autoSlug = request.companyName
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(autoSlug);
    setMaxMembers(50);
    setApproveOpen(true);
  };

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data ? `${data.total} solicitação${data.total !== 1 ? "ões" : ""}` : "Carregando..."}
        </p>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="contacted">Contactados</SelectItem>
            <SelectItem value="closed">Fechados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-6 w-48 mb-3" /><Skeleton className="h-4 w-72" /></CardContent></Card>
          ))}
        </div>
      ) : !data?.rows.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Nenhuma solicitação encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.rows.map((req) => {
            const status = statusConfig[req.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            return (
              <Card key={req.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-base truncate">{req.companyName}</h3>
                        <Badge variant={status.variant} className="shrink-0">
                          <StatusIcon className={`h-3 w-3 mr-1 ${status.color}`} />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5" />{req.contactName}</span>
                        <span className="flex items-center gap-1.5 truncate"><Mail className="h-3.5 w-3.5" />{req.email}</span>
                        <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{req.phone}</span>
                        <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{req.employeeRange} colab.</span>
                      </div>
                      {req.message && (
                        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{req.message}</span>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/60">
                        {format(new Date(req.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {req.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(req)} className="gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Aprovar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: req.id, status: "contacted" })}>
                            Marcar Contactado
                          </Button>
                        </>
                      )}
                      {req.status === "contacted" && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(req)} className="gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Aprovar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: req.id, status: "closed" })}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Recusar
                          </Button>
                        </>
                      )}
                      {req.status === "closed" && (
                        <Button size="sm" variant="ghost" onClick={() => updateStatusMutation.mutate({ id: req.id, status: "pending" })}>
                          Reabrir
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aprovar Empresa</DialogTitle>
            <DialogDescription>
              Isso criará a organização e enviará um convite ao solicitante como proprietário.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 mt-2">
              <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                <p><strong>Empresa:</strong> {selectedRequest.companyName}</p>
                <p><strong>Responsável:</strong> {selectedRequest.contactName}</p>
                <p><strong>Email:</strong> {selectedRequest.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Slug da organização</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="minha-empresa"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">URL: metodopago.com/corporate/{slug}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Máximo de membros</label>
                <Input type="number" value={maxMembers} onChange={(e) => setMaxMembers(parseInt(e.target.value) || 50)} min={1} max={10000} className="mt-1" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancelar</Button>
                <Button onClick={() => {
                  if (!selectedRequest || !slug) return;
                  approveMutation.mutate({ id: selectedRequest.id, slug, maxMembers });
                }} disabled={!slug || approveMutation.isPending} className="gap-1.5">
                  {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {approveMutation.isPending ? "Aprovando..." : "Aprovar e Enviar Convite"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────

export default function AdminAcessos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight font-display">Gestão de Acessos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Usuários, organizações e solicitações de acesso
        </p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5">
            <Building2 className="h-4 w-4" /> Solicitações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <UsersTab />
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <RequestsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
