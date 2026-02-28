import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  BookOpen,
  Smartphone,
  Monitor,
  Printer,
  ExternalLink,
} from "lucide-react";

interface DownloadItem {
  title: string;
  description: string;
  format: string;
  size: string;
  icon: React.ElementType;
  url: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline";
}

const ebookDownloads: DownloadItem[] = [
  {
    title: "PDF — Leitura Digital",
    description:
      "Versão otimizada para leitura em computador, tablet ou celular. 55 páginas com formatação editorial completa.",
    format: "PDF",
    size: "11.3 MB",
    icon: FileText,
    url: "/api/downloads/ebook-pdf",
    badge: "Recomendado",
    badgeVariant: "default",
  },
  {
    title: "PDF — Alta Qualidade (Gráfica)",
    description:
      "Versão de alta resolução para impressão profissional em gráfica. Ideal para produção de cópias físicas.",
    format: "PDF",
    size: "11.3 MB",
    icon: Printer,
    url: "/api/downloads/ebook-pdf-grafica",
    badge: "Impressão",
    badgeVariant: "secondary",
  },
  {
    title: "EPUB — Apple Books",
    description:
      "Formato universal para e-readers. Compatível com Apple Books, Kobo, e outros leitores de ebooks.",
    format: "EPUB",
    size: "54 KB",
    icon: BookOpen,
    url: "/api/downloads/ebook-epub",
  },
  {
    title: "MOBI — Kindle",
    description:
      "Formato nativo do Amazon Kindle. Envie para o Kindle via email (Send to Kindle) ou transfira via USB.",
    format: "MOBI",
    size: "115 KB",
    icon: Smartphone,
    url: "/api/downloads/ebook-mobi",
  },
  {
    title: "Flipbook HTML5 — Interativo",
    description:
      "Versão interativa com efeito de virar páginas. Funciona no navegador — ideal para compartilhar via link.",
    format: "HTML5",
    size: "46 KB",
    icon: Monitor,
    url: "/api/downloads/ebook-flipbook",
    badge: "Novo",
    badgeVariant: "outline",
  },
  {
    title: "HTML — Versão Web",
    description:
      "Versão completa em HTML com todos os estilos. Pode ser aberta diretamente no navegador.",
    format: "HTML",
    size: "80 KB",
    icon: ExternalLink,
    url: "/api/downloads/ebook-html",
  },
];

function DownloadCard({ item }: { item: DownloadItem }) {
  const Icon = item.icon;

  return (
    <Card className="border-border/50 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm font-display truncate">
                {item.title}
              </h3>
              {item.badge && (
                <Badge variant={item.badgeVariant || "default"} className="text-[10px] shrink-0">
                  {item.badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {item.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-accent uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {item.format}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {item.size}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs font-accent"
                onClick={() => window.open(item.url, "_blank")}
              >
                <Download className="h-3.5 w-3.5" />
                Baixar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDownloads() {
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display">
            Downloads
          </h1>
          <p className="text-sm text-muted-foreground font-accent mt-1">
            Ebook P.A.G.O — Edição Expandida 2025
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-accent">
          Atualizado em {currentDate}
        </span>
      </div>

      <Separator />

      {/* Version info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold font-display">
                P.A.G.O — Princípio · Alinhamento · Governo · Obediência
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Versão 2.0 · 55 páginas · 4 capítulos · Exercícios práticos ·
                Plano de 21 dias · Glossário · Índice de versículos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Downloads grid */}
      <div>
        <h2 className="text-sm font-semibold font-accent uppercase tracking-wider text-muted-foreground mb-4">
          Formatos Disponíveis
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {ebookDownloads.map((item) => (
            <DownloadCard key={item.format + item.title} item={item} />
          ))}
        </div>
      </div>

      {/* Usage guide */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
            Guia de Uso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-semibold font-accent mb-1">
                Para Leitura Digital
              </p>
              <p className="text-xs text-muted-foreground">
                Use o PDF ou o Flipbook HTML5 para ler no computador ou tablet.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-semibold font-accent mb-1">
                Para E-Readers
              </p>
              <p className="text-xs text-muted-foreground">
                EPUB para Apple Books/Kobo. MOBI para Kindle (envie via Send to
                Kindle).
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-semibold font-accent mb-1">
                Para Impressão
              </p>
              <p className="text-xs text-muted-foreground">
                Use o PDF de Alta Qualidade para enviar à gráfica. Formato A4
                com sangria.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
