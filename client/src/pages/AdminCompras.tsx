import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Mail,
  Ban,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Package,
  GraduationCap,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Undo2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

type Status = "pending" | "delivered" | "failed" | "refunded" | "abandoned";

const statusLabels: Record<Status, string> = {
  pending: "Pendente",
  delivered: "Entregue",
  failed: "Falhou",
  refunded: "Reembolsado",
  abandoned: "Abandonado",
};

const statusColors: Record<Status, string> = {
  pending: "bg-amber-500",
  delivered: "bg-emerald-500",
  failed: "bg-red-500",
  refunded: "bg-gray-500",
  abandoned: "bg-slate-400",
};

const productIcons: Record<string, typeof BookOpen> = {
  ebook: BookOpen,
  kit: Package,
  mentoria: GraduationCap,
};

const productLabels: Record<string, string> = {
  ebook: "Ebook",
  kit: "Kit",
  mentoria: "Mentoria",
};

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatBrl(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: "default" | "success" | "warning" | "danger";
  loading?: boolean;
}

function MetricCard({ label, value, sub, icon: Icon, accent = "default", loading }: MetricCardProps) {
  const accentColors = {
    default: "text-muted-foreground",
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              {label}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <p className={`text-2xl font-bold tracking-tight ${accentColors[accent]}`}>
                  {value}
                </p>
                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
              </>
            )}
          </div>
          <Icon className={`h-5 w-5 ${accentColors[accent]} flex-shrink-0`} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminCompras() {
  const [page, setPage] = useState(1);
  const [productFilter, setProductFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [denyTarget, setDenyTarget] = useState<{ id: number; reason: string | null; email: string } | null>(null);
  const [denyNote, setDenyNote] = useState("");
  const pageSize = 25;

  const utils = trpc.useUtils();
  const filterArgs = {
    productSlug: productFilter === "all" ? undefined : productFilter,
    status: statusFilter === "all" ? undefined : (statusFilter as Status),
  };
  const { data, isLoading } = trpc.purchases.list.useQuery({
    page,
    pageSize,
    ...filterArgs,
  });
  const { data: metrics, isLoading: metricsLoading } = trpc.purchases.metrics.useQuery(filterArgs);

  const resend = trpc.purchases.resend.useMutation({
    onSuccess: () => {
      toast.success("Email reenviado!");
      utils.purchases.list.invalidate();
      utils.purchases.metrics.invalidate();
    },
    onError: (e) => {
      toast.error(e.message || "Erro ao reenviar.");
    },
  });

  const revoke = trpc.purchases.revokeToken.useMutation({
    onSuccess: () => {
      toast.success("Token revogado.");
      utils.purchases.list.invalidate();
      utils.purchases.metrics.invalidate();
    },
    onError: (e) => {
      toast.error(e.message || "Erro ao revogar.");
    },
  });

  const denyRefund = trpc.purchases.denyRefund.useMutation({
    onSuccess: () => {
      toast.success("Solicitação negada. Cliente notificado por email.");
      utils.purchases.list.invalidate();
      utils.purchases.metrics.invalidate();
      setDenyDialogOpen(false);
      setDenyNote("");
      setDenyTarget(null);
    },
    onError: (e) => {
      toast.error(e.message || "Erro ao negar reembolso.");
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display flex items-center gap-3">
          <ShoppingCart className="h-7 w-7 text-muted-foreground" />
          Compras
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Todas as compras processadas via Stripe. Reenvie email de entrega ou revogue links de download do ebook.
        </p>
      </div>

      {/* KPI cards — respect current filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Receita líquida"
          value={metrics ? formatBrl(metrics.netRevenueCents) : "—"}
          sub={metrics ? `${metrics.deliveredCount} entregue${metrics.deliveredCount === 1 ? "" : "s"}` : undefined}
          icon={TrendingUp}
          accent="success"
          loading={metricsLoading}
        />
        <MetricCard
          label="Ticket médio"
          value={metrics ? formatBrl(metrics.avgTicketCents) : "—"}
          sub="de compras entregues"
          icon={Receipt}
          loading={metricsLoading}
        />
        <MetricCard
          label="Últimos 7 dias"
          value={metrics ? formatBrl(metrics.last7dRevenueCents) : "—"}
          sub={metrics ? `${metrics.last7dCount} venda${metrics.last7dCount === 1 ? "" : "s"}` : undefined}
          icon={CheckCircle2}
          loading={metricsLoading}
        />
        <MetricCard
          label="Reembolsos"
          value={metrics ? formatBrl(metrics.refundedRevenueCents) : "—"}
          sub={metrics ? `${metrics.refundedCount} ${metrics.refundedCount === 1 ? "reembolso" : "reembolsos"}` : undefined}
          icon={Undo2}
          accent={metrics && metrics.refundedCount > 0 ? "danger" : "default"}
          loading={metricsLoading}
        />
      </div>

      {/* Product breakdown — only show if no product filter */}
      {productFilter === "all" && metrics && metrics.byProduct.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Por produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {metrics.byProduct.map((p) => {
                const Icon = productIcons[p.productSlug] || Package;
                return (
                  <div key={p.productSlug} className="flex items-center gap-3 p-3 border rounded bg-muted/30">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{productLabels[p.productSlug] || p.productSlug}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.count} {p.count === 1 ? "compra" : "compras"} · {formatBrl(p.revenueCents)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {metrics.byLanguage.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Ebook por idioma</p>
                <div className="flex gap-2 flex-wrap">
                  {metrics.byLanguage.map((l) => (
                    <Badge key={l.language} variant="outline" className="gap-1.5">
                      <span className="font-mono text-[10px] uppercase">{l.language}</span>
                      <span>·</span>
                      <span>{l.count}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Produto</label>
              <Select value={productFilter} onValueChange={(v) => { setProductFilter(v); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ebook">Ebook</SelectItem>
                  <SelectItem value="kit">Kit</SelectItem>
                  <SelectItem value="mentoria">Mentoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Status</label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                  <SelectItem value="abandoned">Abandonado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {data ? `${data.total} compra${data.total === 1 ? "" : "s"}` : "Compras"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !data?.rows.length ? (
            <p className="text-center py-10 text-sm text-muted-foreground">
              Nenhuma compra encontrada.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider border-b">
                    <th className="text-left px-4 py-3 font-medium">Produto</th>
                    <th className="text-left px-4 py-3 font-medium">Cliente</th>
                    <th className="text-left px-4 py-3 font-medium">Valor</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Downloads</th>
                    <th className="text-left px-4 py-3 font-medium">Data</th>
                    <th className="text-right px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.rows.map((p) => {
                    const Icon = productIcons[p.productSlug] || Package;
                    const status = (p.status as Status) || "pending";
                    const hasToken = Boolean(p.hasDownloadToken);
                    const pendingRefund = Boolean(p.refundRequestedAt && !p.refundDeniedAt && status !== "refunded");
                    return (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{productLabels[p.productSlug] || p.productSlug}</span>
                            {p.language && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-muted rounded border uppercase">
                                {p.language}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            {p.customerName && <span className="font-medium">{p.customerName}</span>}
                            <span className="text-muted-foreground text-xs">{p.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {formatCents(p.amountCents, p.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="gap-1.5 w-fit">
                              <span className={`h-1.5 w-1.5 rounded-full ${statusColors[status]}`} />
                              {statusLabels[status]}
                            </Badge>
                            {pendingRefund && (
                              <a href="/admin/reembolsos" className="w-fit">
                                <Badge variant="outline" className="gap-1 w-fit bg-amber-50 border-amber-300 text-amber-800 text-[10px] cursor-pointer hover:bg-amber-100">
                                  <AlertCircle className="h-2.5 w-2.5" />
                                  Reembolso solicitado →
                                </Badge>
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {p.productSlug === "ebook" ? `${p.downloadCount}/${p.maxDownloads}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(p.createdAt), "dd/MM/yyyy HH:mm")}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex gap-1">
                            {pendingRefund && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setDenyTarget({ id: p.id, reason: p.refundReason, email: p.email });
                                  setDenyDialogOpen(true);
                                }}
                                className="h-8 gap-1.5 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                                title="Negar reembolso"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Negar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => resend.mutate({ id: p.id })}
                              disabled={resend.isPending}
                              className="h-8 gap-1.5 text-xs"
                              title="Reenviar email"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Reenviar
                            </Button>
                            {p.productSlug === "ebook" && hasToken && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm("Revogar link de download? O cliente precisará de um novo (use Reenviar).")) {
                                    revoke.mutate({ id: p.id });
                                  }
                                }}
                                disabled={revoke.isPending}
                                className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                                title="Revogar token"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.total > pageSize && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="gap-1"
            >
              Próxima
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <RefreshCw className="hidden" />

      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Negar solicitação de reembolso</DialogTitle>
            <DialogDescription>
              O cliente {denyTarget?.email && <span className="font-mono text-xs">{denyTarget.email}</span>} receberá um email com o motivo da negativa.
            </DialogDescription>
          </DialogHeader>
          {denyTarget?.reason && (
            <div className="border bg-muted/50 rounded p-3 text-xs">
              <p className="text-muted-foreground mb-1">Motivo informado pelo cliente:</p>
              <p className="whitespace-pre-wrap">{denyTarget.reason}</p>
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="deny-note" className="text-sm font-medium">
              Motivo da negativa (mínimo 5 caracteres)
            </label>
            <Textarea
              id="deny-note"
              value={denyNote}
              onChange={(e) => setDenyNote(e.target.value)}
              placeholder="Ex: A compra foi há mais de 7 dias e o ebook já foi baixado 8 vezes..."
              rows={4}
              maxLength={2000}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!denyTarget || denyNote.trim().length < 5) return;
                denyRefund.mutate({ id: denyTarget.id, note: denyNote.trim() });
              }}
              disabled={denyRefund.isPending || denyNote.trim().length < 5}
            >
              {denyRefund.isPending ? "Negando..." : "Confirmar negativa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
