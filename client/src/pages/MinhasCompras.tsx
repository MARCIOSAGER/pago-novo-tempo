import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft, ShoppingBag, Download, Undo2, Clock, Loader2,
  BookOpen, Package, GraduationCap, CheckCircle2, XCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MinhasCompras() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const copy = t.profile.purchases;

  if (loading) return null;
  if (!user) {
    setLocation("/login?returnTo=/minhas-compras");
    return null;
  }

  const { data: purchases, isLoading } = trpc.purchases.listMine.useQuery();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F5F0E8] pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {copy.backLabel}
          </button>

          <div>
            <h1 className="text-3xl font-[Cormorant] font-bold text-[#1A2744] flex items-center gap-3">
              <ShoppingBag className="h-7 w-7 text-[#1A2744]/60" />
              {copy.title}
            </h1>
            <p className="text-sm text-gray-600 mt-1.5">{copy.subtitle}</p>
          </div>

          <Card>
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </div>
              ) : !purchases || purchases.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">{copy.empty}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setLocation("/diagnostico")}
                  >
                    {copy.exploreProducts}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchases.map((p) => (
                    <PurchaseItem key={p.id} purchase={p} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}

function PurchaseItem({
  purchase,
}: {
  purchase: {
    id: number;
    stripeSessionId: string;
    productSlug: string;
    language: string | null;
    amountCents: number;
    currency: string;
    status: string;
    downloadCount: number;
    maxDownloads: number;
    tokenActive: boolean;
    refundRequestedAt: Date | string | null;
    refundDeniedAt: Date | string | null;
    createdAt: Date | string;
  };
}) {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const copy = t.profile.purchases;

  const reissue = trpc.purchases.reissueMyDownload.useMutation({
    onSuccess: (data) => {
      window.location.href = data.downloadUrl;
    },
    onError: (e) => {
      toast.error(e.message || "Erro ao preparar download.");
    },
  });

  const productIcons: Record<string, typeof BookOpen> = {
    ebook: BookOpen,
    kit: Package,
    mentoria: GraduationCap,
  };
  const productLabels: Record<string, string> = {
    ebook: "Ebook P.A.G.O.",
    kit: "Kit P.A.G.O.",
    mentoria: "Mentoria P.A.G.O.",
  };
  const Icon = productIcons[purchase.productSlug] || Package;

  const formatBrl = (cents: number, currency: string) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString(language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });

  const statusLabel: Record<string, string> = {
    pending: copy.status.pending,
    delivered: copy.status.delivered,
    refunded: copy.status.refunded,
    failed: copy.status.failed,
  };
  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    delivered: "bg-emerald-100 text-emerald-800",
    refunded: "bg-gray-100 text-gray-700",
    failed: "bg-red-100 text-red-800",
  };

  const daysElapsed = Math.floor((Date.now() - new Date(purchase.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const within7Days = daysElapsed < 7;
  const pendingRefund = Boolean(purchase.refundRequestedAt && !purchase.refundDeniedAt && purchase.status !== "refunded");
  const deniedRefund = Boolean(purchase.refundDeniedAt && purchase.status !== "refunded");
  const canRequestRefund = purchase.status !== "refunded" && purchase.status !== "failed" && within7Days && !pendingRefund;
  const canDownload = purchase.productSlug === "ebook" && purchase.status === "delivered";
  const protocol = `REE-${purchase.id}-${new Date(purchase.createdAt).getFullYear()}`;

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-sm">{productLabels[purchase.productSlug] || purchase.productSlug}</h3>
            {purchase.language && (
              <span className="font-mono text-[10px] uppercase bg-gray-100 px-1.5 py-0.5 rounded border">
                {purchase.language}
              </span>
            )}
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${statusColor[purchase.status] || "bg-gray-100"}`}>
              {statusLabel[purchase.status] || purchase.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(purchase.createdAt)} · {formatBrl(purchase.amountCents, purchase.currency)}
            {purchase.productSlug === "ebook" && purchase.status === "delivered" && (
              <> · {copy.downloads.replace("{count}", String(purchase.downloadCount)).replace("{max}", String(purchase.maxDownloads))}</>
            )}
          </p>
        </div>
      </div>

      {pendingRefund && (
        <div className="flex items-center justify-between gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 flex-wrap">
          <span className="inline-flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            {copy.refundPending}
          </span>
          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-amber-300">
            {protocol}
          </span>
        </div>
      )}

      {deniedRefund && (
        <div className="flex items-center justify-between gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 flex-wrap">
          <span className="inline-flex items-center gap-2">
            <XCircle className="h-3.5 w-3.5" />
            {copy.refundDenied}
          </span>
          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-red-300">
            {protocol}
          </span>
        </div>
      )}

      {purchase.status === "refunded" && (
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {copy.refundCompleted}
        </div>
      )}

      {(canDownload || canRequestRefund) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {canDownload && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => reissue.mutate({ purchaseId: purchase.id })}
              disabled={reissue.isPending}
              className="h-8 gap-1.5 text-xs"
            >
              {reissue.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {copy.download}
            </Button>
          )}
          {canRequestRefund && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLocation(`/reembolso?session_id=${encodeURIComponent(purchase.stripeSessionId)}`)}
              className="h-8 gap-1.5 text-xs text-gray-600"
            >
              <Undo2 className="h-3.5 w-3.5" />
              {copy.requestRefund}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
