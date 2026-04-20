import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Undo2, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Clock,
  AlertTriangle, BookOpen, Package, GraduationCap, Mail, User,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Tab = "pending" | "approved" | "denied";

type RefundRow = {
  id: number;
  protocol: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  email: string;
  customerName: string | null;
  productSlug: string;
  language: string | null;
  amountCents: number;
  currency: string;
  status: string;
  refundRequestedAt: Date | string | null;
  refundReason: string | null;
  refundDeniedAt: Date | string | null;
  refundDenialNote: string | null;
  createdAt: Date | string;
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

function formatBrl(cents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

export default function AdminReembolsos() {
  const [tab, setTab] = useState<Tab>("pending");
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.purchases.listRefunds.useQuery({ tab, page, pageSize });

  // Fetch counts for each tab (for the badges)
  const pendingCount = trpc.purchases.listRefunds.useQuery({ tab: "pending", page: 1, pageSize: 1 });
  const approvedCount = trpc.purchases.listRefunds.useQuery({ tab: "approved", page: 1, pageSize: 1 });
  const deniedCount = trpc.purchases.listRefunds.useQuery({ tab: "denied", page: 1, pageSize: 1 });

  const [denyTarget, setDenyTarget] = useState<RefundRow | null>(null);
  const [denyNote, setDenyNote] = useState("");
  const [approveTarget, setApproveTarget] = useState<RefundRow | null>(null);

  const approve = trpc.purchases.approveRefund.useMutation({
    onSuccess: () => {
      toast.success("Reembolso processado no Stripe e email enviado ao cliente!");
      utils.purchases.listRefunds.invalidate();
      utils.purchases.list.invalidate();
      utils.purchases.metrics.invalidate();
      setApproveTarget(null);
    },
    onError: (e) => {
      toast.error(e.message || "Erro ao aprovar reembolso.");
    },
  });

  const deny = trpc.purchases.denyRefund.useMutation({
    onSuccess: () => {
      toast.success("Solicitação negada. Cliente notificado por email.");
      utils.purchases.listRefunds.invalidate();
      utils.purchases.list.invalidate();
      setDenyTarget(null);
      setDenyNote("");
    },
    onError: (e) => {
      toast.error(e.message || "Erro ao negar.");
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display flex items-center gap-3">
          <Undo2 className="h-7 w-7 text-muted-foreground" />
          Reembolsos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerenciamento de solicitações de reembolso. Aprovações processam via API do Stripe automaticamente.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-3.5 w-3.5" />
            Pendentes
            {pendingCount.data && pendingCount.data.total > 0 && (
              <Badge variant="default" className="ml-1 h-5 px-1.5 text-[10px] bg-amber-600">
                {pendingCount.data.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Aprovados
            {approvedCount.data && approvedCount.data.total > 0 && (
              <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">
                {approvedCount.data.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="denied" className="gap-2">
            <XCircle className="h-3.5 w-3.5" />
            Negados
            {deniedCount.data && deniedCount.data.total > 0 && (
              <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">
                {deniedCount.data.total}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {data ? `${data.total} solicitaç${data.total === 1 ? "ão" : "ões"}` : "Solicitações"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-2">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : !data?.rows.length ? (
                <p className="text-center py-10 text-sm text-muted-foreground">
                  {tab === "pending" ? "Nenhuma solicitação pendente." : tab === "approved" ? "Nenhum reembolso aprovado ainda." : "Nenhuma solicitação negada."}
                </p>
              ) : (
                <div className="divide-y">
                  {(data.rows as RefundRow[]).map((r) => (
                    <RefundItem
                      key={r.id}
                      refund={r}
                      tab={tab}
                      onApprove={() => setApproveTarget(r)}
                      onDeny={() => setDenyTarget(r)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {data && data.total > pageSize && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">Página {page} de {totalPages}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="gap-1">
                  <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="gap-1">
                  Próxima <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve dialog */}
      <Dialog open={!!approveTarget} onOpenChange={(o) => !o && setApproveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Aprovar reembolso
            </DialogTitle>
            <DialogDescription>
              Isto vai <strong>executar o reembolso no Stripe</strong> e enviar email de confirmação ao cliente. A ação é <strong>irreversível</strong>.
            </DialogDescription>
          </DialogHeader>
          {approveTarget && (
            <div className="space-y-3">
              <div className="border bg-muted/50 rounded p-3 text-sm space-y-1.5">
                <div className="flex justify-between"><span className="text-muted-foreground">Protocolo:</span> <span className="font-mono text-xs">{approveTarget.protocol}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cliente:</span> <span>{approveTarget.customerName || approveTarget.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Produto:</span> <span>{productLabels[approveTarget.productSlug]}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Valor:</span> <span className="font-semibold">{formatBrl(approveTarget.amountCents, approveTarget.currency)}</span></div>
              </div>
              {approveTarget.refundReason && (
                <div className="border bg-muted/30 rounded p-3 text-xs">
                  <p className="text-muted-foreground mb-1">Motivo informado pelo cliente:</p>
                  <p className="whitespace-pre-wrap">{approveTarget.refundReason}</p>
                </div>
              )}
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>O valor voltará para o cliente em 5-10 dias úteis. Ação registrada no log de auditoria.</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>Cancelar</Button>
            <Button
              onClick={() => approveTarget && approve.mutate({ id: approveTarget.id })}
              disabled={approve.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {approve.isPending ? "Processando..." : "Confirmar reembolso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deny dialog */}
      <Dialog open={!!denyTarget} onOpenChange={(o) => !o && setDenyTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Negar reembolso</DialogTitle>
            <DialogDescription>
              O cliente será notificado por email com o motivo informado.
            </DialogDescription>
          </DialogHeader>
          {denyTarget && (
            <>
              <div className="border bg-muted/50 rounded p-3 text-sm">
                <p className="text-muted-foreground text-xs mb-1">Protocolo: <span className="font-mono">{denyTarget.protocol}</span></p>
                <p>{denyTarget.customerName || denyTarget.email}</p>
              </div>
              {denyTarget.refundReason && (
                <div className="border bg-muted/30 rounded p-3 text-xs">
                  <p className="text-muted-foreground mb-1">Motivo do cliente:</p>
                  <p className="whitespace-pre-wrap">{denyTarget.refundReason}</p>
                </div>
              )}
              <div>
                <label htmlFor="deny-note" className="text-sm font-medium mb-1.5 block">
                  Motivo da negativa (mín. 5 caracteres)
                </label>
                <Textarea
                  id="deny-note"
                  value={denyNote}
                  onChange={(e) => setDenyNote(e.target.value)}
                  placeholder="Ex: A compra foi há mais de 7 dias e o ebook foi baixado múltiplas vezes..."
                  rows={4}
                  maxLength={2000}
                />
              </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyTarget(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => denyTarget && denyNote.trim().length >= 5 && deny.mutate({ id: denyTarget.id, note: denyNote.trim() })}
              disabled={deny.isPending || denyNote.trim().length < 5}
            >
              {deny.isPending ? "Negando..." : "Confirmar negativa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RefundItem({
  refund, tab, onApprove, onDeny,
}: {
  refund: RefundRow;
  tab: Tab;
  onApprove: () => void;
  onDeny: () => void;
}) {
  const Icon = productIcons[refund.productSlug] || Package;
  return (
    <div className="p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex items-start gap-3 flex-1 min-w-[280px]">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] bg-muted px-2 py-0.5 rounded border">{refund.protocol}</span>
              <Badge variant="outline" className="text-[10px]">{productLabels[refund.productSlug]}</Badge>
              {refund.language && (
                <span className="font-mono text-[10px] uppercase bg-muted/70 px-1.5 py-0.5 border">{refund.language}</span>
              )}
              <span className="text-xs font-semibold">{formatBrl(refund.amountCents, refund.currency)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1.5 text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{refund.customerName || "—"}</span>
              <Mail className="h-3 w-3 ml-1" />
              <span>{refund.email}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Solicitado em {refund.refundRequestedAt ? format(new Date(refund.refundRequestedAt), "dd/MM/yyyy HH:mm") : "—"}
              {" · compra "}{format(new Date(refund.createdAt), "dd/MM/yyyy")}
            </p>

            {refund.refundReason && (
              <div className="mt-3 p-2.5 bg-muted/50 border rounded text-xs">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Motivo do cliente</p>
                <p className="whitespace-pre-wrap">{refund.refundReason}</p>
              </div>
            )}

            {tab === "denied" && refund.refundDenialNote && (
              <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded text-xs">
                <p className="text-red-700 text-[10px] uppercase tracking-wider mb-1">Motivo da negativa · {refund.refundDeniedAt && format(new Date(refund.refundDeniedAt), "dd/MM HH:mm")}</p>
                <p className="whitespace-pre-wrap text-red-900">{refund.refundDenialNote}</p>
              </div>
            )}

            {tab === "approved" && (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Reembolso processado
              </div>
            )}
          </div>
        </div>

        {tab === "pending" && (
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={onDeny} className="gap-1.5 text-amber-700 hover:text-amber-800 hover:bg-amber-50">
              <XCircle className="h-3.5 w-3.5" />
              Negar
            </Button>
            <Button size="sm" onClick={onApprove} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Aprovar e reembolsar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
