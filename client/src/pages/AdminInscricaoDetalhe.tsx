import { trpc } from "@/lib/trpc";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  contacted: "Contatado",
  enrolled: "Inscrito",
  rejected: "Rejeitado",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500",
  contacted: "bg-blue-500",
  enrolled: "bg-emerald-500",
  rejected: "bg-red-500",
};

const statusDescriptions: Record<string, string> = {
  pending: "Aguardando primeiro contato da equipe.",
  contacted: "Contato realizado, aguardando confirmação.",
  enrolled: "Inscrito confirmado na mentoria P.A.G.O.",
  rejected: "Inscrição não aprovada.",
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

export default function AdminInscricaoDetalhe() {
  const [, params] = useRoute("/admin/inscricoes/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const utils = trpc.useUtils();

  const { data: inscription, isLoading } = trpc.mentoria.getById.useQuery(
    { id },
    { enabled: id > 0 }
  );

  const updateStatus = trpc.mentoria.updateStatus.useMutation({
    onSuccess: () => {
      utils.mentoria.getById.invalidate({ id });
      utils.mentoria.listFiltered.invalidate();
      utils.mentoria.metrics.invalidate();
      toast.success("Status atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status.");
    },
  });

  const deleteInscription = trpc.mentoria.delete.useMutation({
    onSuccess: () => {
      toast.success("Inscrição excluída com sucesso!");
      setLocation("/admin/inscricoes");
    },
    onError: () => {
      toast.error("Erro ao excluir inscrição.");
    },
  });

  const handleStatusChange = (newStatus: "pending" | "contacted" | "enrolled" | "rejected") => {
    if (!inscription) return;
    updateStatus.mutate({ id: inscription.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!inscription) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/admin/inscricoes")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Inscrição não encontrada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/admin/inscricoes")}
          className="gap-2 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-display">
            {inscription.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Inscrição #{inscription.id}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={`text-xs text-white ${statusColors[inscription.status]} self-start`}
        >
          {statusLabels[inscription.status]}
        </Badge>
      </div>
      <Separator />

      {/* Contact Info */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
            Informações de Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <a
                href={`mailto:${inscription.email}`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {inscription.email}
              </a>
            </div>
          </div>

          {inscription.phone && (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <a
                  href={`https://wa.me/${inscription.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {inscription.phone}
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data de Inscrição</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(inscription.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Última Atualização</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(inscription.updatedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      {inscription.message && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Mensagem do Candidato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {inscription.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Status */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
            Status Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className={`text-xs text-white ${statusColors[inscription.status]}`}
            >
              {statusLabels[inscription.status]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {statusDescriptions[inscription.status]}
            </span>
          </div>
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
            {inscription.status !== "contacted" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-accent text-xs"
                onClick={() => handleStatusChange("contacted")}
                disabled={updateStatus.isPending}
              >
                <Send className="h-3.5 w-3.5" />
                Marcar como Contatado
              </Button>
            )}
            {inscription.status !== "enrolled" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-accent text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={() => handleStatusChange("enrolled")}
                disabled={updateStatus.isPending}
              >
                <UserCheck className="h-3.5 w-3.5" />
                Aprovar Inscrição
              </Button>
            )}
            {inscription.status !== "rejected" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-accent text-xs text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleStatusChange("rejected")}
                disabled={updateStatus.isPending}
              >
                <UserX className="h-3.5 w-3.5" />
                Rejeitar
              </Button>
            )}
            {inscription.status !== "pending" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-accent text-xs"
                onClick={() => handleStatusChange("pending")}
                disabled={updateStatus.isPending}
              >
                <Clock className="h-3.5 w-3.5" />
                Voltar para Pendente
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
                Excluir Inscrição
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a inscrição de{" "}
                  <strong>{inscription.name}</strong>? Esta ação não pode ser
                  desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteInscription.mutate({ id: inscription.id })}
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
