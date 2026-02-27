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
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  all: "Todos",
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

export default function AdminInscricoes() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Debounce search
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

  const { data, isLoading } = trpc.mentoria.listFiltered.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: debouncedSearch || undefined,
    page,
    pageSize,
  });

  const { data: exportData, refetch: fetchExport } =
    trpc.mentoria.export.useQuery(undefined, { enabled: false });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const handleExportCSV = async () => {
    try {
      const result = await fetchExport();
      const items = result.data;
      if (!items || items.length === 0) {
        toast.error("Nenhum dado para exportar.");
        return;
      }

      const headers = ["ID", "Nome", "Email", "Telefone", "Mensagem", "Status", "Data de Inscrição"];
      const rows = items.map((item) => [
        item.id,
        `"${(item.name || "").replace(/"/g, '""')}"`,
        `"${(item.email || "").replace(/"/g, '""')}"`,
        `"${(item.phone || "").replace(/"/g, '""')}"`,
        `"${(item.message || "").replace(/"/g, '""')}"`,
        statusLabels[item.status] || item.status,
        formatDate(item.createdAt),
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inscricoes-pago-${new Date().toISOString().slice(0, 10)}.csv`;
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
            Inscrições de Mentoria
          </h1>
          <p className="text-sm text-muted-foreground capitalize">{timestamp}</p>
        </div>
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
      <Separator />

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
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
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="contacted">Contatado</SelectItem>
                  <SelectItem value="enrolled">Inscrito</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
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
                : `${data?.total ?? 0} inscrição(ões) encontrada(s)`}
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
                Nenhuma inscrição encontrada com os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-accent text-xs uppercase tracking-wider w-[50px]">
                      #
                    </TableHead>
                    <TableHead className="font-accent text-xs uppercase tracking-wider">
                      Nome
                    </TableHead>
                    <TableHead className="font-accent text-xs uppercase tracking-wider hidden md:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="font-accent text-xs uppercase tracking-wider hidden lg:table-cell">
                      Telefone
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
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {item.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground md:hidden truncate">
                            {item.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {item.email}
                        </p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <p className="text-sm text-muted-foreground">
                          {item.phone || "—"}
                        </p>
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
                        <Link href={`/admin/inscricoes/${item.id}`}>
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
