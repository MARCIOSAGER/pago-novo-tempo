import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  BookOpen,
  Palette,
  Calendar,
  Heart,
  Image as ImageIcon,
  ExternalLink,
  Users,
  Star,
  Globe,
} from "lucide-react";

// ─── Kids Ebook Downloads ────────────────────────────────────
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

const kidsDownloads: DownloadItem[] = [
  {
    title: "PDF — Versão Ilustrada (PT)",
    description:
      "Ebook completo com 8 capítulos, 12 atividades, ilustrações coloridas e design infantil. 39 páginas.",
    format: "PDF",
    size: "56 MB",
    icon: FileText,
    url: "/api/downloads/ebook-kids-pdf",
    badge: "Principal",
    badgeVariant: "default",
  },
  {
    title: "Markdown — Conteúdo PT",
    description:
      "Conteúdo textual completo em Português para importar em ferramentas de diagramação (Canva, Atticus, InDesign).",
    format: "MD",
    size: "35 KB",
    icon: FileText,
    url: "#",
    badge: "Editável",
    badgeVariant: "secondary",
  },
  {
    title: "Markdown — Conteúdo ES",
    description:
      "Conteúdo textual completo em Espanhol para importar em ferramentas de diagramação.",
    format: "MD",
    size: "25 KB",
    icon: Globe,
    url: "#",
    badge: "Espanhol",
    badgeVariant: "outline",
  },
];

// ─── Illustrations ───────────────────────────────────────────
interface Illustration {
  title: string;
  description: string;
  url: string;
  chapter: string;
}

const illustrations: Illustration[] = [
  {
    title: "Capa — Crianças Construindo",
    description: "Três crianças construindo uma casa com blocos P.A.G.O. sobre a rocha.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-kids-cover-YXFafqXyCNBnqLPKUrfJyB.png",
    chapter: "Capa",
  },
  {
    title: "Os Dois Construtores",
    description: "Duas casas: uma na rocha firme, outra na areia — parábola de Mateus 7:24-27.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-kids-ch1-builders-YA5WrSMQaqx6SoHwYspcQM.png",
    chapter: "Cap. 1",
  },
  {
    title: "Daniel e a Comida do Rei",
    description: "Daniel recusando a comida do rei, escolhendo seguir seus princípios.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-kids-ch2-daniel-7y6M4xTRiBLh8aTbqVJzPa.png",
    chapter: "Cap. 2",
  },
  {
    title: "Noé e a Arca",
    description: "Noé construindo a arca com animais ao redor — obediência e alinhamento.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-kids-ch3-noah-FNP7LjziRUZjAZgD6u4bba.png",
    chapter: "Cap. 3",
  },
  {
    title: "Navio com Bandeiras P.A.G.O.",
    description: "Navio navegando com bandeiras dos 4 pilares — governo e direção.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-kids-ch4-ship-8CZgvngTa28Tg79fAXBxZo.png",
    chapter: "Cap. 4",
  },
  {
    title: "Davi e Golias",
    description: "Davi enfrentando Golias com coragem — obediência e confiança em Deus.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-kids-ch5-david-ZyaG6ACBHyHVFeVWJ3nkeD.png",
    chapter: "Cap. 5",
  },
  {
    title: "Casa Completa com 4 Pilares",
    description: "Casa colorida com os 4 pilares P.A.G.O. — integração final.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-kids-ch6-house-jvqcdRzsdVKSQveo947cpe.png",
    chapter: "Cap. 6",
  },
  {
    title: "Mapa da Missão 7 Dias",
    description: "Mapa de aventura com 7 pontos — desafio semanal em família.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-kids-ch7-mission-mQHHDJ5szUEpsey9XNcCdP.png",
    chapter: "Cap. 7",
  },
];

