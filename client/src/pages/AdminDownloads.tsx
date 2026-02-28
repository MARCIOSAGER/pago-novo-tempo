import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Plus,
  Pencil,
  Trash2,
  Upload,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────

interface DownloadFormData {
  slug: string;
  title: string;
  description: string;
  format: string;
  fileSize: string;
  url: string;
  filename: string;
  category: string;
  badge: string;
  badgeVariant: string;
  sortOrder: number;
  active: "yes" | "no";
}

const emptyForm: DownloadFormData = {
  slug: "",
  title: "",
  description: "",
  format: "",
  fileSize: "",
  url: "",
  filename: "",
  category: "ebook",
  badge: "",
  badgeVariant: "",
  sortOrder: 0,
  active: "yes",
};

const CATEGORIES = [
  { value: "ebook", label: "Ebook P.A.G.O." },
  { value: "kids", label: "P.A.G.O. Kids" },
  { value: "material", label: "Material de Apoio" },
  { value: "other", label: "Outros" },
];

const FORMATS = ["PDF", "EPUB", "MOBI", "HTML", "HTML5", "MD", "DOC", "ZIP"];

const BADGE_VARIANTS = [
  { value: "default", label: "Padrão (Verde)" },
  { value: "secondary", label: "Secundário (Cinza)" },
  { value: "outline", label: "Contorno" },
];

// ─── Main Component ─────────────────────────────────────────────

