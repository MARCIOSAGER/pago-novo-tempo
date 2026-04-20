import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  User, Mail, Lock, ArrowLeft, Loader2, CheckCircle2,
  ShoppingBag, Download, BookOpen, Package, GraduationCap, Undo2, Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PasswordStrength from "@/components/PasswordStrength";
import { trpc } from "@/lib/trpc";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  if (loading) return null;
  if (!user) {
    setLocation("/login?returnTo=/profile");
    return null;
  }

  const isEmailUser = user.loginMethod === "email";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t.auth.passwordMismatch);
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t.auth.passwordTooShort);
      return;
    }

    setChangingPw(true);
    try {
      // Login with current password to verify, then update
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: currentPassword }),
      });
      if (!loginRes.ok) {
        toast.error("Senha atual incorreta.");
        return;
      }

      // Use forgot-password flow internally: request reset, then apply
      const forgotRes = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      if (!forgotRes.ok) {
        toast.error("Erro ao alterar senha.");
        return;
      }

      // For now, show success message directing to email
      setPwSuccess(true);
      toast.success("Enviamos um link de redefinição para o seu email.");
    } catch {
      toast.error("Erro ao alterar senha.");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F5F0E8] pt-28 pb-16 px-6">
        <div className="max-w-lg mx-auto space-y-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>

          <h1 className="text-2xl font-[Cormorant] font-bold text-[#1A2744]">Meu Perfil</h1>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</label>
                <p className="text-sm font-medium mt-1">{user.name || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                <p className="text-sm font-medium mt-1">{user.email || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Metodo de Login</label>
                <div className="mt-1">
                  <Badge variant="outline">{user.loginMethod || "—"}</Badge>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Permissao</label>
                <div className="mt-1">
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password — only for email users */}
          {isEmailUser && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Alterar Senha
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pwSuccess ? (
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    <p className="text-sm text-gray-600">Enviamos um link de redefinição para <strong>{user.email}</strong>.</p>
                    <p className="text-xs text-gray-400">Verifique a sua caixa de entrada.</p>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Senha atual</label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Nova senha</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="mt-1"
                      />
                      <PasswordStrength password={newPassword} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Confirmar nova senha</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" disabled={changingPw || !currentPassword || !newPassword || !confirmPassword} className="w-full">
                      {changingPw ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {changingPw ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {!isEmailUser && (
            <Card>
              <CardContent className="py-6 text-center text-sm text-gray-500">
                <Mail className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                Voce faz login via <strong>{user.loginMethod}</strong>. A senha e gerenciada pelo provedor.
              </CardContent>
            </Card>
          )}

          <MyPurchasesSection />
        </div>
      </div>
    </>
  );
}

function MyPurchasesSection() {
  const { t } = useLanguage();
  const { data: purchases, isLoading } = trpc.purchases.listMine.useQuery();
  const copy = t.profile.purchases;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" /> {copy.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !purchases || purchases.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">{copy.empty}</p>
        ) : (
          <div className="space-y-3">
            {purchases.map((p) => (
              <PurchaseItem key={p.id} purchase={p} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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
  const canRequestRefund = purchase.status !== "refunded" && purchase.status !== "failed" && within7Days && !pendingRefund;
  const canDownload = purchase.productSlug === "ebook" && purchase.status === "delivered";

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
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
            REE-{purchase.id}-{new Date(purchase.createdAt).getFullYear()}
          </span>
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
