import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Monitor,
  Smartphone,
  Globe,
  FileText,
  Link2,
  Cpu,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────
type MetricItem = { x: string; y: number };
type PageviewItem = { x: string; y: number };
type StatField = { value: number; prev: number; change?: number };
type StatsData = {
  pageviews: StatField;
  visitors: StatField;
  visits: StatField;
  bounces: StatField;
  totaltime: StatField;
};

// ─── Period helpers ─────────────────────────────────────────────
const PERIODS: Record<string, { label: string; days: number }> = {
  "24h": { label: "Últimas 24h", days: 1 },
  "7d": { label: "Últimos 7 dias", days: 7 },
  "30d": { label: "Últimos 30 dias", days: 30 },
  "90d": { label: "Últimos 90 dias", days: 90 },
};

function getRange(days: number) {
  const endAt = Date.now();
  const startAt = endAt - days * 24 * 60 * 60 * 1000;
  return { startAt, endAt };
}

function pctChange(current: number, prev: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(prev)) return 0;
  if (prev === 0) return current > 0 ? 100 : 0;
  const result = Math.round(((current - prev) / prev) * 100);
  return Number.isFinite(result) ? result : 0;
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms)) return "0s";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function normalizeStat(raw: unknown): StatField {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    return {
      value: typeof obj.value === "number" ? obj.value : 0,
      prev: typeof obj.prev === "number" ? obj.prev : 0,
      change: typeof obj.change === "number" ? obj.change : undefined,
    };
  }
  return { value: 0, prev: 0 };
}

function getUnit(days: number): "hour" | "day" | "month" {
  if (days <= 1) return "hour";
  if (days <= 90) return "day";
  return "month";
}

// ─── Reusable Components ────────────────────────────────────────

function KpiCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
}) {
  const isPositive = change >= 0;
  return (
    <Card className="p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        <span
          className={`text-xs font-medium flex items-center gap-0.5 ${
            isPositive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isPositive ? "+" : ""}
          {change}%
        </span>
      </div>
    </Card>
  );
}

function BreakdownCard({
  title,
  icon: Icon,
  items,
  isLoading,
}: {
  title: string;
  icon: React.ElementType;
  items: MetricItem[];
  isLoading: boolean;
}) {
  const maxValue = items.length > 0 ? Math.max(...items.map((i) => i.y)) : 1;

  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">
          Sem dados no período
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
          {items.map((item, idx) => (
            <div key={idx} className="relative">
              <div
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{
                  width: `${Math.max((item.y / maxValue) * 100, 2)}%`,
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                }}
              />
              <div className="relative flex items-center justify-between px-2 py-1.5">
                <span
                  className="text-sm text-foreground truncate max-w-[75%]"
                  title={item.x || "(direto)"}
                >
                  {item.x || "(direto)"}
                </span>
                <span className="text-sm font-medium text-foreground ml-2 shrink-0">
                  {item.y.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function SimpleLineChart({
  data,
  isLoading,
}: {
  data: PageviewItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="p-5 flex items-center justify-center h-[250px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-5 flex items-center justify-center h-[250px]">
        <span className="text-sm text-muted-foreground">
          Sem dados no período
        </span>
      </Card>
    );
  }

  const maxY = Math.max(...data.map((d) => d.y), 1);
  const chartW = 900;
  const chartH = 180;
  const padL = 40;
  const padR = 20;
  const padT = 10;
  const padB = 30;
  const w = chartW - padL - padR;
  const h = chartH - padT - padB;

  const points = data.map((d, i) => {
    const x = padL + (i / Math.max(data.length - 1, 1)) * w;
    const y = padT + h - (d.y / maxY) * h;
    return { x, y, label: d.x, value: d.y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${padT + h} L${points[0].x},${padT + h} Z`;

  // Y-axis ticks
  const yTicks = [0, Math.round(maxY / 2), maxY];

  return (
    <Card className="p-5">
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto">
        {/* Grid lines */}
        {yTicks.map((tick) => {
          const y = padT + h - (tick / maxY) * h;
          return (
            <g key={tick}>
              <line
                x1={padL}
                x2={chartW - padR}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
              <text
                x={padL - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-gray-400"
                fontSize={9}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="rgba(234, 88, 12, 0.08)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#ea580c"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#ea580c" />
        ))}

        {/* X-axis labels (show ~5 labels max) */}
        {points
          .filter(
            (_, i) =>
              i === 0 ||
              i === points.length - 1 ||
              i % Math.max(1, Math.floor(points.length / 5)) === 0
          )
          .map((p, i) => {
            const dateStr = new Date(p.label).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            });
            return (
              <text
                key={i}
                x={p.x}
                y={padT + h + 18}
                textAnchor="middle"
                className="fill-gray-400"
                fontSize={9}
              >
                {dateStr}
              </text>
            );
          })}
      </svg>
    </Card>
  );
}

// ─── Main Page ──────────────────────────────────────────────────

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("7d");
  const range = useMemo(() => getRange(PERIODS[period].days), [period]);
  const unit = getUnit(PERIODS[period].days);

  const utils = trpc.useUtils();

  const statsQ = trpc.analytics.stats.useQuery(range);
  const activeQ = trpc.analytics.active.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const pageviewsQ = trpc.analytics.pageviews.useQuery({
    ...range,
    unit,
    timezone: "Africa/Luanda",
  });

  const pathQ = trpc.analytics.metrics.useQuery({ ...range, type: "path", limit: 10 });
  const countryQ = trpc.analytics.metrics.useQuery({ ...range, type: "country", limit: 10 });
  const osQ = trpc.analytics.metrics.useQuery({ ...range, type: "os", limit: 10 });
  const referrerQ = trpc.analytics.metrics.useQuery({ ...range, type: "referrer", limit: 10 });
  const deviceQ = trpc.analytics.metrics.useQuery({ ...range, type: "device", limit: 10 });
  const browserQ = trpc.analytics.metrics.useQuery({ ...range, type: "browser", limit: 10 });

  const rawStats = statsQ.data as Record<string, unknown> | undefined;
  const stats: StatsData | undefined = rawStats
    ? {
        pageviews: normalizeStat(rawStats.pageviews),
        visitors: normalizeStat(rawStats.visitors),
        visits: normalizeStat(rawStats.visits),
        bounces: normalizeStat(rawStats.bounces),
        totaltime: normalizeStat(rawStats.totaltime),
      }
    : undefined;
  const activeVisitors = (activeQ.data as { x: number } | undefined)?.x ?? 0;
  const pageviewsData = (
    pageviewsQ.data as { pageviews: PageviewItem[] } | undefined
  )?.pageviews ?? [];

  const isRefreshing = statsQ.isFetching || pageviewsQ.isFetching;

  function handleRefresh() {
    utils.analytics.stats.invalidate();
    utils.analytics.active.invalidate();
    utils.analytics.pageviews.invalidate();
    utils.analytics.metrics.invalidate();
  }

  const now = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Luanda",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Análises</h1>
          <p className="text-sm text-muted-foreground">{now}</p>
        </div>
        <div className="flex items-center gap-3">
          {activeVisitors > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-600 font-medium">
                {activeVisitors} ao vivo
              </span>
            </div>
          )}
        </div>
      </div>

      <hr className="border-border" />

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PERIODS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error state */}
      {statsQ.isError && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              Erro ao carregar analytics. Verifique se o endpoint está configurado.
            </span>
          </div>
        </Card>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Visitas"
          value={stats?.visits?.value?.toLocaleString("pt-BR") ?? "—"}
          change={stats ? pctChange(stats.visits.value, stats.visits.prev) : 0}
          icon={Eye}
        />
        <KpiCard
          label="Visitantes Únicos"
          value={stats?.visitors?.value?.toLocaleString("pt-BR") ?? "—"}
          change={
            stats ? pctChange(stats.visitors.value, stats.visitors.prev) : 0
          }
          icon={Users}
        />
        <KpiCard
          label="Pageviews"
          value={stats?.pageviews?.value?.toLocaleString("pt-BR") ?? "—"}
          change={
            stats ? pctChange(stats.pageviews.value, stats.pageviews.prev) : 0
          }
          icon={FileText}
        />
        <KpiCard
          label="Duração Média"
          value={
            stats
              ? formatDuration(
                  stats.totaltime.value /
                    Math.max(stats.pageviews.value, 1)
                )
              : "—"
          }
          change={
            stats
              ? pctChange(stats.totaltime.value, stats.totaltime.prev)
              : 0
          }
          icon={Clock}
        />
      </div>

      {/* Chart */}
      <SimpleLineChart data={pageviewsData} isLoading={pageviewsQ.isLoading} />

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BreakdownCard
          title="Tráfego por Página"
          icon={FileText}
          items={(pathQ.data as MetricItem[]) ?? []}
          isLoading={pathQ.isLoading}
        />
        <BreakdownCard
          title="País"
          icon={Globe}
          items={(countryQ.data as MetricItem[]) ?? []}
          isLoading={countryQ.isLoading}
        />
        <BreakdownCard
          title="Sistema Operacional"
          icon={Cpu}
          items={(osQ.data as MetricItem[]) ?? []}
          isLoading={osQ.isLoading}
        />
        <BreakdownCard
          title="Referência"
          icon={Link2}
          items={(referrerQ.data as MetricItem[]) ?? []}
          isLoading={referrerQ.isLoading}
        />
        <BreakdownCard
          title="Dispositivos"
          icon={Smartphone}
          items={(deviceQ.data as MetricItem[]) ?? []}
          isLoading={deviceQ.isLoading}
        />
        <BreakdownCard
          title="Navegador"
          icon={Monitor}
          items={(browserQ.data as MetricItem[]) ?? []}
          isLoading={browserQ.isLoading}
        />
      </div>

      {/* Umami Full Dashboard */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Dashboard Completo</h3>
          <a
            href="https://analytics.pago.life"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Abrir Umami ↗
          </a>
        </div>
        <iframe
          src="https://analytics.pago.life/share/LjFnyTlXkZ7TA0Ur"
          className="w-full border-0"
          style={{ height: "2000px" }}
          title="Umami Analytics Dashboard"
        />
      </Card>
    </div>
  );
}
