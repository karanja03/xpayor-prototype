"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import {
  AttachmentIcon,
  ChevronDownIcon,
  DescriptionIcon,
  SearchIcon,
} from "@/components/icons";
import { paymentLabels } from "@/lib/data";
import { addCustomLabel, getCustomLabels } from "@/lib/store";
import { accounts, sourceAccountLabel } from "@/lib/accounts";

type FieldConfig = { key: string; label: string; placeholder: string };

function methodName(method: string) {
  if (method === "mpesa") return "M-Pesa";
  if (method === "airtel") return "Airtel Money";
  if (method === "bank") return "Bank Transfer";
  return "International Transfer";
}

function typeLabel(type: string) {
  if (type === "paybill") return "Paybill";
  if (type === "till") return "Till";
  return "Mobile";
}

export function serviceLabelFor(method: string, type: string) {
  if (method === "mpesa" || method === "airtel") return `${methodName(method)} ${typeLabel(type)}`;
  return methodName(method);
}

function getFields(method: string, type: string): FieldConfig[] {
  if (method === "mpesa" || method === "airtel") {
    if (type === "paybill") {
      return [
        { key: "paybill", label: "Paybill Number", placeholder: "e.g. 522522" },
        { key: "account", label: "Account Number", placeholder: "e.g. INV-00234" },
      ];
    }
    if (type === "till") {
      return [{ key: "till", label: "Till Number", placeholder: "e.g. 819430" }];
    }
    return [{ key: "phone", label: "Phone Number", placeholder: "07XX XXX XXX" }];
  }
  if (method === "bank") {
    return [
      { key: "accountNumber", label: "Account Number", placeholder: "e.g. 0123456789" },
      { key: "bankName", label: "Bank Name", placeholder: "e.g. NCBA Bank Kenya" },
    ];
  }
  if (method === "intl") {
    return [
      { key: "iban", label: "IBAN / Account Number", placeholder: "e.g. GB29 NWBK 6016 1331 9268 19" },
      { key: "swift", label: "SWIFT / BIC Code", placeholder: "e.g. NWBKGB2L" },
    ];
  }
  return [{ key: "phone", label: "Phone Number", placeholder: "07XX XXX XXX" }];
}

const recentLabelsStatic = paymentLabels.filter((l) => l.recent).map((l) => l.name);
const alphabeticalLabelsStatic = [...paymentLabels]
  .filter((l) => !l.recent)
  .map((l) => l.name)
  .sort((a, b) => a.localeCompare(b));

function PaymentFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const method = searchParams.get("method") ?? "mpesa";
  const type = searchParams.get("type") ?? "mobile";
  const payee = searchParams.get("payee") ?? "";

  const fields = useMemo(() => getFields(method, type), [method, type]);
  const service = serviceLabelFor(method, type);
  const title = payee ? `Pay ${payee}` : `Pay ${service}`;

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState("");
  const [sourceAccount, setSourceAccount] = useState(sourceAccountLabel(accounts[0]));
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);

  const [customLabels, setCustomLabels] = useState<string[]>([]);
  useEffect(() => {
    setCustomLabels(getCustomLabels());
  }, []);

  const [labelOpen, setLabelOpen] = useState(false);
  const [labelQuery, setLabelQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(payee);
  const labelInputRef = useRef<HTMLInputElement>(null);

  const [descOpen, setDescOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const allKnownLabels = useMemo(
    () => [...customLabels, ...recentLabelsStatic, ...alphabeticalLabelsStatic],
    [customLabels]
  );

  const filteredRecent = useMemo(() => {
    const pool = [...customLabels, ...recentLabelsStatic];
    const q = labelQuery.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter((l) => l.toLowerCase().includes(q));
  }, [labelQuery, customLabels]);

  const filteredAlphabetical = useMemo(() => {
    const q = labelQuery.trim().toLowerCase();
    if (!q) return alphabeticalLabelsStatic;
    return alphabeticalLabelsStatic.filter((l) => l.toLowerCase().includes(q));
  }, [labelQuery]);

  const trimmedQuery = labelQuery.trim();
  const exactMatch = allKnownLabels.some(
    (l) => l.toLowerCase() === trimmedQuery.toLowerCase()
  );
  const canCreateLabel = trimmedQuery.length > 0 && !exactMatch;

  function chooseLabel(name: string) {
    setSelectedLabel(name);
    setLabelOpen(false);
  }

  function createLabel() {
    addCustomLabel(trimmedQuery);
    setCustomLabels(getCustomLabels());
    chooseLabel(trimmedQuery);
  }

  function handleContinue() {
    const params = new URLSearchParams();
    params.set("method", method);
    params.set("type", type);
    if (payee) params.set("payee", payee);
    params.set("reference", Object.values(fieldValues).filter(Boolean).join(" - "));
    for (const f of fields) params.set(f.key, fieldValues[f.key] ?? "");
    params.set("amount", amount);
    params.set("label", selectedLabel || payee);
    params.set("source", sourceAccount);
    params.set("saveBen", saveBeneficiary ? "1" : "0");
    router.push(`/pay/review?${params.toString()}`);
  }

  return (
    <AppShell>
      <TopBar title={title} backHref="/pay" />

      <div className="p-4 sm:p-8 md:p-10 pb-16 max-w-2xl">
        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-slate-700 mb-2">
            Source Account
          </label>
          <div className="relative">
            <select
              value={sourceAccount}
              onChange={(e) => setSourceAccount(e.target.value)}
              className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              {accounts.map((a) => (
                <option key={a.id}>{sourceAccountLabel(a)}</option>
              ))}
            </select>
            <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-[13px] font-semibold text-brand-600 mb-2">
                {f.label}
              </label>
              <input
                type="text"
                value={fieldValues[f.key] ?? ""}
                onChange={(e) =>
                  setFieldValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
                className="w-full px-4 py-3 border-2 border-brand-500 rounded-lg text-sm text-slate-900 outline-none"
              />
            </div>
          ))}
          {fields.length === 1 && (
            <div>
              <label className="block text-[13px] font-semibold text-brand-600 mb-2">
                Amount
              </label>
              <div className="flex items-stretch border-2 border-brand-500 rounded-lg overflow-hidden">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 px-4 py-3 text-sm text-slate-900 outline-none min-w-0"
                />
                <div className="flex items-center gap-1.5 px-3 bg-slate-50 border-l border-slate-200 text-sm font-semibold text-slate-600">
                  KES
                </div>
              </div>
            </div>
          )}
        </div>

        {fields.length > 1 && (
          <div className="mb-6 max-w-xs">
            <label className="block text-[13px] font-semibold text-brand-600 mb-2">
              Amount
            </label>
            <div className="flex items-stretch border-2 border-brand-500 rounded-lg overflow-hidden">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 px-4 py-3 text-sm text-slate-900 outline-none min-w-0"
              />
              <div className="flex items-center gap-1.5 px-3 bg-slate-50 border-l border-slate-200 text-sm font-semibold text-slate-600">
                KES
              </div>
            </div>
          </div>
        )}

        <label className="flex items-center gap-2.5 mb-6 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveBeneficiary}
            onChange={(e) => setSaveBeneficiary(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-[13px] font-medium text-slate-600">
            Save as a beneficiary for faster payments next time
          </span>
        </label>

        <div className="mb-6 relative">
          <label className="block text-[13px] font-semibold text-slate-700 mb-2">
            Payment Label (Optional)
          </label>
          <div className="relative">
            <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={labelInputRef}
              type="text"
              value={labelOpen ? labelQuery : selectedLabel}
              onFocus={() => {
                setLabelOpen(true);
                setLabelQuery("");
              }}
              onChange={(e) => setLabelQuery(e.target.value)}
              placeholder="Select or type label..."
              className="w-full pl-9.5 pr-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {labelOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLabelOpen(false)} />
              <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 overflow-auto py-1.5">
                {canCreateLabel && (
                  <>
                    <button
                      onClick={createLabel}
                      className="w-full text-left px-3.5 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 flex items-center gap-1.5"
                    >
                      <span className="text-base leading-none">+</span> Create &ldquo;
                      {trimmedQuery}&rdquo;
                    </button>
                    <div className="h-px bg-slate-100 my-1.5" />
                  </>
                )}
                {filteredRecent.length > 0 && (
                  <>
                    <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      Recent
                    </div>
                    {filteredRecent.map((name) => (
                      <button
                        key={name}
                        onClick={() => chooseLabel(name)}
                        className="w-full text-left px-3.5 py-2 text-sm text-slate-900 hover:bg-slate-50"
                      >
                        {name}
                      </button>
                    ))}
                    <div className="h-px bg-slate-100 my-1.5" />
                  </>
                )}
                {filteredAlphabetical.length > 0 ? (
                  filteredAlphabetical.map((name) => (
                    <button
                      key={name}
                      onClick={() => chooseLabel(name)}
                      className="w-full text-left px-3.5 py-2 text-sm text-slate-900 hover:bg-slate-50"
                    >
                      {name}
                    </button>
                  ))
                ) : filteredRecent.length === 0 && !canCreateLabel ? (
                  <div className="px-3.5 py-2 text-sm text-slate-400">
                    No matching labels
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>

        <label className="flex items-center gap-2.5 px-4 py-3.5 border border-dashed border-slate-300 rounded-lg text-sm font-semibold text-slate-500 mb-3 cursor-pointer hover:border-slate-400">
          <AttachmentIcon className="w-4 h-4" />
          {fileName ? fileName : "Add Attachment (Optional)"}
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>

        <button
          onClick={() => setDescOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 px-4 py-3.5 border border-dashed border-slate-300 rounded-lg text-sm font-semibold text-slate-500 mb-8 hover:border-slate-400"
        >
          <DescriptionIcon className="w-4 h-4" />
          Add Payment Description (Optional)
        </button>
        {descOpen && (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this payment for?"
            rows={3}
            className="w-full -mt-6 mb-8 px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/pay")}
            className="px-5 py-3 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 sm:flex-none sm:px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </AppShell>
  );
}

export default function PaymentFormPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFormInner />
    </Suspense>
  );
}
