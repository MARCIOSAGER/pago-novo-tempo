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
  Upload,
  Loader2,
} from "lucide-react";
import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { SiteImageKey } from "@/hooks/useSiteImages";

interface MediaItem {
  name: string;
  description: string;
  url: string;
  thumbnail?: string;
  category: string;
  dimensions?: string;
  settingsKey?: SiteImageKey;
}

const logos: MediaItem[] = [
  {
    name: "Logo P.A.G.O — Branco",
    description: "Logo principal em fundo transparente, versão branca para fundos escuros.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-logo-white-5ULVBxzBhJzXMoTJVXNLbQ.webp",
    category: "logo",
    dimensions: "512×512",
  },
  {
    name: "Logo P.A.G.O — Circular",
    description: "Logo circular para uso em avatares, perfis de redes sociais e favicon.",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-logo-circle-hSRNNRjjkpHjSKMfuEKkpH.webp",
    category: "logo",
    dimensions: "512×512",
  },
];

const pillarImages: MediaItem[] = [
  {
    name: "Pilar — Princípio",
    description: "Imagem do pilar Princípio na landing page.",
    url: "/images/pillars/principles.webp",
    category: "pilar",
    settingsKey: "image.pillar.principles",
  },
  {
    name: "Pilar — Alinhamento",
    description: "Imagem do pilar Alinhamento na landing page.",
    url: "/images/pillars/alignment.webp",
    category: "pilar",
    settingsKey: "image.pillar.alignment",
  },
  {
    name: "Pilar — Governo",
    description: "Imagem do pilar Governo na landing page.",
    url: "/images/pillars/government.webp",
    category: "pilar",
    settingsKey: "image.pillar.government",
  },
  {
    name: "Pilar — Obediência",
    description: "Imagem do pilar Obediência na landing page.",
    url: "/images/pillars/obedience.webp",
    category: "pilar",
    settingsKey: "image.pillar.obedience",
  },
];

const siteImages: MediaItem[] = [
  {
    name: "Hero Background",
    description: "Imagem de fundo da seção hero da landing page.",
    url: "/images/pillars/hero-bg.png",
    category: "site",
    settingsKey: "image.hero.background",
  },
  {
    name: "Jefferson Evangelista",
    description: "Foto do fundador na landing page e página /fundador.",
    url: "/images/jefferson.png",
    category: "site",
    settingsKey: "image.founder.jefferson",
  },
];

const brandColors = [
  { name: "Navy", hex: "#1A2744", usage: "Fundo principal, textos" },
  { name: "Warm White", hex: "#FAFAF8", usage: "Fundo claro, textos em fundo escuro" },
  { name: "Sand", hex: "#E8E0D4", usage: "Backgrounds alternados, cards" },
  { name: "Gold", hex: "#B8A88A", usage: "Destaques, bordas, ícones" },
  { name: "Gold Light", hex: "#D4C5A9", usage: "Textos de destaque em fundo escuro" },
];

function MediaCard({ item, dynamicUrl, onUploaded }: { item: MediaItem; dynamicUrl?: string; onUploaded?: () => void }) {
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateImage = trpc.siteSettings.updateImage.useMutation();

  const displayUrl = dynamicUrl || item.url;

  const copyUrl = () => {
    navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !item.settingsKey) return;

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      await updateImage.mutateAsync({
        key: item.settingsKey,
        filename: file.name,
        mimeType: file.type,
        data: base64,
      });

      onUploaded?.();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="border-border/50 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-muted relative overflow-hidden">
        <img
          src={displayUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {uploading && (
          <div className="absolute inset-0 bg-navy/60 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-warm-white animate-spin" />
          </div>
        )}
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
          {item.settingsKey && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                size="sm"
                variant="default"
                className="h-7 gap-1.5 text-xs font-accent flex-1 bg-gold text-navy hover:bg-gold-light"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3" />
                )}
                {uploading ? "Enviando..." : "Alterar"}
              </Button>
            </>
          )}
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
            onClick={() => window.open(displayUrl, "_blank")}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminMediaRepo() {
  const { data: imageSettings, refetch } = trpc.siteSettings.getImages.useQuery(undefined, {
    staleTime: 0,
  });

  const getDynamicUrl = (key?: SiteImageKey) => {
    if (!key || !imageSettings) return undefined;
    return imageSettings[key] || undefined;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-display">
          Repositório de Mídia
        </h1>
        <p className="text-sm text-muted-foreground font-accent mt-1">
          Imagens, logos, cores e assets da marca P.A.G.O
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="pilares" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pilares" className="gap-1.5 font-accent text-xs">
            <BookOpen className="h-3.5 w-3.5" />
            Pilares
          </TabsTrigger>
          <TabsTrigger value="site" className="gap-1.5 font-accent text-xs">
            <ImageIcon className="h-3.5 w-3.5" />
            Site
          </TabsTrigger>
          <TabsTrigger value="logos" className="gap-1.5 font-accent text-xs">
            <Star className="h-3.5 w-3.5" />
            Logos
          </TabsTrigger>
          <TabsTrigger value="cores" className="gap-1.5 font-accent text-xs">
            <Palette className="h-3.5 w-3.5" />
            Cores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pilares">
          <div className="grid gap-4 md:grid-cols-2">
            {pillarImages.map((item) => (
              <MediaCard
                key={item.name}
                item={item}
                dynamicUrl={getDynamicUrl(item.settingsKey)}
                onUploaded={refetch}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="site">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {siteImages.map((item) => (
              <MediaCard
                key={item.name}
                item={item}
                dynamicUrl={getDynamicUrl(item.settingsKey)}
                onUploaded={refetch}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logos">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {logos.map((item) => (
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
