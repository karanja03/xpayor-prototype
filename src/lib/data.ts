export type Payee = {
  name: string;
  initials: string;
  bg: string;
  fg: string;
  href?: string;
  // Optional brand logo, e.g. "/logos/mpesa.png". Drop the file in
  // public/logos/ and it's picked up automatically - the Tile component
  // falls back to the initials badge above if the file isn't there yet.
  logo?: string;
};

export const recentPayees: Payee[] = [
  { name: "M-Pesa", initials: "M", bg: "bg-emerald-50", fg: "text-emerald-600", logo: "/logos/mpesa.png" },
  { name: "KRA", initials: "KRA", bg: "bg-emerald-800", fg: "text-white", logo: "/logos/kra.png" },
  { name: "Africa Cargo Handling Ltd", initials: "ACHL", bg: "bg-orange-50", fg: "text-orange-700" },
  { name: "Mitchell Cotts CFS", initials: "MC", bg: "bg-slate-100", fg: "text-slate-600" },
  { name: "eCitizen", initials: "eC", bg: "bg-green-700", fg: "text-white", logo: "/logos/ecitizen.png" },
];

export const governmentPayees: Payee[] = [
  { name: "eCitizen", initials: "eC", bg: "bg-green-700", fg: "text-white", logo: "/logos/ecitizen.png" },
  { name: "KRA", initials: "KRA", bg: "bg-emerald-800", fg: "text-white", logo: "/logos/kra.png" },
  { name: "KPA", initials: "KPA", bg: "bg-blue-950", fg: "text-white" },
  { name: "NTSA", initials: "NTSA", bg: "bg-rose-900", fg: "text-white" },
  { name: "KEBS", initials: "KEBS", bg: "bg-teal-700", fg: "text-white" },
  { name: "SHA (NHIF)", initials: "SHA", bg: "bg-blue-800", fg: "text-white" },
];

export const logisticsShown: Payee[] = [
  { name: "Swissport", initials: "SP", bg: "bg-red-700", fg: "text-white" },
  { name: "Africa Cargo Handling Ltd (ACHL)", initials: "ACHL", bg: "bg-orange-50", fg: "text-orange-700" },
  { name: "Mitchell Cotts CFS", initials: "MC", bg: "bg-slate-100", fg: "text-slate-600" },
  { name: "Sharaf Shipping Agency (K) LTD", initials: "SSA", bg: "bg-slate-900", fg: "text-white" },
  { name: "Oceanfreight (MSC)", initials: "MSC", bg: "bg-blue-950", fg: "text-amber-300" },
  { name: "Diamond Shipping Services Ltd", initials: "DS", bg: "bg-cyan-700", fg: "text-white" },
];

export const logisticsAll: Payee[] = [
  "Africa Cargo Handling Limited (ACHL)",
  "Bandari Bonded Warehouse Ltd",
  "Bluewave Container Freight Station",
  "Bollore Logistics Kenya",
  "Coastal Bonded Terminal",
  "Continental Stevedoring & Warehousing",
  "DHL Global Forwarding",
  "Diamond Shipping Services Limited",
  "Dynamic Freight Solutions",
  "Eastland Container Depot",
  "Freightways International",
  "Gulf Shipping Agencies",
  "Harbour View CFS",
  "Interfreight Terminal Services",
  "Kencargo International Freight",
  "Kenfreight (E.A) Limited",
  "Kentainers Freight Station",
  "Kipevu Bulk Terminal",
  "Maersk Kenya Limited",
  "Mitchell Cotts Freight (K) Ltd",
  "MSC Kenya Limited",
  "Oceanfreight (E.A.) Ltd",
  "Portside Freight Station",
  "Rapid Cargo Handlers",
  "Sharaf Shipping Agency (K) Ltd",
  "Sharaf Shipping Agency (K) Ltd RCL",
  "Sharaf Shipping Agency (K) Ltd TSL",
  "Steel Freighters CFS",
  "Swissport Kenya Limited",
  "Tarpo Industries Freight",
  "Transworld Safaris Cargo",
  "Wilson Bonded Warehouse",
].map((name, i) => {
  const palette = [
    { bg: "bg-indigo-50", fg: "text-indigo-600" },
    { bg: "bg-slate-100", fg: "text-slate-600" },
    { bg: "bg-cyan-50", fg: "text-cyan-700" },
    { bg: "bg-violet-50", fg: "text-violet-700" },
    { bg: "bg-orange-50", fg: "text-orange-700" },
    { bg: "bg-green-50", fg: "text-green-700" },
  ];
  const words = name.replace(/[()&]/g, "").split(" ").filter((w) => w.length > 1);
  const initials = ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase();
  const p = palette[i % palette.length];
  return { name, initials, bg: p.bg, fg: p.fg };
});

export const directTransfers: Payee[] = [
  { name: "M-Pesa", initials: "M", bg: "bg-emerald-50", fg: "text-emerald-600", logo: "/logos/mpesa.png" },
  { name: "Airtel Money", initials: "A", bg: "bg-red-50", fg: "text-red-600", logo: "/logos/airtel.png" },
  { name: "Bank Transfer", initials: "B", bg: "bg-blue-50", fg: "text-blue-700" },
  { name: "Int'l Transfer", initials: "IT", bg: "bg-blue-50", fg: "text-blue-700" },
  { name: "Internal Transfer", initials: "IN", bg: "bg-purple-50", fg: "text-purple-700" },
];

export const utilityPayees: Payee[] = [
  { name: "Kenya Power (KPLC)", initials: "KP", bg: "bg-orange-50", fg: "text-orange-700" },
  { name: "Nairobi Water & Sewerage", initials: "NW", bg: "bg-sky-50", fg: "text-sky-700" },
  { name: "Africa's Talking", initials: "AT", bg: "bg-violet-50", fg: "text-violet-700" },
  { name: "Safaricom Postpaid", initials: "SF", bg: "bg-green-50", fg: "text-green-700" },
  { name: "TotalEnergies Fuel Card", initials: "TE", bg: "bg-red-50", fg: "text-red-700" },
  { name: "Zuku Business Internet", initials: "Z", bg: "bg-blue-50", fg: "text-blue-700" },
];

export const allPayToOptions: Payee[] = [
  ...governmentPayees,
  ...logisticsShown,
  ...directTransfers,
  ...utilityPayees,
];

export type PaymentLabel = { name: string; recent?: boolean };

export const paymentLabels: PaymentLabel[] = [
  { name: "MAJI MAZURI FLOWERS LIMITED", recent: true },
  { name: "Fontana Limited", recent: true },
  { name: "Meals and Entertainment - Expayor", recent: true },
  { name: "Bulk SMS - Africastalking" },
  { name: "Company accessories - Laptop Charger" },
  { name: "Diamond Shipping Services Limited" },
  { name: "HANNA ROSES LIMITED" },
  { name: "Maasai Flowers Limited" },
  { name: "Office Rent - Nairobi HQ" },
  { name: "Staff Welfare" },
  { name: "Team Travel & Accommodation" },
  { name: "Utilities - Kenya Power" },
];
