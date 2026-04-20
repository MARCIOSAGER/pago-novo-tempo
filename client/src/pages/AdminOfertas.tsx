import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Save, Package, ImageOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
}

export default function AdminOfertas() {
  const { data, isLoading } = trpc.offers.listForDiagnostico.useQuery();
  const utils = trpc.useUtils();

  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    if (data) setOffers(data);
  }, [data]);

  const save = trpc.offers.save.useMutation({
    onSuccess: () => {
      toast.success("Ofertas salvas com sucesso!");
      utils.offers.listForDiagnostico.invalidate();
    },
    onError: (e) => {
      toast.error(e.message || "Erro ao salvar ofertas.");
    },
  });

  const updateOffer = (index: number, patch: Partial<Offer>) => {
    setOffers((curr) => curr.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  };

  const addOffer = () => {
    setOffers((curr) => [
      ...curr,
      {
        id: `produto-${Date.now()}`,
        title: "Nova oferta",
        description: "",
        imageUrl: "",
        ctaText: "Saber mais",
        ctaUrl: "",
      },
    ]);
  };

  const removeOffer = (index: number) => {
    if (offers.length <= 1) {
      toast.error("Deve haver pelo menos 1 oferta.");
      return;
    }
    setOffers((curr) => curr.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    for (const o of offers) {
      if (!o.title.trim() || !o.description.trim() || !o.ctaText.trim()) {
        toast.error("Preencha título, descrição e texto do botão em todas as ofertas.");
        return;
      }
    }
    save.mutate({ offers });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display">Ofertas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Produtos exibidos na landing depois que o usuário completa o diagnóstico.
            Deixe "URL do CTA" vazio para mostrar "Em breve".
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addOffer} className="gap-2" disabled={isLoading}>
            <Plus className="h-4 w-4" />
            Adicionar oferta
          </Button>
          <Button
            onClick={handleSave}
            disabled={save.isPending || isLoading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {save.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer, i) => (
            <Card key={offer.id} className="overflow-hidden">
              <CardHeader className="bg-muted/40 border-b">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs bg-background px-2 py-0.5 rounded border">
                      {offer.id}
                    </span>
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeOffer(i)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    aria-label="Remover oferta"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Image preview */}
                <div className="aspect-[4/3] bg-muted/50 border rounded flex items-center justify-center overflow-hidden">
                  {offer.imageUrl ? (
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <ImageOff className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`title-${i}`} className="text-xs">Título</Label>
                  <Input
                    id={`title-${i}`}
                    value={offer.title}
                    onChange={(e) => updateOffer(i, { title: e.target.value })}
                    maxLength={200}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`desc-${i}`} className="text-xs">Descrição</Label>
                  <Textarea
                    id={`desc-${i}`}
                    value={offer.description}
                    onChange={(e) => updateOffer(i, { description: e.target.value })}
                    rows={3}
                    maxLength={1000}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`img-${i}`} className="text-xs">URL da imagem</Label>
                  <Input
                    id={`img-${i}`}
                    value={offer.imageUrl}
                    onChange={(e) => updateOffer(i, { imageUrl: e.target.value })}
                    placeholder="https://... (cole URL do /admin/media)"
                    maxLength={2000}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`cta-text-${i}`} className="text-xs">Texto do botão</Label>
                  <Input
                    id={`cta-text-${i}`}
                    value={offer.ctaText}
                    onChange={(e) => updateOffer(i, { ctaText: e.target.value })}
                    maxLength={80}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`cta-url-${i}`} className="text-xs">
                    URL do botão <span className="text-muted-foreground">(vazio = "Em breve")</span>
                  </Label>
                  <Input
                    id={`cta-url-${i}`}
                    value={offer.ctaUrl}
                    onChange={(e) => updateOffer(i, { ctaUrl: e.target.value })}
                    placeholder="https://... ou /mentoria"
                    maxLength={2000}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
