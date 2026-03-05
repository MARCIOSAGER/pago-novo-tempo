import { useRef, useCallback, useState } from "react";
import { toast } from "sonner";

/** Convert an image URL to a base64 data-URL */
function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

const MARGIN_TOP = 24;
const MARGIN_BOTTOM = 20;
const MARGIN_X = 15;

function addHeaderFooter(doc: any, logoBase64: string | null, filename: string) {
  const totalPages = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // ─── HEADER ───
    doc.setDrawColor(184, 168, 138);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, MARGIN_TOP - 4, pageWidth - MARGIN_X, MARGIN_TOP - 4);

    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", MARGIN_X, 5, 10, 10);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(26, 39, 68);
    doc.text("P.A.G.O.", MARGIN_X + 12, 10);

    doc.setFontSize(6);
    doc.setTextColor(184, 168, 138);
    doc.text("Novo Tempo", MARGIN_X + 12, 13.5);

    // ─── FOOTER ───
    doc.setDrawColor(184, 168, 138);
    doc.setLineWidth(0.3);
    const footerLineY = pageHeight - MARGIN_BOTTOM + 6;
    doc.line(MARGIN_X, footerLineY, pageWidth - MARGIN_X, footerLineY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(26, 39, 68);
    doc.text("pagonovotempo.com", MARGIN_X, footerLineY + 5);

    doc.setFontSize(7);
    doc.setTextColor(184, 168, 138);
    doc.text(`${i} / ${totalPages}`, pageWidth - MARGIN_X, footerLineY + 5, {
      align: "right",
    });
  }
}

function getPdfOptions(filename: string) {
  return {
    margin: [MARGIN_TOP, MARGIN_X, MARGIN_BOTTOM, MARGIN_X],
    filename,
    image: { type: "jpeg" as const, quality: 0.35 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#FFFFFF",
      scrollX: 0,
      scrollY: 0,
      windowWidth: 700,
    },
    jsPDF: {
      unit: "mm" as const,
      format: "a4" as const,
      orientation: "portrait" as const,
    },
    pagebreak: {
      mode: ["avoid-all", "css", "legacy"],
      avoid: [".pdf-no-break"],
    },
  };
}

export function useGeneratePdf() {
  const printRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  /** Prepare the element for rendering and return cleanup function */
  const prepareElement = (el: HTMLDivElement) => {
    const wrapper = el.parentElement as HTMLElement | null;
    const origWrapper = wrapper?.style.cssText ?? "";

    // Move the wrapper into the viewport so html2canvas can capture it
    if (wrapper) {
      wrapper.style.cssText =
        "position:fixed;left:0;top:0;z-index:-9999;pointer-events:none;";
    }

    return () => {
      if (wrapper) wrapper.style.cssText = origWrapper;
    };
  };

  const generatePdf = useCallback(async (filename: string) => {
    if (!printRef.current) return;
    setGenerating(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      let logoBase64: string | null = null;
      try {
        logoBase64 = await loadImageAsBase64("/favicon.png");
      } catch {
        // Logo won't appear if it fails to load
      }

      const el = printRef.current;
      const restore = prepareElement(el);

      try {
        await html2pdf()
          .set(getPdfOptions(filename))
          .from(el)
          .toPdf()
          .get("pdf")
          .then((doc: any) => {
            addHeaderFooter(doc, logoBase64, filename);
          })
          .save();
      } finally {
        restore();
      }
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  }, []);

  /** Generate PDF and return as base64 string (without data URI prefix) */
  const generatePdfBase64 = useCallback(async (filename: string): Promise<string | null> => {
    if (!printRef.current) return null;
    setGenerating(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      let logoBase64: string | null = null;
      try {
        logoBase64 = await loadImageAsBase64("/favicon.png");
      } catch {
        // Logo won't appear if it fails to load
      }

      const el = printRef.current;
      const restore = prepareElement(el);

      try {
        const worker = html2pdf().set(getPdfOptions(filename)).from(el).toPdf();
        const doc: any = await worker.get("pdf");
        addHeaderFooter(doc, logoBase64, filename);
        const base64 = doc.output("datauristring") as string;
        // Strip the "data:application/pdf;filename=...;base64," prefix
        return base64.split(",")[1];
      } finally {
        restore();
      }
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  return { printRef, generating, generatePdf, generatePdfBase64 };
}
