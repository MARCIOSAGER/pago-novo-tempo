import { useCallback, useState } from "react";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import DiagnosticoPdfDocument from "./DiagnosticoPdfDocument";
import type { PdfDocumentProps } from "./DiagnosticoPdfDocument";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function renderPdfBlob(props: PdfDocumentProps): Promise<Blob> {
  const doc = createElement(DiagnosticoPdfDocument, props);
  return await pdf(doc).toBlob();
}

export function useGeneratePdf() {
  const [generating, setGenerating] = useState(false);

  const generatePdf = useCallback(async (filename: string, props: PdfDocumentProps) => {
    setGenerating(true);
    try {
      const blob = await renderPdfBlob(props);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  }, []);

  const generatePdfBase64 = useCallback(async (filename: string, props: PdfDocumentProps): Promise<string | null> => {
    setGenerating(true);
    try {
      const blob = await renderPdfBlob(props);
      return await blobToBase64(blob);
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generating, generatePdf, generatePdfBase64 };
}
