import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import type { InvoiceData } from "@/types/invoice";

export async function exportInvoiceToPDF(
  data: InvoiceData,
  element: HTMLElement | null
): Promise<void> {
  if (!element) {
    throw new Error("Invoice canvas element not found for rendering.");
  }

  // 1. Ensure all custom fonts (Gotham X Narrow) are ready
  if (typeof document !== "undefined" && document.fonts) {
    await document.fonts.ready;
  }

  // 2. Render high-DPI raster via SVG foreignObject (supports modern Tailwind v4 oklch colors)
  const imgData = await toPng(element, {
    pixelRatio: 3, // 300 DPI Retina print quality
    backgroundColor: "#000000",
    cacheBust: true,
    filter: (node) => {
      // Exclude interactive buttons or unwanted overlays if any
      return true;
    },
  });

  // 3. Measure aspect ratio to prevent stretching
  const img = new Image();
  img.src = imgData;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const pdfWidthMm = 297; // Standard A4 Landscape
  const pdfHeightMm = (img.height / img.width) * pdfWidthMm;

  // 4. Generate the PDF
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [pdfWidthMm, pdfHeightMm],
    compress: true,
  });

  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pdfWidthMm, pdfHeightMm, "F");

  doc.addImage(imgData, "PNG", 0, 0, pdfWidthMm, pdfHeightMm, undefined, "FAST");

  // 5. Save the file
  const safeClient = (data.clientName || "Client").replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, "_");
  const filename = `Invoice_${data.invoiceNumber}_${safeClient}.pdf`;
  doc.save(filename);
}
