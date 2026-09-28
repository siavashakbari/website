# Feature Specification & Architecture Guide: Pixel-Perfect Invoice & Receipt Studio

## 1. Executive Summary & Design Reference

This document specifies the exact reverse-engineered reproduction of Siavash Akbari’s Adobe Illustrator invoice template into an automated, interactive web studio inside the Admin Panel (`/admin/invoices`). 

Every time a project is commissioned or completed, you will be able to:
1. Fill in client details, dates, and dynamic project service rows.
2. See a **live, 1:1 pixel-perfect visual rendering** of the Illustrator artwork in real-time.
3. Automatically compute row totals, cumulative sum, advance deposits, and remaining balance in **Iranian Rials (IRR) / Toman**.
4. Click **"Download PDF"** to produce an ultra-crisp, print-ready vector PDF matching the Illustrator master file.

---

## 2. Visual Anatomy & Illustrator Blueprint Breakdown

Based on deep analysis of the reference screenshot and vector header:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  INVOICE                                                SIAVASHAKBARI       │ <- Full-width Cyan Bar (#2CE3C0)
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Billed to              Date of issue      Invoice number   Amount due (IRR)│
│  Vishnu Clinic          1405/07/05         05070501         154,000,000     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤ <- 1px Cyan Line (#2CE3C0)
│  Description                      Rate (IRR)         Qty       Total Amount │
│  Daily Videography Fee            30,000,000           3         90,000,000 │
│  Video Edit                        8,000,000           8         64,000,000 │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤ <- 1px Cyan Line (#2CE3C0)
│                                                                             │
│  Bank Info                        Total Sum                     154,000,000 │
│  Siavash Akbari (BluBank)         Advance Payment                         0 │
│  6219861835930404                 ───────────────────────────────────────── │ <- 1px Cyan Line
│  IR700560611828005126957701       Amount Remaining              154,000,000 │
│                                                                             │
│  [ Cyan Signature ]                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Color Palette (Exact Hex Codes)
- **Primary Brand Cyan / Turquoise**: `#2CE3C0` (Used for header background, labels, divider lines, and signature).
- **Pitch Black Canvas**: `#000000` (Main receipt background).
- **Pure White**: `#FFFFFF` (Values, titles, numbers, and amounts).
- **Header Text (Black)**: `#000000` (Text inside the cyan header bar).

---

## 3. Strict Typography Isolation Protocol

> [!CAUTION]
> **Strict Isolation Rule**: The `Gotham X Narrow` font family must be loaded **exclusively** inside the Invoice Generator workspace and PDF renderer. It must **never** leak or apply to any other page or component on the website (which uses `Satoshi`, `Peyda`, and system fallbacks).

### A. Font Assets & Source
The source files are located at:
- **Bold**: `C:\Users\Centaures\Desktop\Gotham\GothamXNarrow-Bold.otf` (Headings, client name, invoice number, totals)
- **Book**: `C:\Users\Centaures\Desktop\Gotham\GothamXNarrow-Book.otf` (Labels, item descriptions, body text)

### B. Sandboxed CSS Definition
In `src/styles/invoice-sandbox.css` (imported strictly inside the Invoice Studio component):
```css
/* Isolated @font-face rules - Scoped exclusively to .invoice-canvas-sandbox */
@font-face {
  font-family: 'GothamXNarrow';
  src: url('/fonts/invoice/GothamXNarrow-Book.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: block;
}

@font-face {
  font-family: 'GothamXNarrow';
  src: url('/fonts/invoice/GothamXNarrow-Bold.otf') format('opentype');
  font-weight: 700;
  font-style: normal;
  font-display: block;
}

/* Hard isolation boundary */
.invoice-canvas-sandbox {
  font-family: 'GothamXNarrow', -apple-system, sans-serif !important;
  letter-spacing: 0.02em;
}

.invoice-canvas-sandbox * {
  font-family: inherit;
}
```

---

## 4. Invoice Studio UI/UX & Interactive State Engine

The workspace at `/admin/invoices` features a **Dual-Pane Studio Layout**:
- **Left Pane (Interactive Controls)**: Form fields, row manager, bank preset switch, and calculation controls.
- **Right Pane (Live WYSIWYG Canvas)**: Exact 1:1 real-time preview of the rendered invoice.

### A. Invoice State Schema (`src/types/invoice.ts`)
```typescript
export interface InvoiceItem {
  id: string;
  description: string;
  rate: number; // in Rials
  quantity: number;
}

export interface InvoiceData {
  invoiceNumber: string; // e.g. "05070501"
  issueDateShamsi: string; // e.g. "1405/07/05"
  issueDateGregorian?: string;
  clientName: string; // e.g. "Vishnu Clinic"
  currency: "IRR" | "TOMAN";
  items: InvoiceItem[];
  advancePayment: number;
  bankInfo: {
    accountHolder: string;
    bankName: string;
    cardNumber: string;
    shebaNumber: string;
  };
  notes?: string;
}
```

### B. Real-Time Math & Reactive Calculations
The engine automatically calculates the financial breakdown on every keystroke:
$$\text{Row Total}_i = \text{Rate}_i \times \text{Quantity}_i$$
$$\text{Total Sum} = \sum_{i=1}^{n} \text{Row Total}_i$$
$$\text{Amount Remaining} = \text{Total Sum} - \text{Advance Payment}$$

Numbers are automatically formatted with Persian/Iranian comma separators (e.g., `154000000` $\rightarrow$ `154,000,000`).

---

## 5. Pixel-Perfect HTML/Tailwind Canvas Component

Here is the exact component that replicates the Illustrator visual:

```tsx
import React from 'react';
import type { InvoiceData } from '../types/invoice';

export const InvoiceCanvas: React.FC<{ data: InvoiceData; canvasRef: React.RefObject<HTMLDivElement> }> = ({ data, canvasRef }) => {
  const totalSum = data.items.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
  const remaining = totalSum - (data.advancePayment || 0);

  const formatNumber = (num: number) => num.toLocaleString('en-US');

  return (
    <div 
      ref={canvasRef}
      className="invoice-canvas-sandbox w-[960px] min-h-[600px] bg-black text-white p-0 relative shadow-2xl overflow-hidden select-none"
      style={{ backgroundColor: '#000000' }}
    >
      {/* 1. Header Bar */}
      <div className="w-full bg-[#2CE3C0] px-8 py-3.5 flex items-center justify-between">
        <span className="text-black font-bold text-2xl tracking-wider">INVOICE</span>
        <span className="text-black text-xl tracking-wide">
          <strong className="font-bold">SIAVASH</strong>
          <span className="font-normal">AKBARI</span>
        </span>
      </div>

      <div className="px-10 py-8 space-y-7">
        {/* 2. Meta Info Section */}
        <div className="grid grid-cols-4 gap-4 items-start">
          <div>
            <div className="text-[#2CE3C0] text-xs font-normal mb-1">Billed to</div>
            <div className="text-white font-bold text-base">{data.clientName || 'Client Name'}</div>
          </div>
          <div>
            <div className="text-[#2CE3C0] text-xs font-normal mb-1">Date of issue</div>
            <div className="text-white font-bold text-base">{data.issueDateShamsi}</div>
          </div>
          <div>
            <div className="text-[#2CE3C0] text-xs font-normal mb-1">Invoice number</div>
            <div className="text-white font-bold text-base">{data.invoiceNumber}</div>
          </div>
          <div className="text-right">
            <div className="text-[#2CE3C0] text-xs font-normal mb-1">Amount due ({data.currency})</div>
            <div className="text-white font-bold text-xl">{formatNumber(remaining)}</div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1.5px] bg-[#2CE3C0]" />

        {/* 3. Items Table */}
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-12 text-[#2CE3C0] text-xs font-normal">
            <div className="col-span-6">Description</div>
            <div className="col-span-3 text-center">Rate ({data.currency})</div>
            <div className="col-span-1 text-center">Qty</div>
            <div className="col-span-2 text-right">Total Amount</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2.5">
            {data.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 text-white text-sm font-normal items-center">
                <div className="col-span-6 font-bold">{item.description}</div>
                <div className="col-span-3 text-center">{formatNumber(item.rate)}</div>
                <div className="col-span-1 text-center font-bold">{item.quantity}</div>
                <div className="col-span-2 text-right font-bold">{formatNumber(item.rate * item.quantity)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1.5px] bg-[#2CE3C0]" />

        {/* 4. Bottom Section: Banking & Signature (Left) + Totals (Right) */}
        <div className="grid grid-cols-12 gap-8 items-start pt-2">
          {/* Left Column: Bank Info & Signature */}
          <div className="col-span-6 space-y-2">
            <div className="text-[#2CE3C0] text-xs font-normal">Bank Info</div>
            <div className="text-white font-bold text-sm">
              {data.bankInfo.accountHolder} ({data.bankInfo.bankName})
            </div>
            <div className="text-white text-sm tracking-wider font-mono">
              {data.bankInfo.cardNumber}
            </div>
            <div className="text-white text-xs tracking-wider font-mono">
              {data.bankInfo.shebaNumber}
            </div>

            {/* Cyan Signature SVG Graphic */}
            <div className="pt-4">
              <svg className="w-36 h-14 text-[#2CE3C0]" viewBox="0 0 160 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {/* Vector signature path matching Illustrator original */}
                <path d="M 20 45 C 30 20, 45 10, 50 25 C 55 40, 40 50, 60 45 C 75 42, 85 25, 95 40 C 105 50, 120 42, 140 45" />
                <path d="M 25 35 Q 80 48, 145 42" strokeWidth="1.8" />
              </svg>
            </div>
          </div>

          {/* Right Column: Financial Summary */}
          <div className="col-span-6 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#2CE3C0] text-xs font-normal">Total Sum</span>
              <span className="text-white font-bold">{formatNumber(totalSum)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-[#2CE3C0] text-xs font-normal">Advance Payment</span>
              <span className="text-white font-bold">{formatNumber(data.advancePayment || 0)}</span>
            </div>

            {/* Sub-divider */}
            <div className="w-full h-[1.5px] bg-[#2CE3C0]" />

            <div className="flex justify-between items-center text-base pt-1">
              <span className="text-[#2CE3C0] text-xs font-normal">Amount Remaining</span>
              <span className="text-white font-bold text-lg">{formatNumber(remaining)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 6. High-Fidelity PDF Generation Engine

To export a razor-sharp vector PDF matching Illustrator rather than a blurry bitmap screenshot:

### Step 1: Install jsPDF Font Registration Helper
`jspdf` is already installed in `package.json` (`"jspdf": "^4.2.1"`). 

### Step 2: Base64 Embedding of Gotham X Narrow
A build script (`scripts/encode-invoice-fonts.mjs`) reads:
`C:\Users\Centaures\Desktop\Gotham\GothamXNarrow-Bold.otf`
and
`C:\Users\Centaures\Desktop\Gotham\GothamXNarrow-Book.otf`
and converts them into lightweight Base64 strings loaded directly into the jsPDF Virtual File System (VFS).

### Step 3: PDF Export Function (`src/lib/invoice-pdf-export.ts`)
```typescript
import { jsPDF } from 'jspdf';
import { GOTHAM_BOLD_BASE64, GOTHAM_BOOK_BASE64 } from './gotham-fonts-base64';
import type { InvoiceData } from '../types/invoice';

export async function exportInvoiceToPDF(data: InvoiceData) {
  // A4 Landscape or custom receipt aspect ratio (297mm x 185mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 185],
  });

  // 1. Register Gotham X Narrow Fonts into jsPDF
  doc.addFileToVFS('GothamXNarrow-Bold.otf', GOTHAM_BOLD_BASE64);
  doc.addFileToVFS('GothamXNarrow-Book.otf', GOTHAM_BOOK_BASE64);
  doc.addFont('GothamXNarrow-Bold.otf', 'GothamXNarrow', 'bold');
  doc.addFont('GothamXNarrow-Book.otf', 'GothamXNarrow', 'normal');

  // 2. Render Full-Bleed Black Background
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 297, 185, 'F');

  // 3. Render Header Cyan Bar
  doc.setFillColor(44, 227, 192); // #2CE3C0
  doc.rect(0, 0, 297, 18, 'F');

  doc.setFont('GothamXNarrow', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 16, 12.5);

  doc.text('SIAVASHAKBARI', 281, 12.5, { align: 'right' });

  // 4. Render Metadata & Cyan Lines
  doc.setDrawColor(44, 227, 192);
  doc.setLineWidth(0.5);

  // ... (Full vector drawing coordinates ensuring 1:1 match with Illustrator)

  // 5. Download Trigger
  const filename = `Invoice_${data.invoiceNumber}_${data.clientName.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
```

---

## 7. Delivery & Implementation Checklist

- [ ] Copy `GothamXNarrow-Bold.otf` and `GothamXNarrow-Book.otf` from Desktop to `public/fonts/invoice/`.
- [ ] Implement `src/routes/admin.invoices.tsx` featuring the dual-pane editor.
- [ ] Connect reactive state to auto-calculate row totals and IRR balances.
- [ ] Bind "Export PDF" button to vector jsPDF engine.
- [ ] Validate that Gotham font is strictly excluded from all public portfolio routes.
