import { useRef, useCallback, useState } from "react";

export function useGeneratePdf() {
  const printRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generatePdf = useCallback(async (filename: string) => {
    if (!printRef.current) return;
    setGenerating(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: "jpeg", quality: 0.95 },
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
        .save();
    } finally {
      setGenerating(false);
    }
  }, []);

  return { printRef, generating, generatePdf };
}
