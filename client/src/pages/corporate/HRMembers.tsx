import { useState } from "react";
import { useCorporate } from "@/contexts/CorporateContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, Users } from "lucide-react";

const statusLabels: Record<string, string> = {
  invited: "Convidado",
  active: "Ativo",
  deactivated: "Desativado",
};

const statusColors: Record<string, string> = {
  invited: "bg-amber-500",
  active: "bg-emerald-500",
  deactivated: "bg-red-500",
};

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  hr_admin: "Admin RH",
  hr_viewer: "Visualizador",
  employee: "Colaborador",
};

export default function HRMembers() {
  const { orgId, orgName } = useCorporate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.corporate.listMembers.useQuery({
    orgId,
    search: search || undefined,
    page,
    pageSize: 20,
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Membros</h1>
        <p className="text-muted-foreground text-sm">{orgName} — {data?.total ?? 0} membros</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nome ou email..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : !data?.items.length ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum membro encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Função</th>
                <th className="text-left p-3 font-medium">Departamento</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((member) => (
                <tr key={member.id} className="border-t">
                  <td className="p-3 font-medium">{member.name || "—"}</td>
                  <td className="p-3 text-muted-foreground">{member.email}</td>
                  <td className="p-3">{roleLabels[member.role] ?? member.role}</td>
                  <td className="p-3 text-muted-foreground">{member.department || "—"}</td>
                  <td className="p-3">
                    <Badge className={statusColors[member.status] ?? "bg-gray-500"}>
                      {statusLabels[member.status] ?? member.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-3 border-t">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
              <span className="text-sm text-muted-foreground self-center">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
