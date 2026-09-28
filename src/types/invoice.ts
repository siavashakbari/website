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
  id: "blubank",
  accountHolder: "Siavash Akbari",
  bankName: "BluBank",
  cardNumber: "6219861835930404",
  shebaNumber: "IR700560611828005126957701",
};

export const PRESET_BANK_CARDS: BankInfo[] = [
  DEFAULT_BANK_INFO,
  {
    id: "mellat",
    accountHolder: "Siavash Akbari",
    bankName: "Bank Mellat",
    cardNumber: "6104337800000000",
    shebaNumber: "IR000120000000000000000000",
  },
  {
    id: "saman",
    accountHolder: "Siavash Akbari",
    bankName: "Saman Bank",
    cardNumber: "6219861000000000",
    shebaNumber: "IR000560000000000000000000",
  },
  {
    id: "pasargad",
    accountHolder: "Siavash Akbari",
    bankName: "Bank Pasargad",
    cardNumber: "5022291000000000",
    shebaNumber: "IR000570000000000000000000",
  },
];

export const INITIAL_INVOICE_DATA: InvoiceData = {
  id: "inv-05070501",
  invoiceNumber: "05070501",
  issueDateShamsi: "1405/07/05",
  clientName: "Vishnu Clinic",
  currency: "IRR",
  items: [
    {
      id: "item-1",
      description: "Daily Videography Fee",
      subDescription: "Full day studio & location cinematography",
      rate: 30000000,
      quantity: 3,
    },
    {
      id: "item-2",
      description: "Video Edit",
      subDescription: "Editing, color science & sound design",
      rate: 8000000,
      quantity: 8,
    },
  ],
  advancePayment: 0,
  bankInfo: DEFAULT_BANK_INFO,
  includeSignature: true,
  createdAt: new Date().toISOString(),
};
