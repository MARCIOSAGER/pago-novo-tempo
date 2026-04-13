import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const statusConfig = {
  pending: { label: "Pendente", variant: "outline" as const, icon: Clock, color: "text-amber-500" },
  contacted: { label: "Contactado", variant: "secondary" as const, icon: Mail, color: "text-blue-500" },
  closed: { label: "Fechado", variant: "default" as const, icon: CheckCircle2, color: "text-emerald-500" },
};

export default function AdminAcessos() {
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
    // Auto-generate slug from company name
    const autoSlug = request.companyName
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(autoSlug);
    setMaxMembers(50);
    setApproveOpen(true);
  };

  const handleApproveSubmit = () => {
    if (!selectedRequest || !slug) return;
    approveMutation.mutate({
      id: selectedRequest.id,
      slug,
      maxMembers,
    });
  };

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-display">Gestão de Acessos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Solicitações de demonstração e aprovação de empresas
          </p>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Stats */}
      {data && (
        <div className="text-sm text-muted-foreground">
          {data.total} solicitação{data.total !== 1 ? "ões" : ""} encontrada{data.total !== 1 ? "s" : ""}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-4 w-72" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !data?.rows.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
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
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          <span>{req.contactName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{req.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{req.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{req.employeeRange} colaboradores</span>
                        </div>
                      </div>

                      {req.message && (
                        <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{req.message}</span>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground/60">
                        {format(new Date(req.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {req.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(req)}
                            className="gap-1.5"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: req.id, status: "contacted" })}
                          >
                            Marcar Contactado
                          </Button>
                        </>
                      )}
                      {req.status === "contacted" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(req)}
                            className="gap-1.5"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: req.id, status: "closed" })}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Recusar
                          </Button>
                        </>
                      )}
                      {req.status === "closed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateStatusMutation.mutate({ id: req.id, status: "pending" })}
                        >
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

      {/* Pagination */}
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
                <p className="text-xs text-muted-foreground mt-1">
                  URL: metodopago.com/corporate/{slug}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Máximo de membros</label>
                <Input
                  type="number"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(parseInt(e.target.value) || 50)}
                  min={1}
                  max={10000}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setApproveOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleApproveSubmit}
                  disabled={!slug || approveMutation.isPending}
                  className="gap-1.5"
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
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
