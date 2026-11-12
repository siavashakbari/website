export interface InvoiceItem {
  id: string;
  description: string;
  subDescription?: string; // 2px smaller, Gotham X Narrow Book (font-normal)
  rate: number;
  quantity: number;
}

export interface BankInfo {
  id?: string;
  accountHolder: string;
  bankName: string;
  cardNumber: string;
  shebaNumber: string;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  issueDateShamsi: string;
  issueDateGregorian?: string;
  clientName: string;
  currency: "IRR" | "TOMAN";
  items: InvoiceItem[];
  advancePayment: number;
  bankInfo: BankInfo;
  includeSignature: boolean; // Toggle for "Sign it?"
  notes?: string;
  createdAt: string;
}

export const DEFAULT_BANK_INFO: BankInfo = {
  id: "new-bank-account",
  accountHolder: "",
  bankName: "",
  cardNumber: "",
  shebaNumber: "",
};

export const PRESET_BANK_CARDS: BankInfo[] = [];

export const INITIAL_INVOICE_DATA: InvoiceData = {
  id: "new-invoice",
  invoiceNumber: "",
  issueDateShamsi: "",
  clientName: "",
  currency: "IRR",
  items: [{ id: "item-1", description: "", subDescription: "", rate: 0, quantity: 1 }],
  advancePayment: 0,
  bankInfo: DEFAULT_BANK_INFO,
  includeSignature: true,
  createdAt: new Date().toISOString(),
};