// ─── Stats ───────────────────────────────────────────────────
const stats = [
  { icon: BookOpen, label: "Capítulos", value: "8", color: "text-[#118AB2]" },
  { icon: Palette, label: "Atividades", value: "12", color: "text-[#EF476F]" },
  { icon: Calendar, label: "Desafio", value: "7 dias", color: "text-[#06D6A0]" },
  { icon: Users, label: "Faixa Etária", value: "6–12 anos", color: "text-[#FFD166]" },
  { icon: ImageIcon, label: "Ilustrações", value: "8", color: "text-[#8B5CF6]" },
  { icon: Star, label: "Idiomas", value: "PT / ES", color: "text-[#F59E0B]" },
];

function DownloadCard({ item }: { item: DownloadItem }) {
  const Icon = item.icon;
  return (
    <Card className="border-border/50 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-[#EF476F]/10 flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-[#EF476F]" />
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
              {item.url !== "#" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs font-accent"
                  onClick={() => window.open(item.url, "_blank")}
                >
                  <Download className="h-3.5 w-3.5" />
                  Baixar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminKids() {
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
            P.A.G.O. Kids
          </h1>
          <p className="text-sm text-muted-foreground font-accent mt-1">
            Ebook infantil — Edição Ilustrada 2025
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-accent">
          Atualizado em {currentDate}
        </span>
      </div>

      <Separator />

      {/* Version info */}
      <Card className="border-[#EF476F]/20 bg-[#EF476F]/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-[#EF476F]" />
            <div>
              <p className="text-sm font-semibold font-display">
                P.A.G.O. Kids — Princípio · Alinhamento · Governo · Obediência para Crianças
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Versão 1.0 · 39 páginas · 8 capítulos · 12 atividades · Desafio 7 dias · Glossário · Versículos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4 text-center">
                <Icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                <p className="text-lg font-bold font-display">{stat.value}</p>
                <p className="text-[10px] font-accent uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Downloads */}
      <div>
        <h2 className="text-sm font-semibold font-accent uppercase tracking-wider text-muted-foreground mb-4">
          Formatos Disponíveis
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kidsDownloads.map((item) => (
            <DownloadCard key={item.format + item.title} item={item} />
          ))}
        </div>
      </div>

      {/* Illustrations Gallery */}
      <div>
        <h2 className="text-sm font-semibold font-accent uppercase tracking-wider text-muted-foreground mb-4">
          Galeria de Ilustrações ({illustrations.length} imagens)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {illustrations.map((illust) => (
            <Card key={illust.title} className="border-border/50 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-square overflow-hidden bg-muted relative">
                <img
                  src={illust.url}
                  alt={illust.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-2 left-2 text-[9px]" variant="secondary">
                  {illust.chapter}
                </Badge>
              </div>
              <CardContent className="p-3">
                <h3 className="font-display text-xs font-semibold truncate mb-1">
                  {illust.title}
                </h3>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  {illust.description}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-[10px] font-accent mt-2 w-full"
                  onClick={() => window.open(illust.url, "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                  Abrir Original
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Content Structure */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
            Estrutura do Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              { ch: "Cap. 1", title: "Os Dois Construtores", desc: "Parábola da casa na rocha — fundamentos importam" },
              { ch: "Cap. 2", title: "Princípio", desc: "Daniel e a comida do rei — escolhas certas" },
              { ch: "Cap. 3", title: "Alinhamento", desc: "Noé e a arca — obedecer mesmo sem entender" },
              { ch: "Cap. 4", title: "Governo", desc: "José no Egito — cuidar do que recebemos" },
              { ch: "Cap. 5", title: "Obediência", desc: "Davi e Golias — coragem para obedecer" },
              { ch: "Cap. 6", title: "Integração", desc: "A casa completa — os 4 pilares juntos" },
              { ch: "Cap. 7", title: "Desafio 7 Dias", desc: "Missões diárias em família" },
              { ch: "Cap. 8", title: "Declaração", desc: "Compromisso pessoal da criança" },
            ].map((ch) => (
              <div key={ch.ch} className="p-3 rounded-lg bg-muted/50">
                <Badge variant="outline" className="text-[9px] mb-2">{ch.ch}</Badge>
                <p className="text-xs font-semibold font-display mb-1">{ch.title}</p>
                <p className="text-[10px] text-muted-foreground">{ch.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
