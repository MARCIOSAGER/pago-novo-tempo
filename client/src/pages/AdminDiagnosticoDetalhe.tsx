import { trpc } from "@/lib/trpc";
import { useRoute, useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Trash2,
  CheckCircle,
  Archive,
  RotateCcw,
  Send,
  Download,
} from "lucide-react";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  new: "Novo",
  reviewed: "Revisado",
  archived: "Arquivado",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  reviewed: "bg-emerald-500",
  archived: "bg-gray-500",
};

const pillarNames: Record<string, string> = {
  P: "Princípio",
  A: "Alinhamento",
  G: "Governo",
  O: "Obediência",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(media: number): { label: string; color: string } {
  if (media >= 8) return { label: "Pilar Sólido", color: "#2E5E3E" };
  if (media >= 5) return { label: "Em Construção", color: "#B8A88A" };
  if (media >= 3) return { label: "Pilar Frágil", color: "#8B6914" };
  return { label: "Em Colapso", color: "#7A3030" };
}

function ScoreBar({ label, score, letter }: { label: string; score: number; letter: string }) {
  const status = getStatusLabel(score);
  const pct = (score / 10) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{letter}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: status.color }}>
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] uppercase tracking-wider" style={{ color: status.color }}>
            {status.label}
          </span>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: status.color }}
        />
      </div>
    </div>
  );
}

