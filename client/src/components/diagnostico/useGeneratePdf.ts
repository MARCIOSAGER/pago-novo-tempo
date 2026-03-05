import { useCallback, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { PillarKey, PillarSubgroups } from "./useDiagnosticoReducer";

export interface PdfDocumentProps {
  nome: string;
  pillarAverages: Record<PillarKey, number>;
  overallAverage: number;
  weakestPillar: PillarKey;
  pillarSubgroups: PillarSubgroups;
  weakestSubgroupPerPillar: Record<PillarKey, string | null>;
  t: any;
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mimeType });
}

export function useGeneratePdf() {
  const [generating, setGenerating] = useState(false);
  const generatePdfMutation = trpc.diagnostico.generatePdf.useMutation();

  const generatePdf = useCallback(async (filename: string, props: PdfDocumentProps) => {
    setGenerating(true);
    try {
      const { pdfBase64 } = await generatePdfMutation.mutateAsync(props);
      const blob = base64ToBlob(pdfBase64, "application/pdf");
      const url = URL.createObjectURL(blob);

      // iOS Safari ignores the download attribute on <a> tags.
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      if (isIOS) {
        window.open(url, "_blank");
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  }, [generatePdfMutation]);

  const generatePdfBase64 = useCallback(async (_filename: string, props: PdfDocumentProps): Promise<string | null> => {
    setGenerating(true);
    try {
      const { pdfBase64 } = await generatePdfMutation.mutateAsync(props);
      return pdfBase64;
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
      return null;
    } finally {
      setGenerating(false);
    }
  }, [generatePdfMutation]);

  return { generating, generatePdf, generatePdfBase64 };
}
