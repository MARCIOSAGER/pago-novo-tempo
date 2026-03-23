import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, CheckCircle, AlertTriangle, LogIn } from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  hr_admin: "Administrador RH",
  hr_viewer: "Visualizador RH",
  employee: "Colaborador",
};

export default function InviteAccept() {
  const [, params] = useRoute("/corporate/invite/:token");
  const [, setLocation] = useLocation();
  const token = params?.token ?? "";
  const { user, loading: authLoading } = useAuth();
  const [consentGiven, setConsentGiven] = useState(false);

  const { data: invite, isLoading } = trpc.corporate.validateInvite.useQuery(
    { token },
    { enabled: !!token }
  );

  const acceptMutation = trpc.corporate.acceptInvite.useMutation({
    onSuccess: (result) => {
      toast.success("Convite aceito com sucesso!");
      setTimeout(() => {
        setLocation(`/corporate/${result.orgSlug}`);
      }, 1000);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleAccept = () => {
    if (!consentGiven) {
      toast.error("Você precisa aceitar os termos para continuar.");
      return;
    }
    acceptMutation.mutate({ token, consentGiven: true });
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid or expired
  if (!invite?.valid) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-semibold">
              {invite?.expired ? "Convite Expirado" : "Convite Inválido"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {invite?.expired
                ? "Este convite expirou. Solicite um novo ao seu RH."
                : "Este link de convite não é válido."}
            </p>
            <Button variant="outline" onClick={() => setLocation("/")}>
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (acceptMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-semibold">Convite Aceito!</h2>
            <p className="text-muted-foreground text-sm">Redirecionando para o painel...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="bg-navy/10 p-3 rounded-full">
                <Building2 className="h-8 w-8 text-[#B8A88A]" />
              </div>
            </div>
            <h2 className="text-xl font-semibold">Você foi convidado</h2>
            <p className="text-muted-foreground text-sm">
              para participar do Diagnóstico Corporativo P.A.G.O.
            </p>
          </div>

          {/* Org info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Organização</span>
              <span className="font-medium">{invite.orgName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Função</span>
              <span className="font-medium">{roleLabels[invite.role] ?? invite.role}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{invite.email}</span>
            </div>
          </div>

          {!user ? (
            /* Not logged in */
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Faça login para aceitar o convite.
              </p>
              <Button className="w-full" onClick={() => {
                window.location.href = getLoginUrl(`/corporate/invite/${token}`);
              }}>
                <LogIn className="h-4 w-4 mr-2" /> Fazer Login
              </Button>
            </div>
          ) : (
            /* Logged in — show accept form */
            <div className="space-y-4">
              {/* LGPD Consent */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(!!checked)}
                />
                <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  Eu autorizo o tratamento dos meus dados pessoais para fins de diagnóstico organizacional,
                  conforme a LGPD (Lei 13.709/2018). Meus dados serão processados conforme a política da organização.
                </label>
              </div>

              <Button
                className="w-full"
                onClick={handleAccept}
                disabled={!consentGiven || acceptMutation.isPending}
              >
                {acceptMutation.isPending ? "Aceitando..." : "Aceitar Convite"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Logado como {user.name || user.email}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
