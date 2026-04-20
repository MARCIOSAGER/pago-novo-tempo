import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck, ChevronLeft, ChevronRight, User, Network,
  Trash2, Mail, Ban, FileCheck, XCircle, Package, RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

type Row = {
  id: number;
  actorUserId: number;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: unknown;
  ipAddress: string | null;
  createdAt: Date | string;
};

const ACTION_META: Record<string, { label: string; icon: typeof ShieldCheck; color: string }> = {
  "purchase.resend":           { label: "Reenviar email",           icon: Mail,       color: "text-blue-600" },
  "purchase.revokeToken":      { label: "Revogar token",            icon: Ban,        color: "text-red-600" },
  "refund.deny":               { label: "Negar reembolso",          icon: XCircle,    color: "text-amber-700" },
  "diagnostico.updateStatus":  { label: "Atualizar status",         icon: FileCheck,  color: "text-emerald-600" },
  "diagnostico.delete":        { label: "Excluir diagnóstico",      icon: Trash2,     color: "text-red-600" },
  "diagnostico.sendEmail":     { label: "Enviar diagnóstico",       icon: Mail,       color: "text-blue-600" },
  "diagnostico.bulkDelete":    { label: "Excluir em lote",          icon: Trash2,     color: "text-red-700" },
  "offers.save":               { label: "Salvar ofertas",           icon: Package,    color: "text-purple-600" },
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  purchase: "Compra",
  diagnostico: "Diagnóstico",
  offers: "Ofertas",
  organization: "Organização",
};

export default function AdminAuditoria() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const pageSize = 50;

  const { data, isLoading } = trpc.audit.list.useQuery({
    page,
    pageSize,
    action: actionFilter === "all" ? undefined : actionFilter,
    targetType: targetFilter === "all" ? undefined : targetFilter,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-muted-foreground" />
          Auditoria
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Histórico de ações privilegiadas realizadas por administradores.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Ação</label>
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(ACTION_META).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Tipo de alvo</label>
              <Select value={targetFilter} onValueChange={(v) => { setTargetFilter(v); setPage(1); }}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(TARGET_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setActionFilter("all"); setTargetFilter("all"); setPage(1); }}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {data ? `${data.total} entrada${data.total === 1 ? "" : "s"}` : "Entradas"}
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
            <p className="text-center py-10 text-sm text-muted-foreground">Nenhuma entrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider border-b">
                    <th className="text-left px-4 py-3 font-medium">Quando</th>
                    <th className="text-left px-4 py-3 font-medium">Admin</th>
                    <th className="text-left px-4 py-3 font-medium">Ação</th>
                    <th className="text-left px-4 py-3 font-medium">Alvo</th>
                    <th className="text-left px-4 py-3 font-medium">IP</th>
                    <th className="text-left px-4 py-3 font-medium">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(data.rows as Row[]).map((r) => {
                    const meta = ACTION_META[r.action] || { label: r.action, icon: ShieldCheck, color: "text-muted-foreground" };
                    const Icon = meta.icon;
                    return (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(r.createdAt), "dd/MM HH:mm:ss")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">{r.actorEmail || `#${r.actorUserId}`}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                            <span className="text-xs font-medium">{meta.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {r.targetType ? (
                            <Badge variant="outline" className="text-[10px]">
                              {TARGET_TYPE_LABELS[r.targetType] || r.targetType}
                              {r.targetId && <span className="ml-1 font-mono opacity-60">#{r.targetId}</span>}
                            </Badge>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {r.ipAddress ? (
                            <span className="font-mono text-[10px] text-muted-foreground inline-flex items-center gap-1">
                              <Network className="h-3 w-3" />
                              {r.ipAddress}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {r.details ? (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">ver</summary>
                              <pre className="mt-1 p-2 bg-muted/50 rounded text-[10px] overflow-x-auto max-w-md whitespace-pre-wrap break-all">
                                {JSON.stringify(r.details, null, 2)}
                              </pre>
                            </details>
                          ) : "—"}
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
    </div>
  );
}
