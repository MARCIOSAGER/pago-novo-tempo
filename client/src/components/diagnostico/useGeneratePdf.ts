import { useRef, useCallback, useState } from "react";

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

export function useGeneratePdf() {
  const printRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generatePdf = useCallback(async (filename: string) => {
    if (!printRef.current) return;
    setGenerating(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // Pre-load the logo
      let logoBase64: string | null = null;
      try {
        logoBase64 = await loadImageAsBase64("/favicon.png");
      } catch {
        // Logo won't appear if it fails to load
      }

      const MARGIN_TOP = 24; // mm — space for header
      const MARGIN_BOTTOM = 20; // mm — space for footer
      const MARGIN_X = 15; // mm — left/right

      const worker = html2pdf()
        .set({
          margin: [MARGIN_TOP, MARGIN_X, MARGIN_BOTTOM, MARGIN_X],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#FFFFFF",
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
        .from(printRef.current)
        .toPdf();

      // Access the jsPDF instance and add header/footer to each page
      worker.then((instance: any) => {
        const doc = instance.get("pdf");
        const totalPages = doc.internal.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);

          // ─── HEADER ───
          // Gold line under header
          doc.setDrawColor(184, 168, 138); // #B8A88A
          doc.setLineWidth(0.3);
          doc.line(MARGIN_X, MARGIN_TOP - 4, pageWidth - MARGIN_X, MARGIN_TOP - 4);

          // Logo
          if (logoBase64) {
            doc.addImage(logoBase64, "PNG", MARGIN_X, 5, 10, 10);
          }

          // Brand text next to logo
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(26, 39, 68); // #1A2744
          doc.text("P.A.G.O.", MARGIN_X + 12, 10);

          doc.setFontSize(6);
          doc.setTextColor(184, 168, 138); // #B8A88A
          doc.text("Novo Tempo", MARGIN_X + 12, 13.5);

          // ─── FOOTER ───
          // Gold line above footer
          doc.setDrawColor(184, 168, 138);
          doc.setLineWidth(0.3);
          const footerLineY = pageHeight - MARGIN_BOTTOM + 6;
          doc.line(MARGIN_X, footerLineY, pageWidth - MARGIN_X, footerLineY);

          // Website URL (left)
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(26, 39, 68, 100); // semi-transparent navy
          doc.text("pagonovotempo.com", MARGIN_X, footerLineY + 5);

          // Page number (right)
          doc.setFontSize(7);
          doc.setTextColor(184, 168, 138);
          doc.text(
            `${i} / ${totalPages}`,
            pageWidth - MARGIN_X,
            footerLineY + 5,
            { align: "right" }
          );
        }

        doc.save(filename);
      });
    } finally {
      setGenerating(false);
    }
  }, []);

  return { printRef, generating, generatePdf };
}