export default function AdminDownloads() {

  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [replaceFileId, setReplaceFileId] = useState<number | null>(null);
  const [form, setForm] = useState<DownloadFormData>(emptyForm);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Queries
  const { data: allDownloads, isLoading } = trpc.downloads.listAll.useQuery();

  // Mutations
  const createMutation = trpc.downloads.create.useMutation({
    onSuccess: () => {
      utils.downloads.listAll.invalidate();
      setDialogOpen(false);
      resetForm();
      toast.success("Download criado com sucesso!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const updateMutation = trpc.downloads.update.useMutation({
    onSuccess: () => {
      utils.downloads.listAll.invalidate();
      setDialogOpen(false);
      resetForm();
      toast.success("Download atualizado com sucesso!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = trpc.downloads.delete.useMutation({
    onSuccess: () => {
      utils.downloads.listAll.invalidate();
      setDeleteDialogOpen(false);
      setDeletingId(null);
      toast.success("Download excluído com sucesso!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const uploadAndCreateMutation = trpc.downloads.uploadAndCreate.useMutation({
    onSuccess: () => {
      utils.downloads.listAll.invalidate();
      setUploadDialogOpen(false);
      setUploadFile(null);
      resetForm();
      toast.success("Upload concluído! Download criado.");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const replaceFileMutation = trpc.downloads.replaceFile.useMutation({
    onSuccess: () => {
      utils.downloads.listAll.invalidate();
      setReplaceFileId(null);
      setUploadFile(null);
      toast.success("Arquivo substituído com sucesso!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Helpers
  const resetForm = useCallback(() => {
    setForm(emptyForm);
    setEditingId(null);
    setUploadFile(null);
  }, []);

  const openCreateDialog = useCallback(() => {
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const openEditDialog = useCallback((download: NonNullable<typeof allDownloads>[0]) => {
    setEditingId(download.id);
    setForm({
      slug: download.slug,
      title: download.title,
      description: download.description || "",
      format: download.format,
      fileSize: download.fileSize || "",
      url: download.url,
      filename: download.filename,
      category: download.category,
      badge: download.badge || "",
      badgeVariant: download.badgeVariant || "",
      sortOrder: download.sortOrder,
      active: download.active,
    });
    setDialogOpen(true);
  }, []);

  const openUploadDialog = useCallback(() => {
    resetForm();
    setUploadDialogOpen(true);
  }, [resetForm]);

  const handleSave = useCallback(() => {
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        slug: form.slug,
        title: form.title,
        description: form.description || null,
        format: form.format,
        fileSize: form.fileSize || null,
        url: form.url,
        filename: form.filename,
        category: form.category,
        badge: form.badge || null,
        badgeVariant: form.badgeVariant || null,
        sortOrder: form.sortOrder,
        active: form.active,
      });
    } else {
      createMutation.mutate({
        slug: form.slug,
        title: form.title,
        description: form.description || null,
        format: form.format,
        fileSize: form.fileSize || null,
        url: form.url,
        filename: form.filename,
        category: form.category,
        badge: form.badge || null,
        badgeVariant: form.badgeVariant || null,
        sortOrder: form.sortOrder,
        active: form.active,
      });
    }
  }, [editingId, form, createMutation, updateMutation]);

  const handleUploadAndCreate = useCallback(async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const arrayBuffer = await uploadFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      uploadAndCreateMutation.mutate({
        slug: form.slug,
        title: form.title,
        description: form.description || null,
        format: form.format,
        category: form.category,
        badge: form.badge || null,
        badgeVariant: form.badgeVariant || null,
        sortOrder: form.sortOrder,
        filename: uploadFile.name,
        mimeType: uploadFile.type || "application/octet-stream",
        size: uploadFile.size,
        data: base64,
      });
    } catch {
      toast.error("Falha ao processar o arquivo.");
    } finally {
      setUploading(false);
    }
  }, [uploadFile, form, uploadAndCreateMutation]);

  const handleReplaceFile = useCallback(async () => {
    if (!uploadFile || !replaceFileId) return;
    setUploading(true);
    try {
      const arrayBuffer = await uploadFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      replaceFileMutation.mutate({
        id: replaceFileId,
        filename: uploadFile.name,
        mimeType: uploadFile.type || "application/octet-stream",
        size: uploadFile.size,
        data: base64,
      });
    } catch {
      toast.error("Falha ao processar o arquivo.");
    } finally {
      setUploading(false);
    }
  }, [uploadFile, replaceFileId, replaceFileMutation]);

  // Filter downloads
  const filteredDownloads = allDownloads?.filter(
    (d) => filterCategory === "all" || d.category === filterCategory
  );

  // Group by category
  const groupedDownloads = filteredDownloads?.reduce(
    (acc, d) => {
      const cat = d.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(d);
      return acc;
    },
    {} as Record<string, typeof filteredDownloads>
  );

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display">
            Gerenciador de Downloads
          </h1>
          <p className="text-sm text-muted-foreground font-accent mt-1">
            Gerencie todos os arquivos disponíveis para download no site
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-accent">
            {currentDate}
          </span>
        </div>
      </div>

      <Separator />

      {/* Actions bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Filtrar categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-xs">
            {allDownloads?.length ?? 0} downloads
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={openCreateDialog} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Adicionar Link
          </Button>
          <Button size="sm" onClick={openUploadDialog} className="gap-1.5">
            <Upload className="h-4 w-4" />
            Upload + Criar
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Downloads list grouped by category */}
      {groupedDownloads &&
        Object.entries(groupedDownloads).map(([category, items]) => {
          const catLabel = CATEGORIES.find((c) => c.value === category)?.label || category;
          return (
            <div key={category}>
              <h2 className="text-sm font-semibold font-accent uppercase tracking-wider text-muted-foreground mb-4">
                {catLabel}
              </h2>
              <div className="grid gap-3">
                {items?.map((dl) => (
                  <Card
                    key={dl.id}
                    className={`border-border/50 transition-all ${dl.active === "no" ? "opacity-50" : "hover:shadow-md"}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-sm font-display truncate">
                              {dl.title}
                            </h3>
                            {dl.badge && (
                              <Badge
                                variant={
                                  (dl.badgeVariant as "default" | "secondary" | "outline") ||
                                  "default"
                                }
                                className="text-[10px] shrink-0"
                              >
                                {dl.badge}
                              </Badge>
                            )}
                            {dl.active === "no" && (
                              <Badge variant="outline" className="text-[10px] shrink-0 text-muted-foreground">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Inativo
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                            {dl.description}
                          </p>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-accent uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {dl.format}
                              </span>
                              {dl.fileSize && (
                                <span className="text-[10px] text-muted-foreground">
                                  {dl.fileSize}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground font-mono">
                                /{dl.slug}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                #{dl.sortOrder}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                title="Testar download"
                                onClick={() =>
                                  window.open(`/api/downloads/${dl.slug}`, "_blank")
                                }
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                title="Substituir arquivo"
                                onClick={() => {
                                  setReplaceFileId(dl.id);
                                  setUploadFile(null);
                                }}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                title="Editar"
                                onClick={() => openEditDialog(dl)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                title="Excluir"
                                onClick={() => {
                                  setDeletingId(dl.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

      {/* Empty state */}
      {!isLoading && (!filteredDownloads || filteredDownloads.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Download className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Nenhum download encontrado nesta categoria.
            </p>
            <Button size="sm" onClick={openUploadDialog} className="gap-1.5">
              <Upload className="h-4 w-4" />
              Fazer Upload
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─── Create/Edit Dialog ──────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingId ? "Editar Download" : "Adicionar Download (via URL)"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Edite os campos abaixo e salve."
                : "Adicione um download com URL externa (CDN, S3, etc)."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="slug">Slug (identificador)</Label>
                <Input
                  id="slug"
                  placeholder="ebook-pdf"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  disabled={!!editingId}
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="PDF — Leitura Digital"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Breve descrição do arquivo..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="format">Formato</Label>
                <Select
                  value={form.format}
                  onValueChange={(v) => setForm({ ...form, format: v })}
                >
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fileSize">Tamanho</Label>
                <Input
                  id="fileSize"
                  placeholder="11.3 MB"
                  value={form.fileSize}
                  onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">Ordem</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="url">URL do Arquivo</Label>
              <Input
                id="url"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filename">Nome do Arquivo (download)</Label>
              <Input
                id="filename"
                placeholder="PAGO-Ebook-v2.pdf"
                value={form.filename}
                onChange={(e) => setForm({ ...form, filename: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="badge">Badge (opcional)</Label>
                <Input
                  id="badge"
                  placeholder="Recomendado"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="badgeVariant">Estilo Badge</Label>
                <Select
                  value={form.badgeVariant || "none"}
                  onValueChange={(v) =>
                    setForm({ ...form, badgeVariant: v === "none" ? "" : v })
                  }
                >
                  <SelectTrigger id="badgeVariant">
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {BADGE_VARIANTS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="active">Status</Label>
                <Select
                  value={form.active}
                  onValueChange={(v) =>
                    setForm({ ...form, active: v as "yes" | "no" })
                  }
                >
                  <SelectTrigger id="active">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Ativo</SelectItem>
                    <SelectItem value="no">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Upload + Create Dialog ──────────────────────────── */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Upload de Arquivo + Criar Download</DialogTitle>
            <DialogDescription>
              Faça upload de um arquivo para o S3 e crie automaticamente a entrada de download.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* File upload area */}
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadFile(file);
                    // Auto-fill format from extension
                    const ext = file.name.split(".").pop()?.toUpperCase() || "";
                    setForm((prev) => ({
                      ...prev,
                      format: ext,
                      filename: file.name,
                    }));
                  }
                }}
              />
              {uploadFile ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{uploadFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar um arquivo (máx. 100 MB)
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="up-slug">Slug</Label>
                <Input
                  id="up-slug"
                  placeholder="ebook-novo"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="up-category">Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger id="up-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="up-title">Título</Label>
              <Input
                id="up-title"
                placeholder="PDF — Nova Versão"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="up-description">Descrição</Label>
              <Textarea
                id="up-description"
                placeholder="Breve descrição..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="up-format">Formato</Label>
                <Select
                  value={form.format}
                  onValueChange={(v) => setForm({ ...form, format: v })}
                >
                  <SelectTrigger id="up-format">
                    <SelectValue placeholder="Auto" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="up-badge">Badge</Label>
                <Input
                  id="up-badge"
                  placeholder="Novo"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="up-sortOrder">Ordem</Label>
                <Input
                  id="up-sortOrder"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUploadAndCreate}
              disabled={!uploadFile || !form.slug || !form.title || uploading || uploadAndCreateMutation.isPending}
            >
              {(uploading || uploadAndCreateMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Enviar e Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Replace File Dialog ─────────────────────────────── */}
      <Dialog open={replaceFileId !== null} onOpenChange={() => setReplaceFileId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Substituir Arquivo</DialogTitle>
            <DialogDescription>
              Selecione o novo arquivo para substituir o atual. O link de download permanecerá o mesmo.
            </DialogDescription>
          </DialogHeader>
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setUploadFile(file);
              }}
            />
            {uploadFile ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-medium">{uploadFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
            ) : (
              <>
                <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar o novo arquivo
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplaceFileId(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleReplaceFile}
              disabled={!uploadFile || uploading || replaceFileMutation.isPending}
            >
              {(uploading || replaceFileMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Substituir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ──────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este download? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && deleteMutation.mutate({ id: deletingId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
