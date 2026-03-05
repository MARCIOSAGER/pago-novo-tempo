import { trpc } from "@/lib/trpc";
import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Trash2,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  all: "Todos",
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
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-600";
  if (score >= 5) return "text-amber-600";
  if (score >= 3) return "text-orange-600";
  return "text-red-600";
}

export default function AdminDiagnosticos() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const pageSize = 15;

  const searchTimeout = useMemo(() => ({ id: null as ReturnType<typeof setTimeout> | null }), []);
  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (searchTimeout.id) clearTimeout(searchTimeout.id);
      searchTimeout.id = setTimeout(() => {
        setDebouncedSearch(value);
        setPage(1);
      }, 400);
    },
    [searchTimeout]
  );

  const { data, isLoading } = trpc.diagnostico.listFiltered.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: debouncedSearch || undefined,
    page,
    pageSize,
  });

  const utils = trpc.useUtils();

  const bulkDelete = trpc.diagnostico.bulkDelete.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.deleted} diagnóstico(s) excluído(s)!`);
      setSelected(new Set());
      utils.diagnostico.listFiltered.invalidate();
      utils.diagnostico.metrics.invalidate();
    },
    onError: () => {
      toast.error("Erro ao excluir diagnósticos.");
    },
  });

  const { refetch: fetchExport } = trpc.diagnostico.export.useQuery(undefined, {
    enabled: false,
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  const pageIds = data?.items.map((i) => i.id) ?? [];
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const result = await fetchExport();
      const items = result.data;
      if (!items || items.length === 0) {
        toast.error("Nenhum dado para exportar.");
        return;
      }

      const headers = [
        "ID", "Nome", "Email", "Média P", "Média A", "Média G", "Média O",
        "Média Geral", "Pilar Fraco", "Status", "Data",
      ];
      const rows = items.map((item) => [
        item.id,
        `"${(item.nome || "").replace(/"/g, '""')}"`,
        `"${(item.email || "").replace(/"/g, '""')}"`,
        item.mediaP.toFixed(1),
        item.mediaA.toFixed(1),
        item.mediaG.toFixed(1),
        item.mediaO.toFixed(1),
        item.mediaGeral.toFixed(1),
        `${item.pilarMaisFraco} (${pillarNames[item.pilarMaisFraco] || item.pilarMaisFraco})`,
        statusLabels[item.status] || item.status,
        formatDate(item.createdAt),
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `diagnosticos-pago-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exportado com sucesso!");
    } catch {
      toast.error("Erro ao exportar dados.");
    }
  };

  const now = new Date();
  const timestamp = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-display">
            Diagnósticos P.A.G.O.
          </h1>
          <p className="text-sm text-muted-foreground capitalize">{timestamp}</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-accent text-xs gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                  disabled={bulkDelete.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir ({selected.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir <strong>{selected.size} diagnóstico(s)</strong>? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => bulkDelete.mutate({ ids: Array.from(selected) })}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="font-accent text-xs gap-2"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </Button>
        </div>
      </div>
      <Separator />

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 font-accent text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] font-accent text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="new">Novo</SelectItem>
                  <SelectItem value="reviewed">Revisado</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
              {isLoading
                ? "Carregando..."
                : `${data?.total ?? 0} diagnóstico(s) encontrado(s)`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.items.length ? (
            <div className="text-center py-12 px-4">
              <p className="text-sm text-muted-foreground">
                Nenhum diagnóstico encontrado com os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={allPageSelected}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead className="font-accent text-xs uppercase tracking-wider w-[50px]">
                      #
                    </TableHead>
                    <TableHead className="font-accent text-xs uppercase tracking-wider">
                      Nome
                    </TableHead>
                    <TableHead className="font-accent text-xs uppercase tracking-wider hidden md:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="font-accent text-xs uppercase tracking-wider hidden md:table-cell">
                      Média
                    </TableHead>
                    <TableHead className="font-accent text-xs uppercase tracking-wider hidden lg:table-cell">
                      Pilar Fraco
                    </TableHead>
                    <TableHead className="font-accent text-xs uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="font-accent text-xs uppercase tracking-wider hidden sm:table-cell">
                      Data
                    </TableHead>
                    <TableHead className="font-accent text-xs uppercase tracking-wider w-[60px]">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item) => (
                    <TableRow key={item.id} className="group">
                      <TableCell>
                        <Checkbox
                          checked={selected.has(item.id)}
                          onCheckedChange={() => toggleOne(item.id)}
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {item.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {item.nome}
                          </p>
                          {item.email && (
                            <p className="text-xs text-muted-foreground md:hidden truncate">
                              {item.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
                          {item.email || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className={`text-sm font-semibold ${getScoreColor(item.mediaGeral)}`}>
                          {item.mediaGeral.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {item.pilarMaisFraco} — {pillarNames[item.pilarMaisFraco]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] text-white ${statusColors[item.status]}`}
                        >
                          {statusLabels[item.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {formatDateShort(item.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/diagnosticos/${item.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data && data.total > pageSize && (
            <>
              <Separator />
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Página {page} de {totalPages} ({data.total} registros)
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
