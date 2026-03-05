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

export function useGeneratePdf() {
  const printRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

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

      // Temporarily move printable element into viewport for html2canvas compatibility (mobile)
      const el = printRef.current;
      const originalStyle = el.style.cssText;
      el.style.position = "fixed";
      el.style.left = "0";
      el.style.top = "0";
      el.style.zIndex = "-9999";
      el.style.pointerEvents = "none";

      try {
        await html2pdf()
          .set({
            margin: [MARGIN_TOP, MARGIN_X, MARGIN_BOTTOM, MARGIN_X],
            filename,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: "#FFFFFF",
              scrollX: 0,
              scrollY: 0,
              windowWidth: 800,
            },
            jsPDF: {
              unit: "mm",
              format: "a4",
              orientation: "portrait",
            },
            pagebreak: {
              mode: ["avoid-all", "css", "legacy"],
              avoid: [".pdf-no-break"],
            },
          })
          .from(el)
          .toPdf()
          .get("pdf")
          .then((doc: any) => {
            addHeaderFooter(doc, logoBase64, filename);
          })
          .save();
      } finally {
        el.style.cssText = originalStyle;
      }
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  }, []);

  return { printRef, generating, generatePdf };
}
