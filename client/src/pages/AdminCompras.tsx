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
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Status = "pending" | "delivered" | "failed" | "refunded";

const statusLabels: Record<Status, string> = {
  pending: "Pendente",
  delivered: "Entregue",
  failed: "Falhou",
  refunded: "Reembolsado",
};

const statusColors: Record<Status, string> = {
  pending: "bg-amber-500",
  delivered: "bg-emerald-500",
  failed: "bg-red-500",
  refunded: "bg-gray-500",
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

export default function AdminCompras() {
  const [page, setPage] = useState(1);
  const [productFilter, setProductFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const pageSize = 25;

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.purchases.list.useQuery({
    page,
    pageSize,
    productSlug: productFilter === "all" ? undefined : productFilter,
    status: statusFilter === "all" ? undefined : (statusFilter as Status),
  });

  const resend = trpc.purchases.resend.useMutation({
    onSuccess: () => {
      toast.success("Email reenviado!");
      utils.purchases.list.invalidate();
    },
    onError: (e) => {
      toast.error(e.message || "Erro ao reenviar.");
    },
  });

  const revoke = trpc.purchases.revokeToken.useMutation({
    onSuccess: () => {
      toast.success("Token revogado.");
      utils.purchases.list.invalidate();
    },
    onError: (e) => {
      toast.error(e.message || "Erro ao revogar.");
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
                    const hasToken = Boolean(p.downloadToken);
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
                          <Badge variant="outline" className="gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${statusColors[status]}`} />
                            {statusLabels[status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {p.productSlug === "ebook" ? `${p.downloadCount}/${p.maxDownloads}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(p.createdAt), "dd/MM/yyyy HH:mm")}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex gap-1">
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
    </div>
  );
}
