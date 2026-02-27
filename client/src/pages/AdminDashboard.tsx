import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Clock,
  UserCheck,
  UserX,
  MessageSquare,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

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

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  loading?: boolean;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-accent uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-semibold text-foreground font-accent">
                {value}
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: metrics, isLoading: metricsLoading } =
    trpc.mentoria.metrics.useQuery();
  const { data: recentData, isLoading: recentLoading } =
    trpc.mentoria.listFiltered.useQuery({
      page: 1,
      pageSize: 5,
    });

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
            Painel de Mentoria
          </h1>
          <p className="text-sm text-muted-foreground capitalize">{timestamp}</p>
        </div>
        <Link href="/admin/inscricoes">
          <Button variant="outline" size="sm" className="font-accent text-xs">
            Ver Todas as Inscrições
          </Button>
        </Link>
      </div>
      <Separator />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total de Inscrições"
          value={metrics?.total ?? 0}
          icon={Users}
          loading={metricsLoading}
        />
        <KpiCard
          title="Pendentes"
          value={metrics?.pending ?? 0}
          icon={Clock}
          description="Aguardando contato"
          loading={metricsLoading}
        />
        <KpiCard
          title="Inscritos"
          value={metrics?.enrolled ?? 0}
          icon={UserCheck}
          description="Confirmados na mentoria"
          loading={metricsLoading}
        />
        <KpiCard
          title="Rejeitados"
          value={metrics?.rejected ?? 0}
          icon={UserX}
          loading={metricsLoading}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Contatados"
          value={metrics?.contacted ?? 0}
          icon={MessageSquare}
          description="Em processo de contato"
          loading={metricsLoading}
        />
        <KpiCard
          title="Últimos 7 dias"
          value={metrics?.last7Days ?? 0}
          icon={TrendingUp}
          description="Novas inscrições"
          loading={metricsLoading}
        />
        <KpiCard
          title="Últimos 30 dias"
          value={metrics?.last30Days ?? 0}
          icon={CalendarDays}
          description="Novas inscrições"
          loading={metricsLoading}
        />
      </div>

      {/* Status Distribution */}
      {metrics && !metricsLoading && metrics.total > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
              {(["pending", "contacted", "enrolled", "rejected"] as const).map(
                (status) => {
                  const val = metrics[status];
                  const pct = metrics.total > 0 ? (val / metrics.total) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={status}
                      className={`${statusColors[status]} transition-all`}
                      style={{ width: `${pct}%` }}
                      title={`${statusLabels[status]}: ${val} (${pct.toFixed(0)}%)`}
                    />
                  );
                }
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {(["pending", "contacted", "enrolled", "rejected"] as const).map(
                (status) => (
                  <div key={status} className="flex items-center gap-2 text-xs">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${statusColors[status]}`}
                    />
                    <span className="text-muted-foreground">
                      {statusLabels[status]}:{" "}
                      <span className="font-medium text-foreground">
                        {metrics[status]}
                      </span>
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Inscriptions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
              Inscrições Recentes
            </CardTitle>
            <Link href="/admin/inscricoes">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                Ver todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !recentData?.items.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma inscrição recebida ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {recentData.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/inscricoes/${item.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] text-white ${statusColors[item.status]}`}
                    >
                      {statusLabels[item.status]}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
