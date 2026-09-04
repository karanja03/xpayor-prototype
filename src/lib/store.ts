export type TxStatus = "Pending" | "Completed" | "Cancelled" | "Failed";

export type Transaction = {
  id: string;
  service: string;
  reference: string;
  label: string;
  description?: string;
  amount: number;
  currency: string;
  fromAccount: string;
  to: string;
  status: TxStatus;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  completedAt?: string;
  externalReference?: string;
  receiverName?: string;
};

// Internal transfers move money between the business's own wallets rather
// than out to a third party - shown as an incoming (credit) movement, while
// every other service is money leaving the business (debit).
export function isCreditTransaction(service: string): boolean {
  return service === "Internal Transfer";
}

export type Beneficiary = {
  name: string;
  method: string;
  type?: string;
  account: string;
  createdAt: string;
};

const TX_KEY = "xpayor_transactions_v1";
const LABELS_KEY = "xpayor_custom_labels_v1";
const BENEFICIARIES_KEY = "xpayor_beneficiaries_v1";

function daysAgo(n: number, h = 12, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function plusMinutes(iso: string, min: number): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + min);
  return d.toISOString();
}

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "XPWGMCK2QE6A",
    service: "M-Pesa Mobile",
    reference: "757346436",
    label: "MAJI MAZURI FLOWERS LIMITED",
    description: "Payment to 0757346436",
    amount: 2450,
    currency: "KES",
    fromAccount: "Product Testing B (KES)",
    to: "MAJI MAZURI FLOWERS LIMITED",
    status: "Pending",
    createdBy: "Wambui Initiator",
    createdAt: daysAgo(0, 21, 4),
  },
  {
    id: "XP4T9RN2L8HQ",
    service: "Bank Transfer",
    reference: "SSA-BT-001",
    label: "Sharaf Shipping Agency (K) LTD",
    description: "Freight & clearing invoice SSA-BT-001",
    amount: 145000,
    currency: "KES",
    fromAccount: "Operations (KES)",
    to: "Sharaf Shipping Agency (K) LTD",
    status: "Completed",
    createdBy: "Wambui Initiator",
    createdAt: daysAgo(0, 11, 42),
    approvedBy: "Wambui Approver",
    approvedAt: plusMinutes(daysAgo(0, 11, 42), 18),
    completedAt: plusMinutes(daysAgo(0, 11, 42), 22),
    externalReference: "SSA-INV-88231",
    receiverName: "Sharaf Shipping Agency (K) LTD",
  },
  {
    id: "XP2K7VD5M1PZ",
    service: "Bank Transfer",
    reference: "KRA-PAYE-08",
    label: "KRA",
    description: "PAYE remittance - August",
    amount: 62400,
    currency: "KES",
    fromAccount: "Payroll (KES)",
    to: "KRA",
    status: "Completed",
    createdBy: "Wambui Initiator",
    createdAt: daysAgo(0, 9, 10),
    approvedBy: "Wambui Approver",
    approvedAt: plusMinutes(daysAgo(0, 9, 10), 12),
    completedAt: plusMinutes(daysAgo(0, 9, 10), 15),
    externalReference: "KRA-PRN-0099421",
    receiverName: "Kenya Revenue Authority",
  },
  {
    id: "XP9F3QA6J2WL",
    service: "Bank Transfer",
    reference: "MC-CFS-114",
    label: "Mitchell Cotts CFS",
    description: "Container freight station charges",
    amount: 88000,
    currency: "KES",
    fromAccount: "Operations (KES)",
    to: "Mitchell Cotts CFS",
    status: "Completed",
    createdBy: "Wambui Initiator",
    createdAt: daysAgo(1, 15, 22),
    approvedBy: "Wambui Approver",
    approvedAt: plusMinutes(daysAgo(1, 15, 22), 9),
    completedAt: plusMinutes(daysAgo(1, 15, 22), 13),
    externalReference: "MC-CFS-INV-114",
    receiverName: "Mitchell Cotts CFS",
  },
  {
    id: "XP6H1BC9X4RS",
    service: "Bank Transfer",
    reference: "ACHL-INV-77",
    label: "Africa Cargo Handling Ltd",
    description: "Cargo handling invoice #77",
    amount: 214900,
    currency: "KES",
    fromAccount: "Operations (KES)",
    to: "Africa Cargo Handling Ltd",
    status: "Completed",
    createdBy: "Wambui Initiator",
    createdAt: daysAgo(2, 10, 5),
    approvedBy: "Wambui Approver",
    approvedAt: plusMinutes(daysAgo(2, 10, 5), 25),
    completedAt: plusMinutes(daysAgo(2, 10, 5), 29),
    externalReference: "ACHL-INV-77",
    receiverName: "Africa Cargo Handling Ltd",
  },
  {
    id: "XP3D8ZP7Y5NK",
    service: "M-Pesa Till",
    reference: "4481444",
    label: "Office Supplies",
    description: "Payment to Till 4481444",
    amount: 3200,
    currency: "KES",
    fromAccount: "Product Testing B (KES)",
    to: "Office Supplies",
    status: "Completed",
    createdBy: "Wambui Initiator",
    createdAt: daysAgo(3, 14, 18),
    approvedBy: "Wambui Approver",
    approvedAt: plusMinutes(daysAgo(3, 14, 18), 4),
    completedAt: plusMinutes(daysAgo(3, 14, 18), 5),
    externalReference: "QK7F3M2NRX",
    receiverName: "Office Supplies Kenya Ltd",
  },
  {
    id: "XP5L2WQ8T3VC",
    service: "M-Pesa Paybill",
    reference: "880100 - 1003936361",
    label: "Utilities - Kenya Power",
    description: "Payment to Paybill 880100",
    amount: 18450,
    currency: "KES",
    fromAccount: "Operations (KES)",
    to: "Utilities - Kenya Power",
    status: "Completed",
    createdBy: "Wambui Initiator",
    createdAt: daysAgo(4, 8, 40),
    approvedBy: "Wambui Approver",
    approvedAt: plusMinutes(daysAgo(4, 8, 40), 7),
    completedAt: plusMinutes(daysAgo(4, 8, 40), 8),
    externalReference: "RK4G9T1QWL",
    receiverName: "Kenya Power & Lighting Co.",
  },
  {
    id: "XP7N4RM1K9DJ",
    service: "Bank Transfer",
    reference: "MC-ON-SIN-EXT-KRA",
    label: "KRA",
    description: "Test payment",
    amount: 10,
    currency: "KES",
    fromAccount: "Product Testing B (KES)",
    to: "KRA",
    status: "Failed",
    createdBy: "Wambui Initiator",
    createdAt: daysAgo(4, 16, 2),
  },
  {
    id: "XP1QY6ZC3B8F",
    service: "Internal Transfer",
    reference: "Transfer for tests",
    label: "XPayor Base Account",
    description: "Internal Transfer - XPayor Account",
    amount: 200,
    currency: "KES",
    fromAccount: "Product Testing B (KES)",
    to: "XPayor Base Account",
    status: "Completed",
    createdBy: "Wambui Initiator",
    createdAt: daysAgo(5, 9, 0),
    approvedBy: "Wambui Approver",
    approvedAt: plusMinutes(daysAgo(5, 9, 0), 3),
    completedAt: plusMinutes(daysAgo(5, 9, 0), 3),
  },
  {
    id: "XP8W2XE4G6TL",
    service: "Internal Transfer",
    reference: "Internal_transfer",
    label: "XPayor Base Account",
    description: "Internal Transfer - XPayor Account",
    amount: 5000,
    currency: "KES",
    fromAccount: "Operations (KES)",
    to: "XPayor Base Account",
    status: "Cancelled",
    createdBy: "Wambui Initiator",
    createdAt: daysAgo(11, 13, 15),
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable; fail silently, this is a demo prototype
  }
}

