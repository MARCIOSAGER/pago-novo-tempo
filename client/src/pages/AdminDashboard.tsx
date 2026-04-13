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
  Building2,
  ClipboardList,
  KeyRound,
  UserPlus,
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
  iconBg,
  iconColor,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  loading?: boolean;
  iconBg?: string;
  iconColor?: string;
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
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg || "bg-primary/10"}`}>
            <Icon className={`h-4 w-4 ${iconColor || "text-primary"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: metrics, isLoading: metricsLoading } =
    trpc.mentoria.metrics.useQuery();
  const { data: corpMetrics, isLoading: corpLoading } =
    trpc.accessManagement.corporateMetrics.useQuery();
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
            Painel Administrativo
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

      {/* ─── Corporate Section ─── */}
      <div className="rounded-xl bg-gradient-to-r from-[#1A2744]/5 to-[#B8A88A]/5 border border-[#B8A88A]/15 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#B8A88A]" />
            <h2 className="text-lg font-semibold text-foreground font-display">Corporativo</h2>
          </div>
        <div className="flex gap-2">
          <Link href="/admin/acessos">
            <Button variant="outline" size="sm" className="font-accent text-xs">
              Gestao de Acessos
            </Button>
          </Link>
          <Link href="/admin/organizations">
            <Button variant="outline" size="sm" className="font-accent text-xs">
              Organizacoes
            </Button>
          </Link>
        </div>
      </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            title="Organizacoes"
            value={corpMetrics?.totalOrgs ?? 0}
            icon={Building2}
            iconBg="bg-indigo-500/10"
            iconColor="text-indigo-500"
            loading={corpLoading}
          />
          <KpiCard
            title="Membros Ativos"
            value={corpMetrics?.activeMembers ?? 0}
            icon={UserCheck}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-500"
            description={`${corpMetrics?.invitedMembers ?? 0} convidados`}
            loading={corpLoading}
          />
          <KpiCard
            title="Diagnosticos Corp."
            value={corpMetrics?.totalDiagnostics ?? 0}
            icon={ClipboardList}
            iconBg="bg-purple-500/10"
            iconColor="text-purple-500"
            loading={corpLoading}
          />
          <KpiCard
            title="Solicitacoes Pendentes"
            value={corpMetrics?.pendingRequests ?? 0}
            icon={Clock}
            iconBg="bg-amber-500/10"
            iconColor="text-amber-500"
            description="Aguardando aprovacao"
            loading={corpLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <KpiCard
            title="Total de Usuarios"
            value={corpMetrics?.totalUsers ?? 0}
            icon={Users}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-500"
            description="Todas as contas no sistema"
            loading={corpLoading}
          />
          <KpiCard
            title="Total de Membros"
            value={corpMetrics?.totalMembers ?? 0}
            icon={UserPlus}
            iconBg="bg-teal-500/10"
            iconColor="text-teal-500"
            description="Vinculados a organizacoes"
            loading={corpLoading}
          />
        </div>
      </div>

      {/* ─── Mentoria Section ─── */}
      <div className="rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/15 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-foreground font-display">Mentoria</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            title="Total de Inscricoes"
            value={metrics?.total ?? 0}
            icon={Users}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-500"
            loading={metricsLoading}
          />
          <KpiCard
            title="Pendentes"
            value={metrics?.pending ?? 0}
            icon={Clock}
            iconBg="bg-amber-500/10"
            iconColor="text-amber-500"
            description="Aguardando contato"
            loading={metricsLoading}
          />
          <KpiCard
            title="Inscritos"
            value={metrics?.enrolled ?? 0}
            icon={UserCheck}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-500"
            description="Confirmados na mentoria"
            loading={metricsLoading}
          />
          <KpiCard
            title="Rejeitados"
            value={metrics?.rejected ?? 0}
            icon={UserX}
            iconBg="bg-red-500/10"
            iconColor="text-red-500"
            loading={metricsLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <KpiCard
            title="Contatados"
            value={metrics?.contacted ?? 0}
            icon={MessageSquare}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-500"
            description="Em processo de contato"
            loading={metricsLoading}
          />
          <KpiCard
            title="Ultimos 7 dias"
            value={metrics?.last7Days ?? 0}
            icon={TrendingUp}
            iconBg="bg-green-500/10"
            iconColor="text-green-500"
            description="Novas inscricoes"
            loading={metricsLoading}
          />
          <KpiCard
            title="Ultimos 30 dias"
            value={metrics?.last30Days ?? 0}
            icon={CalendarDays}
            iconBg="bg-violet-500/10"
            iconColor="text-violet-500"
            description="Novas inscricoes"
            loading={metricsLoading}
          />
        </div>
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
