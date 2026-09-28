import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { 
  Download, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Check, 
  FileText, 
  CreditCard, 
  Calendar, 
  User, 
  Sparkles,
  Printer,
  ChevronDown
} from "lucide-react";
import "@/styles/invoice-sandbox.css";
import { Logo } from "@/components/Logo";
import { SIGNATURE_DATA_URL } from "@/assets/signature-data";
import type { InvoiceData, InvoiceItem, BankInfo } from "@/types/invoice";
import { INITIAL_INVOICE_DATA, DEFAULT_BANK_INFO, PRESET_BANK_CARDS } from "@/types/invoice";
import { getSavedInvoices, saveInvoice, deleteInvoice } from "@/lib/studio-store";
import { exportInvoiceToPDF } from "@/lib/invoice-pdf-export";

export const Route = createFileRoute("/admin/invoices")({
  component: AdminInvoicesView,
});

const STORAGE_BANK_CARDS_KEY = "siavash_studio_saved_bank_cards";
const STORAGE_DEFAULT_PRESET_KEY = "siavash_invoice_default_preset";

function AdminInvoicesView() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData>(INITIAL_INVOICE_DATA);
  const [isExporting, setIsExporting] = useState(false);
  const [defaultSuccess, setDefaultSuccess] = useState(false);
  const [cardSaveSuccess, setCardSaveSuccess] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Bank cards presets
  const [savedCards, setSavedCards] = useState<BankInfo[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_BANK_CARDS_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.error("Error reading saved cards:", e);
      }
    }
    return PRESET_BANK_CARDS;
  });

  useEffect(() => {
    let defaultData: InvoiceData | null = null;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_DEFAULT_PRESET_KEY);
        if (raw) {
          defaultData = JSON.parse(raw);
        }
      } catch (e) {
        console.error("Error reading default invoice preset:", e);
      }
    }

    const list = getSavedInvoices();
    setInvoices(list);
    if (defaultData) {
      setCurrentInvoice(defaultData);
    } else if (list.length > 0) {
      setCurrentInvoice(list[0]);
    }
  }, []);

  // Format numbers with commas (e.g. 154,000,000)
  const formatNumber = (val: number | string) => {
    const n = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, "")) || 0;
    return n.toLocaleString("en-US");
  };

  // Real-time financial calculations
  const totalSum = currentInvoice.items.reduce(
    (sum, item) => sum + (item.rate || 0) * (item.quantity || 0),
    0
  );
  const amountRemaining = Math.max(0, totalSum - (currentInvoice.advancePayment || 0));

  // Item row operations
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: "Creative Consulting & Production",
      subDescription: "Art direction & full post-production delivery",
      rate: 10000000,
      quantity: 1,
    };
    setCurrentInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setCurrentInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (currentInvoice.items.length <= 1) {
      alert("An invoice must contain at least one item row.");
      return;
    }
    setCurrentInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleSetAsDefault = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_DEFAULT_PRESET_KEY, JSON.stringify(currentInvoice));
    }
    saveInvoice(currentInvoice);
    const updated = getSavedInvoices();
    setInvoices(updated);
    setDefaultSuccess(true);
    setTimeout(() => setDefaultSuccess(false), 1500);
  };

  const handleNewInvoice = () => {
    const now = new Date();
    const newNumber = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(Math.floor(Math.random() * 90 + 10))}`;
    const newInv: InvoiceData = {
      ...INITIAL_INVOICE_DATA,
      id: `inv-${Date.now()}`,
      invoiceNumber: newNumber,
      clientName: "New Client",
      advancePayment: 0,
      createdAt: now.toISOString(),
      items: [
        {
          id: `item-1`,
          description: "Art Direction & Production",
          subDescription: "Creative concepting and studio shoot execution",
          rate: 25000000,
          quantity: 1,
        },
      ],
    };
    setCurrentInvoice(newInv);
  };

  // Bank Card Switcher
  const handleSelectCard = (card: BankInfo) => {
    setCurrentInvoice((prev) => ({
      ...prev,
      bankInfo: { ...card },
    }));
  };

  const handleSaveCurrentCardAsPreset = () => {
    const newCard: BankInfo = {
      ...currentInvoice.bankInfo,
      id: `card-${Date.now()}`,
    };
    const updated = [...savedCards, newCard];
    setSavedCards(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_BANK_CARDS_KEY, JSON.stringify(updated));
    }
    setCardSaveSuccess(true);
    setTimeout(() => setCardSaveSuccess(false), 1200);
  };

  const handleExportPDF = async () => {
    if (!canvasRef.current) {
      alert("Invoice canvas not ready");
      return;
    }
    setIsExporting(true);
    try {
      await exportInvoiceToPDF(currentInvoice, canvasRef.current);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to export PDF. Check console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Invoice & Receipt Studio</span>
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#2CE3C0]/15 text-[#2CE3C0] border border-[#2CE3C0]/30 px-2 py-0.5 rounded-full">
              ILLUSTRATOR ENGINE
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Exact reverse-engineered reproduction of your Illustrator template with isolated Gotham X Narrow typography and vector PDF export.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleNewInvoice}
            className="px-3 py-2 rounded-xl border border-white/10 hover:border-white/30 text-neutral-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Invoice</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl border border-white/10 hover:border-white/30 text-neutral-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Print or Save via Browser Print Dialog"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={handleSetAsDefault}
            title="Save current invoice data as your default template for future sessions"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {defaultSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#2CE3C0]" />
                <span className="text-[#2CE3C0]">Default Saved!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#2CE3C0]" />
                <span>Set as default</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(44,227,192,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                <span>Rendering High-DPI PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =================================================================== */}
        {/* LEFT PANE: INTERACTIVE CONTROLS & FORM (5 Columns)                   */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-5">
          {/* History Switcher */}
          {invoices.length > 1 && (
            <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Load Past Invoice:</span>
              <select
                value={currentInvoice.id}
                onChange={(e) => {
                  const found = invoices.find((inv) => inv.id === e.target.value);
                  if (found) setCurrentInvoice(found);
                }}
                className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-[#2CE3C0]"
              >
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    #{inv.invoiceNumber} — {inv.clientName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section: Client & Meta Details */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#2CE3C0] flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>Client & Invoice Header</span>
            </h3>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Billed to (Client Name)</label>
              <input
                type="text"
                value={currentInvoice.clientName}
                onChange={(e) =>
                  setCurrentInvoice((prev) => ({ ...prev, clientName: e.target.value }))
                }
                placeholder="e.g. Vishnu Clinic"
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2CE3C0]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={currentInvoice.invoiceNumber}
                  onChange={(e) =>
                    setCurrentInvoice((prev) => ({ ...prev, invoiceNumber: e.target.value }))
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#2CE3C0]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Date of Issue (Shamsi)</label>
                <input
                  type="text"
                  value={currentInvoice.issueDateShamsi}
                  onChange={(e) =>
                    setCurrentInvoice((prev) => ({ ...prev, issueDateShamsi: e.target.value }))
                  }
                  placeholder="1405/07/05"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#2CE3C0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Currency</label>
              <div className="flex gap-2">
                {(["IRR", "TOMAN"] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrentInvoice((prev) => ({ ...prev, currency: curr }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      currentInvoice.currency === curr
                        ? "bg-[#2CE3C0] text-black border-[#2CE3C0]"
                        : "bg-black/40 text-neutral-400 border-white/10 hover:text-white"
                    }`}
                  >
                    {curr === "IRR" ? "IRR (ریال)" : "TOMAN (تومان)"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Item Rows Builder (With Main Description + Sub-Description) */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#2CE3C0] flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Line Items ({currentInvoice.items.length})</span>
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-[11px] text-[#2CE3C0] hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {currentInvoice.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-[#2CE3C0]">Row {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                      title="Remove row"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Main Description (Gotham Bold) */}
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">
                      Main Description (Bold)
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                      placeholder="e.g. Daily Videography Fee"
                      className="w-full bg-neutral-900 border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0]"
                    />
                  </div>

                  {/* Sub-description (Gotham Book, 2px smaller) */}
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">
                      Sub-description (Book font, 2px smaller)
                    </label>
                    <input
                      type="text"
                      value={item.subDescription || ""}
                      onChange={(e) => handleUpdateItem(item.id, "subDescription", e.target.value)}
                      placeholder="Optional details (e.g. Sony FX3 / 4K cinematography / 3 revisions)..."
                      className="w-full bg-neutral-900 border border-white/10 rounded-md px-2.5 py-1 text-[11px] text-neutral-300 focus:outline-none focus:border-[#2CE3C0]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400">Rate</label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "rate", parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-neutral-900 border border-white/10 rounded-md px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#2CE3C0]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "quantity", parseInt(e.target.value) || 1)
                        }
                        className="w-full bg-neutral-900 border border-white/10 rounded-md px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#2CE3C0]"
                      />
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-neutral-400 pt-0.5 font-mono">
                    Total: <strong className="text-white">{formatNumber(item.rate * item.quantity)}</strong> {currentInvoice.currency}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Advance Payment & Bank Account Switcher */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#2CE3C0] flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Bank Card & Deposit Details</span>
            </h3>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Advance Payment (Deposit Received)
              </label>
              <input
                type="number"
                value={currentInvoice.advancePayment}
                onChange={(e) =>
                  setCurrentInvoice((prev) => ({
                    ...prev,
                    advancePayment: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0"
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#2CE3C0]"
              />
            </div>

            {/* Bank Card Switcher Buttons */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Select Bank Account / Card:</span>
                <button
                  type="button"
                  onClick={handleSaveCurrentCardAsPreset}
                  className="text-[#2CE3C0] hover:underline cursor-pointer flex items-center gap-1"
                >
                  {cardSaveSuccess ? (
                    <>
                      <Check className="w-3 h-3 text-[#2CE3C0]" />
                      <span>Card Saved!</span>
                    </>
                  ) : (
                    <span>+ Save as Preset</span>
                  )}
                </button>
              </div>

              {/* Preset Cards Quick Chips */}
              <div className="flex flex-wrap gap-1.5">
                {savedCards.map((card, i) => {
                  const isSelected =
                    currentInvoice.bankInfo.cardNumber === card.cardNumber &&
                    currentInvoice.bankInfo.bankName === card.bankName;
                  return (
                    <button
                      key={card.id || i}
                      type="button"
                      onClick={() => handleSelectCard(card)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#2CE3C0] text-black border-[#2CE3C0] font-semibold"
                          : "bg-black/40 text-neutral-400 border-white/10 hover:text-white"
                      }`}
                    >
                      {card.bankName || "Card"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Card Details */}
            <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-0.5">Account Holder</label>
                  <input
                    type="text"
                    value={currentInvoice.bankInfo.accountHolder}
                    onChange={(e) =>
                      setCurrentInvoice((prev) => ({
                        ...prev,
                        bankInfo: { ...prev.bankInfo, accountHolder: e.target.value },
                      }))
                    }
                    className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-0.5">Bank Name</label>
                  <input
                    type="text"
                    value={currentInvoice.bankInfo.bankName}
                    onChange={(e) =>
                      setCurrentInvoice((prev) => ({
                        ...prev,
                        bankInfo: { ...prev.bankInfo, bankName: e.target.value },
                      }))
                    }
                    className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Card Number</label>
                <input
                  type="text"
                  value={currentInvoice.bankInfo.cardNumber}
                  onChange={(e) =>
                    setCurrentInvoice((prev) => ({
                      ...prev,
                      bankInfo: { ...prev.bankInfo, cardNumber: e.target.value },
                    }))
                  }
                  placeholder="6219861835930404"
                  className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Sheba / IBAN Number</label>
                <input
                  type="text"
                  value={currentInvoice.bankInfo.shebaNumber}
                  onChange={(e) =>
                    setCurrentInvoice((prev) => ({
                      ...prev,
                      bankInfo: { ...prev.bankInfo, shebaNumber: e.target.value },
                    }))
                  }
                  placeholder="IR700560611828005126957701"
                  className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Signature Toggle */}
          <div className="p-4 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <span>Sign it?</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                    currentInvoice.includeSignature
                      ? "bg-[#2CE3C0]/15 text-[#2CE3C0] border border-[#2CE3C0]/30"
                      : "bg-white/5 text-neutral-400 border border-white/10"
                  }`}
                >
                  {currentInvoice.includeSignature ? "ENABLED" : "OFF"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Toggle your authentic handwritten signature on the bottom-left of the invoice canvas.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={currentInvoice.includeSignature}
              onClick={() =>
                setCurrentInvoice((prev) => ({
                  ...prev,
                  includeSignature: !prev.includeSignature,
                }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                currentInvoice.includeSignature ? "bg-[#2CE3C0]" : "bg-neutral-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
                  currentInvoice.includeSignature ? "translate-x-5 bg-black" : "translate-x-0 bg-white"
                }`}
              />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT PANE: LIVE WYSIWYG ILLUSTRATOR CANVAS (7 Columns)             */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-3 sticky top-24">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span className="font-mono uppercase tracking-wider text-[11px] text-neutral-500">
              Live WYSIWYG Illustrator Rendering (Gotham X Narrow Isolated)
            </span>
            <span className="text-[#2CE3C0] text-[11px] font-mono">
              Auto-updating
            </span>
          </div>

          {/* THE EXACT 1:1 ILLUSTRATOR ARTWORK REPRODUCTION CONTAINER */}
          <div className="rounded-2xl border border-white/20 overflow-hidden shadow-2xl bg-black">
            <div
              ref={canvasRef}
              className="invoice-canvas-sandbox w-full bg-black text-white p-0 relative select-none"
              style={{ backgroundColor: "#000000" }}
            >
              {/* 1. Header Bar (#2CE3C0 full-width) - PERFECT VERTICAL CENTERING */}
              <div 
                className="w-full bg-[#2CE3C0] px-8 sm:px-10 flex items-center justify-between"
                style={{ height: "58px", minHeight: "58px" }}
              >
                <div className="flex items-center h-full">
                  <span className="text-black font-bold text-2xl sm:text-3xl tracking-wider uppercase leading-none select-none">
                    INVOICE
                  </span>
                </div>
                <div className="flex items-center h-full">
                  <Logo className="h-5 sm:h-6 w-auto text-black select-none pointer-events-none" />
                </div>
              </div>

              {/* 2. Inner Body with Pitch Black Background */}
              <div className="px-8 sm:px-10 py-7 space-y-6">
                {/* Meta Header Columns (NO TRUNCATION / NO CLIPPING) */}
                <div className="grid grid-cols-4 gap-4 items-start">
                  <div>
                    <div className="text-[#2CE3C0] text-xs font-normal mb-1">Billed to</div>
                    <div className="text-white font-bold text-sm sm:text-base leading-normal overflow-visible">
                      {currentInvoice.clientName || "Client Name"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#2CE3C0] text-xs font-normal mb-1">Date of issue</div>
                    <div className="text-white font-bold text-sm sm:text-base leading-normal">
                      {currentInvoice.issueDateShamsi}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#2CE3C0] text-xs font-normal mb-1">Invoice number</div>
                    <div className="text-white font-bold text-sm sm:text-base leading-normal">
                      {currentInvoice.invoiceNumber}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[#2CE3C0] text-xs font-normal mb-1">
                      Amount due ({currentInvoice.currency})
                    </div>
                    <div className="text-white font-bold text-base sm:text-xl leading-normal">
                      {formatNumber(amountRemaining)}
                    </div>
                  </div>
                </div>

                {/* Cyan Horizontal Divider 1 */}
                <div className="w-full h-[1.5px] bg-[#2CE3C0]" />

                {/* Table Header */}
                <div className="space-y-3.5">
                  <div className="grid grid-cols-12 text-[#2CE3C0] text-xs font-normal">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-3 text-center">Rate ({currentInvoice.currency})</div>
                    <div className="col-span-1 text-center">Qty</div>
                    <div className="col-span-2 text-right">Total Amount</div>
                  </div>

                  {/* Table Rows with Bold Title + Book Sub-Description (2px smaller) */}
                  <div className="space-y-3">
                    {currentInvoice.items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 text-white items-center py-0.5"
                      >
                        {/* Description Column (No truncation / clipping, with optional Sub-description) */}
                        <div className="col-span-6 pr-4 overflow-visible">
                          <div className="text-white font-bold text-sm leading-normal">
                            {item.description}
                          </div>
                          {item.subDescription && (
                            <div className="text-neutral-300 font-normal text-xs leading-normal mt-0.5">
                              {item.subDescription}
                            </div>
                          )}
                        </div>

                        <div className="col-span-3 text-center font-normal text-sm leading-normal">
                          {formatNumber(item.rate)}
                        </div>

                        <div className="col-span-1 text-center font-bold text-sm leading-normal">
                          {item.quantity}
                        </div>

                        <div className="col-span-2 text-right font-bold text-sm leading-normal">
                          {formatNumber(item.rate * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cyan Horizontal Divider 2 */}
                <div className="w-full h-[1.5px] bg-[#2CE3C0]" />

                {/* Bottom Section: Banking (Left) & Totals (Right) */}
                <div className="grid grid-cols-12 gap-6 items-start pt-1">
                  {/* Left Column: Bank Info & Signature */}
                  <div className="col-span-6 space-y-1.5 overflow-visible">
                    <div className="text-[#2CE3C0] text-xs font-normal">Bank Info</div>
                    <div className="text-white font-bold text-sm leading-normal">
                      {currentInvoice.bankInfo.accountHolder} ({currentInvoice.bankInfo.bankName})
                    </div>
                    <div className="text-white text-xs tracking-wider font-mono leading-normal">
                      {currentInvoice.bankInfo.cardNumber}
                    </div>
                    <div className="text-white text-[11px] tracking-wider font-mono leading-normal">
                      {currentInvoice.bankInfo.shebaNumber}
                    </div>

                    {/* Authentic Handwritten Signature (Toggled via "Sign it?") */}
                    {currentInvoice.includeSignature && (
                      <div className="pt-2">
                        <img
                          src={SIGNATURE_DATA_URL}
                          alt="Signature"
                          className="h-12 sm:h-14 w-auto object-contain select-none pointer-events-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Right Column: Financial Breakdown */}
                  <div className="col-span-6 space-y-2.5 overflow-visible">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[#2CE3C0] text-xs font-normal">Total Sum</span>
                      <span className="text-white font-bold leading-normal">{formatNumber(totalSum)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[#2CE3C0] text-xs font-normal">Advance Payment</span>
                      <span className="text-white font-bold leading-normal">
                        {formatNumber(currentInvoice.advancePayment || 0)}
                      </span>
                    </div>

                    {/* Sub-divider Line */}
                    <div className="w-full h-[1.5px] bg-[#2CE3C0]" />

                    <div className="flex justify-between items-center text-sm sm:text-base pt-0.5">
                      <span className="text-[#2CE3C0] text-xs font-normal">Amount Remaining</span>
                      <span className="text-white font-bold text-lg sm:text-xl leading-normal">
                        {formatNumber(amountRemaining)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 text-center font-mono">
            Preview is scaled for display. PDF export generates exact uncompressed 300 DPI graphics matching your Illustrator artwork.
          </div>
        </div>
      </div>
    </div>
  );
}
