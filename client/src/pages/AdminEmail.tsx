import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Server, Shield, Send, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminEmail() {
  const { data: status, isLoading } = trpc.system.emailStatus.useQuery();
  const sendTest = trpc.system.sendTestEmail.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Email de teste enviado com sucesso!");
      } else {
        toast.error("Falha ao enviar. Verifique as configurações SMTP.");
      }
      setSending(false);
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao enviar email de teste.");
      setSending(false);
    },
  });

  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendTest = () => {
    if (!testEmail.trim()) {
      toast.error("Digite um email de destino.");
      return;
    }
    setSending(true);
    sendTest.mutate({ to: testEmail.trim() });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-display">
          Configuração de Email
        </h1>
        <p className="text-sm text-muted-foreground font-accent mt-1">
          Status do SMTP e envio de emails de teste
        </p>
      </div>

      <Separator />

      {/* SMTP Status */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Server className="h-4 w-4" />
            Status do SMTP
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : status ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {status.smtpConfigured ? (
                  <Badge variant="default" className="gap-1.5 bg-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Configurado
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1.5">
                    <XCircle className="h-3 w-3" />
                    Não configurado
                  </Badge>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <ConfigItem
                  label="Servidor (Host)"
                  value={status.smtpHost}
                  icon={<Server className="h-3.5 w-3.5" />}
                />
                <ConfigItem
                  label="Porta"
                  value={status.smtpPort}
                  icon={<Shield className="h-3.5 w-3.5" />}
                  extra={status.smtpPort === "465" ? "SSL" : status.smtpPort === "587" ? "STARTTLS" : undefined}
                />
                <ConfigItem
                  label="Remetente (SMTP_USER)"
                  value={status.smtpUser}
                  icon={<Mail className="h-3.5 w-3.5" />}
                />
                <ConfigItem
                  label="Destinatário Admin (OWNER_EMAIL)"
                  value={status.ownerEmail}
                  icon={<Mail className="h-3.5 w-3.5" />}
                  warning={
                    status.ownerEmail && status.smtpUser && status.ownerEmail.includes(status.smtpUser)
                      ? "Mesmo email do remetente — pode não funcionar"
                      : undefined
                  }
                />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Email Flow Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-semibold font-display">
                Fluxo de Emails
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>1.</strong> Pessoa se inscreve no site</p>
                <p><strong>2.</strong> Email de confirmação enviado para o inscrito (de <code className="bg-muted px-1 rounded">{status?.smtpUser || "SMTP_USER"}</code>)</p>
                <p><strong>3.</strong> Notificação enviada para o admin (para <code className="bg-muted px-1 rounded">{status?.ownerEmail || "OWNER_EMAIL"}</code>)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Send className="h-4 w-4" />
            Enviar Email de Teste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="email@exemplo.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendTest()}
              className="max-w-sm"
            />
            <Button
              onClick={handleSendTest}
              disabled={sending || !status?.smtpConfigured}
              className="gap-2 font-accent shrink-0"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar Teste
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Envia um email de teste do sistema para o endereço informado. Use para verificar se o SMTP está funcionando.
          </p>
        </CardContent>
      </Card>

      {/* Configuration Guide */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
            Variáveis de Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <EnvItem name="SMTP_HOST" description="Servidor SMTP (ex: smtp.hostinger.com)" />
            <EnvItem name="SMTP_PORT" description="Porta (465 para SSL, 587 para STARTTLS)" />
            <EnvItem name="SMTP_USER" description="Email remetente (ex: noreply@metodopago.com)" />
            <EnvItem name="SMTP_PASS" description="Senha do email SMTP" />
            <EnvItem name="OWNER_EMAIL" description="Email que recebe notificações de inscrição" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConfigItem({
  label,
  value,
  icon,
  extra,
  warning,
}: {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  extra?: string;
  warning?: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-semibold font-accent">{label}</span>
      </div>
      {value ? (
        <div>
          <p className="text-sm font-mono truncate">{value}</p>
          {extra && (
            <Badge variant="outline" className="text-[10px] mt-1">{extra}</Badge>
          )}
          {warning && (
            <p className="text-[11px] text-amber-600 mt-1">{warning}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">Não configurado</p>
      )}
    </div>
  );
}

function EnvItem({ name, description }: { name: string; description: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <code className="text-xs font-semibold text-primary">{name}</code>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  );
}
