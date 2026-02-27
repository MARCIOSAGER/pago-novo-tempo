import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image as ImageIcon,
  Copy,
  ExternalLink,
  Check,
  Palette,
  Star,
  BookOpen,
} from "lucide-react";
import { useState } from "react";

interface MediaItem {
  name: string;
  description: string;
  url: string;
  thumbnail?: string;
  category: string;
  dimensions?: string;
}

const logos: MediaItem[] = [
  {
    name: "Logo P.A.G.O. — Branco",
    description: "Logo principal em fundo transparente, versão branca para fundos escuros.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-logo-white-5ULVBxzBhJzXMoTJVXNLbQ.webp",
    category: "logo",
    dimensions: "512×512",
  },
  {
    name: "Logo P.A.G.O. — Circular",
    description: "Logo circular para uso em avatares, perfis de redes sociais e favicon.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-logo-circle-hSRNNRjjkpHjSKMfuEKkpH.webp",
    category: "logo",
    dimensions: "512×512",
  },
];

const pillarImages: MediaItem[] = [
  {
    name: "Pilar — Princípio",
    description: "Imagem do pilar Princípio: livro antigo aberto com luz dourada.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pillar-principles-HDhT4DKjE38mG8ZkecmGd4.webp",
    category: "pilar",
  },
  {
    name: "Pilar — Alinhamento",
    description: "Imagem do pilar Alinhamento: bússola e mapa em mesa de madeira.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pillar-alignment-8YXRToADNaAGsGXCjL5Bc7.webp",
    category: "pilar",
  },
  {
    name: "Pilar — Governo",
    description: "Imagem do pilar Governo: escritório executivo com Bíblia e livros clássicos.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pillar-governo-new-RzVSXAyWeKmPtBV6tXgtTv.webp",
    category: "pilar",
  },
  {
    name: "Pilar — Obediência",
    description: "Imagem do pilar Obediência: caminho de pedra em jardim de oliveiras ao nascer do sol.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pillar-obediencia-new-kerqTpabe9CesvsDAfEFFS.webp",
    category: "pilar",
  },
];

const siteImages: MediaItem[] = [
  {
    name: "Hero Background",
    description: "Imagem de fundo da seção hero da landing page.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/hero-bg-fyJtxWkcWj2UeE7kR85wJt.webp",
    category: "site",
  },
  {
    name: "Pilar Governo — Landing Page",
    description: "Versão da imagem de Governo usada na seção de pilares da landing page.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pillar-governo-new-RzVSXAyWeKmPtBV6tXgtTv.webp",
    category: "site",
  },
  {
    name: "Pilar Obediência — Landing Page",
    description: "Versão da imagem de Obediência usada na seção de pilares da landing page.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pillar-obedience-f5zof3JxmnB8U7Po4wBCp3.webp",
    category: "site",
  },
];

const brandColors = [
  { name: "Navy", hex: "#1A2744", usage: "Fundo principal, textos" },
  { name: "Warm White", hex: "#FAFAF8", usage: "Fundo claro, textos em fundo escuro" },
  { name: "Sand", hex: "#E8E0D4", usage: "Backgrounds alternados, cards" },
  { name: "Gold", hex: "#B8A88A", usage: "Destaques, bordas, ícones" },
  { name: "Gold Light", hex: "#D4C5A9", usage: "Textos de destaque em fundo escuro" },
];

function MediaCard({ item }: { item: MediaItem }) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border/50 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-muted relative overflow-hidden">
        <img
          src={item.url}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm font-display mb-1">{item.name}</h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {item.description}
        </p>
        {item.dimensions && (
          <span className="text-[10px] font-accent uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded mb-3 inline-block">
            {item.dimensions}
          </span>
        )}
        <div className="flex items-center gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 text-xs font-accent flex-1"
            onClick={copyUrl}
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Copiado!" : "Copiar URL"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 text-xs font-accent"
            onClick={() => window.open(item.url, "_blank")}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminMediaRepo() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-display">
          Repositório de Mídia
        </h1>
        <p className="text-sm text-muted-foreground font-accent mt-1">
          Imagens, logos, cores e assets da marca P.A.G.O.
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="logos" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="logos" className="gap-1.5 font-accent text-xs">
            <Star className="h-3.5 w-3.5" />
            Logos
          </TabsTrigger>
          <TabsTrigger value="pilares" className="gap-1.5 font-accent text-xs">
            <BookOpen className="h-3.5 w-3.5" />
            Pilares
          </TabsTrigger>
          <TabsTrigger value="site" className="gap-1.5 font-accent text-xs">
            <ImageIcon className="h-3.5 w-3.5" />
            Site
          </TabsTrigger>
          <TabsTrigger value="cores" className="gap-1.5 font-accent text-xs">
            <Palette className="h-3.5 w-3.5" />
            Cores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logos">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {logos.map((item) => (
              <MediaCard key={item.name} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pilares">
          <div className="grid gap-4 md:grid-cols-2">
            {pillarImages.map((item) => (
              <MediaCard key={item.name} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="site">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {siteImages.map((item) => (
              <MediaCard key={item.name} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cores">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-accent uppercase tracking-wider text-muted-foreground">
                Paleta de Cores da Marca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {brandColors.map((color) => (
                  <ColorCard key={color.hex} color={color} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ColorCard({
  color,
}: {
  color: { name: string; hex: string; usage: string };
}) {
  const [copied, setCopied] = useState(false);

  const copyHex = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLight =
    color.hex === "#FAFAF8" || color.hex === "#E8E0D4" || color.hex === "#D4C5A9";

  return (
    <div
      className="rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:shadow-md transition-shadow"
      onClick={copyHex}
    >
      <div
        className="h-20 flex items-end p-3"
        style={{ backgroundColor: color.hex }}
      >
        <span
          className="text-xs font-mono font-semibold"
          style={{ color: isLight ? "#1A2744" : "#FAFAF8" }}
        >
          {color.hex}
        </span>
      </div>
      <div className="p-3 bg-background">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold font-display">{color.name}</span>
          {copied && (
            <Badge variant="outline" className="text-[10px]">
              <Check className="h-3 w-3 mr-1 text-emerald-500" />
              Copiado
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{color.usage}</p>
      </div>
    </div>
  );
}