export default function AdminDiagnosticoDetalhe() {
  const [, params] = useRoute("/admin/diagnosticos/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const utils = trpc.useUtils();

  const { data: diag, isLoading } = trpc.diagnostico.getById.useQuery(
    { id },
    { enabled: id > 0 }
  );

  const updateStatus = trpc.diagnostico.updateStatus.useMutation({
    onSuccess: () => {
      utils.diagnostico.getById.invalidate({ id });
      utils.diagnostico.listFiltered.invalidate();
      utils.diagnostico.metrics.invalidate();
      toast.success("Status atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status.");
    },
  });

  const deleteDiag = trpc.diagnostico.delete.useMutation({
    onSuccess: () => {
      toast.success("Diagnóstico excluído com sucesso!");
      setLocation("/admin/diagnosticos");
    },
    onError: () => {
      toast.error("Erro ao excluir diagnóstico.");
    },
  });

  const [emailTo, setEmailTo] = useState("");
  const sendEmail = trpc.diagnostico.sendEmail.useMutation({
    onSuccess: () => {
      toast.success("Email enviado com sucesso!");
      setEmailTo("");
    },
    onError: () => {
      toast.error("Erro ao enviar email.");
    },
  });

  const handleSendEmail = () => {
    if (!diag) return;
    const target = emailTo || diag.email;
    if (!target || !target.includes("@")) {
      toast.error("Informe um email válido.");
      return;
    }
    sendEmail.mutate({ id: diag.id, email: target });
  };

  const handleDownloadCSV = () => {
    if (!diag) return;
    const headers = ["Campo", "Valor"];
    const rows = [
      ["Nome", diag.nome],
      ["Email", diag.email || "—"],
      ["Média Geral", diag.mediaGeral.toFixed(1)],
      ["P — Princípio", diag.mediaP.toFixed(1)],
      ["A — Alinhamento", diag.mediaA.toFixed(1)],
      ["G — Governo", diag.mediaG.toFixed(1)],
      ["O — Obediência", diag.mediaO.toFixed(1)],
      ["Pilar Mais Fraco", `${diag.pilarMaisFraco} — ${pillarNames[diag.pilarMaisFraco]}`],
      ["Status", statusLabels[diag.status] || diag.status],
      ["Data", formatDate(diag.createdAt)],
      ["", ""],
      ["Respostas P", (diag.answersP as number[]).join(", ")],
      ["Respostas A", (diag.answersA as number[]).join(", ")],
      ["Respostas G", (diag.answersG as number[]).join(", ")],
      ["Respostas O", (diag.answersO as number[]).join(", ")],
    ];
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `diagnostico-${diag.nome.replace(/\s+/g, "-")}-${diag.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV baixado!");
  };

  const handleStatusChange = (newStatus: "new" | "reviewed" | "archived") => {
    if (!diag) return;
    updateStatus.mutate({ id: diag.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!diag) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/admin/diagnosticos")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Diagnóstico não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallStatus = getStatusLabel(diag.mediaGeral);
  const answers: { pillar: string; letter: string; data: number[] }[] = [
    { pillar: "Princípio", letter: "P", data: diag.answersP as number[] },
    { pillar: "Alinhamento", letter: "A", data: diag.answersA as number[] },
    { pillar: "Governo", letter: "G", data: diag.answersG as number[] },
    { pillar: "Obediência", letter: "O", data: diag.answersO as number[] },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/admin/diagnosticos")}
          className="gap-2 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-display">
            {diag.nome}
          </h1>
          <p className="text-sm text-muted-foreground">
            Diagnóstico #{diag.id}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={`text-xs text-white ${statusColors[diag.status]} self-start`}
        >
          {statusLabels[diag.status]}
        </Badge>
      </div>
      <Separator />

      {/* Info */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
            Informações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {diag.email && (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <a
                  href={`mailto:${diag.email}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {diag.email}
                </a>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data do Diagnóstico</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(diag.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
            Resultado Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-semibold font-display" style={{ color: overallStatus.color }}>
                {diag.mediaGeral.toFixed(1)}
              </p>
              <p className="text-xs uppercase tracking-wider mt-1" style={{ color: overallStatus.color }}>
                {overallStatus.label}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                Pilar mais fraco: <strong>{diag.pilarMaisFraco} — {pillarNames[diag.pilarMaisFraco]}</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pillar Scores */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
            Médias por Pilar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ScoreBar letter="P" label="Princípio" score={diag.mediaP} />
          <ScoreBar letter="A" label="Alinhamento" score={diag.mediaA} />
          <ScoreBar letter="G" label="Governo" score={diag.mediaG} />
          <ScoreBar letter="O" label="Obediência" score={diag.mediaO} />
        </CardContent>
      </Card>

      {/* Detailed Answers */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
            Respostas Detalhadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {answers.map(({ pillar, letter, data: answerData }) => (
            <div key={letter}>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                {letter} — {pillar}
              </h4>
              <div className="space-y-1.5">
                {answerData.map((val, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                    <span className="text-xs text-muted-foreground">
                      Pergunta {i + 1}
                    </span>
                    <span className={`text-sm font-semibold ${val >= 7 ? "text-emerald-600" : val >= 4 ? "text-amber-600" : "text-red-600"}`}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Send Email */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
            Enviar Resultado por Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder={diag.email || "Digite o email do destinatário..."}
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="font-accent text-sm"
            />
            <Button
              size="sm"
              className="gap-2 font-accent text-xs shrink-0"
              onClick={handleSendEmail}
              disabled={sendEmail.isPending}
            >
              <Send className="h-3.5 w-3.5" />
              {sendEmail.isPending ? "Enviando..." : "Enviar"}
            </Button>
          </div>
          {diag.email && !emailTo && (
            <p className="text-xs text-muted-foreground mt-2">
              Será enviado para <strong>{diag.email}</strong> (email do diagnóstico)
            </p>
          )}
          <p className="text-xs text-emerald-600 mt-2">
            PDF do relatório será gerado e enviado em anexo
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
            Ações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-accent text-xs"
              onClick={handleDownloadCSV}
            >
              <Download className="h-3.5 w-3.5" />
              Baixar CSV
            </Button>
            {diag.status !== "reviewed" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-accent text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={() => handleStatusChange("reviewed")}
                disabled={updateStatus.isPending}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Marcar como Revisado
              </Button>
            )}
            {diag.status !== "archived" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-accent text-xs"
                onClick={() => handleStatusChange("archived")}
                disabled={updateStatus.isPending}
              >
                <Archive className="h-3.5 w-3.5" />
                Arquivar
              </Button>
            )}
            {diag.status !== "new" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-accent text-xs"
                onClick={() => handleStatusChange("new")}
                disabled={updateStatus.isPending}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Voltar para Novo
              </Button>
            )}
          </div>

          <Separator className="my-4" />

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-accent text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir Diagnóstico
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o diagnóstico de{" "}
                  <strong>{diag.nome}</strong>? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteDiag.mutate({ id: diag.id })}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