export function getTransactions(): Transaction[] {
  const seeded = isBrowser() && window.localStorage.getItem(TX_KEY);
  if (!seeded) writeJSON(TX_KEY, SEED_TRANSACTIONS);
  const list = readJSON<Transaction[]>(TX_KEY, SEED_TRANSACTIONS);
  return [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getTransaction(id: string): Transaction | undefined {
  return getTransactions().find((t) => t.id === id);
}

export function addTransaction(tx: Transaction) {
  const list = readJSON<Transaction[]>(TX_KEY, SEED_TRANSACTIONS);
  writeJSON(TX_KEY, [tx, ...list]);
}

export function updateTransactionStatus(id: string, status: TxStatus) {
  const list = readJSON<Transaction[]>(TX_KEY, SEED_TRANSACTIONS);
  const next = list.map((t) => (t.id === id ? { ...t, status } : t));
  writeJSON(TX_KEY, next);
}

export function genReference(): string {
  return String(Math.floor(100000000 + Math.random() * 899999999));
}

export function genXPayorRef(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "XP";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function getCustomLabels(): string[] {
  return readJSON<string[]>(LABELS_KEY, []);
}

export function addCustomLabel(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const existing = getCustomLabels();
  if (existing.some((l) => l.toLowerCase() === trimmed.toLowerCase())) return;
  writeJSON(LABELS_KEY, [trimmed, ...existing]);
}

export function getBeneficiaries(): Beneficiary[] {
  return readJSON<Beneficiary[]>(BENEFICIARIES_KEY, []);
}

export function addBeneficiary(b: Beneficiary) {
  const existing = getBeneficiaries();
  if (existing.some((e) => e.account === b.account && e.method === b.method)) return;
  writeJSON(BENEFICIARIES_KEY, [b, ...existing]);
}
