import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  ExternalLink,
  CheckCircle2,
  Globe,
  Eye,
  Users,
  FileText,
  Clock,
  Smartphone,
  Monitor,
  Info,
} from "lucide-react";

const UMAMI_DASHBOARD_URL = "https://manus-analytics.com";

const TRACKING_FEATURES = [
  {
    icon: Eye,
    title: "Visitas e Pageviews",
    description: "Total de visitas, pageviews e sessões únicas rastreadas automaticamente.",
  },
  {
    icon: Users,
    title: "Visitantes Únicos",
    description: "Contagem de visitantes únicos por período, sem cookies invasivos.",
  },
  {
    icon: Globe,
    title: "Geolocalização",
    description: "País e região de origem dos visitantes do site.",
  },
  {
    icon: FileText,
    title: "Páginas Populares",
    description: "Ranking das páginas mais visitadas e tempo de permanência.",
  },
  {
    icon: Smartphone,
    title: "Dispositivos",
    description: "Breakdown por tipo de dispositivo (desktop, mobile, tablet).",
  },
  {
    icon: Monitor,
    title: "Navegadores e OS",
    description: "Distribuição por navegador e sistema operacional.",
  },
  {
    icon: Clock,
    title: "Duração da Sessão",
    description: "Tempo médio de permanência e taxa de rejeição.",
  },
  {
    icon: BarChart3,
    title: "Referências",
    description: "De onde vêm os visitantes — links diretos, redes sociais, buscadores.",
  },
];

export default function AdminAnalytics() {
  const now = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Análises</h1>
          <p className="text-sm text-muted-foreground">{now}</p>
        </div>
      </div>

      <hr className="border-border" />

      {/* Status Card — Tracking Active */}
      <Card className="p-6 border-emerald-200 bg-emerald-50/50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-emerald-900 mb-1">
              Rastreamento Ativo
            </h2>
            <p className="text-sm text-emerald-700 leading-relaxed mb-4">
              O script de analytics do Umami está instalado e coletando dados de tráfego do site
              P.A.G.O. em tempo real. Todos os dados de visitas, pageviews, dispositivos e
              geolocalização estão sendo registrados automaticamente.
            </p>
            <a
              href={UMAMI_DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Painel Umami
              </Button>
            </a>
          </div>
        </div>
      </Card>

      {/* Info Card — How to access */}
      <Card className="p-6 border-blue-200 bg-blue-50/50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-blue-900 mb-1">
              Como acessar os dados
            </h2>
            <p className="text-sm text-blue-700 leading-relaxed mb-3">
              Os dados de analytics são acessados diretamente pelo painel do Umami. Você também
              pode visualizar as métricas no <strong>Dashboard</strong> do Management UI
              (painel lateral direito), que exibe dados de UV/PV do site publicado.
            </p>
            <div className="bg-blue-100/60 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-medium mb-2">Acesso rápido:</p>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>
                  Clique no botão <strong>"Abrir Painel Umami"</strong> acima para acessar o dashboard completo
                </li>
                <li>
                  Ou acesse o <strong>Dashboard</strong> no Management UI (ícone no canto superior) para ver UV/PV
                </li>
                <li>
                  O domínio monitorado é: <code className="bg-blue-200/60 px-1.5 py-0.5 rounded text-xs font-mono">pagoplatform.manus.space</code>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </Card>

      {/* Tracking Features Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Métricas Coletadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRACKING_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Technical Details */}
      <Card className="p-5 bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Detalhes Técnicos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Provedor</span>
            <span className="font-medium text-foreground">Umami Analytics</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Endpoint</span>
            <span className="font-medium text-foreground font-mono text-xs">manus-analytics.com</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Privacidade</span>
            <span className="font-medium text-foreground">LGPD/GDPR Compliant</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cookies</span>
            <span className="font-medium text-foreground">Cookieless tracking</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-emerald-600 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Ativo
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Domínio</span>
            <span className="font-medium text-foreground font-mono text-xs">pagoplatform.manus.space</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
