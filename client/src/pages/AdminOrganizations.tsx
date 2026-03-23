import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Building2, Plus, Search, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500",
  trial: "bg-amber-500",
  suspended: "bg-red-500",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminOrganizations() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: "", slug: "", cnpj: "", maxMembers: 50 });

  const { data, isLoading, refetch } = trpc.corporate.listOrgs.useQuery({
    search: search || undefined,
    page,
    pageSize: 15,
  });

  const createMutation = trpc.corporate.createOrg.useMutation({
    onSuccess: () => {
      toast.success("Organização criada com sucesso");
      setDialogOpen(false);
      setNewOrg({ name: "", slug: "", cnpj: "", maxMembers: 50 });
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.corporate.deleteOrg.useMutation({
    onSuccess: () => {
      toast.success("Organização removida");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCreate = () => {
    if (!newOrg.name || !newOrg.slug) {
      toast.error("Nome e slug são obrigatórios");
      return;
    }
    createMutation.mutate(newOrg);
  };

  const handleSlugify = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setNewOrg((prev) => ({ ...prev, name, slug }));
  };

  const totalPages = data ? Math.ceil(data.total / 15) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organizações</h1>
          <p className="text-muted-foreground text-sm">
            Gerenciar empresas do módulo corporativo
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Nova Organização
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Organização</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Nome</Label>
                <Input
                  value={newOrg.name}
                  onChange={(e) => handleSlugify(e.target.value)}
                  placeholder="Empresa XYZ"
                />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input
                  value={newOrg.slug}
                  onChange={(e) => setNewOrg((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="empresa-xyz"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL: metodopago.com/corporate/{newOrg.slug || "..."}
                </p>
              </div>
              <div>
                <Label>CNPJ (opcional)</Label>
                <Input
                  value={newOrg.cnpj}
                  onChange={(e) => setNewOrg((prev) => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div>
                <Label>Máximo de membros</Label>
                <Input
                  type="number"
                  value={newOrg.maxMembers}
                  onChange={(e) => setNewOrg((prev) => ({ ...prev, maxMembers: parseInt(e.target.value) || 50 }))}
                />
              </div>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? "Criando..." : "Criar Organização"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nome ou slug..."
          className="pl-9"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !data?.items.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma organização encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.items.map((org) => (
            <Card key={org.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">{org.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">/corporate/{org.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" /> máx {org.maxMembers}
                    </Badge>
                    <Badge className={statusColors[org.status] || "bg-gray-500"}>
                      {org.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Excluir "${org.name}"? Esta ação não pode ser desfeita.`)) {
                          deleteMutation.mutate({ id: org.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {org.cnpj && <span>CNPJ: {org.cnpj}</span>}
                  <span>Criada em {formatDate(org.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground self-center">
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Próxima
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
