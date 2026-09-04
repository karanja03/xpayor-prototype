"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import {
  AlertCircleIcon,
  AttachmentIcon,
  ChevronDownIcon,
  DescriptionIcon,
  SearchIcon,
  UploadCloudIcon,
} from "@/components/icons";
import { paymentLabels } from "@/lib/data";
import { addCustomLabel, getCustomLabels } from "@/lib/store";
import { accounts, sourceAccountLabel } from "@/lib/accounts";
import { formatMoney } from "@/lib/format";

type FieldConfig = { key: string; label: string; placeholder: string };

// Kenyan mobile numbers: 07xx/01xx xxx xxx, optionally with a 254 or +254
// country code prefix.
function isValidKenyanPhone(raw: string): boolean {
  const digits = raw.replace(/[\s-]/g, "");
  return /^(?:\+254|254|0)(7|1)\d{8}$/.test(digits);
}

function methodName(method: string) {
  if (method === "mpesa") return "M-Pesa";
  if (method === "airtel") return "Airtel Money";
  if (method === "bank") return "Bank Transfer";
  if (method === "intl") return "International Transfer";
  if (method === "business") return "Business Payment";
  if (method === "government") return "Government Payment";
  if (method === "utility") return "Bill Payment";
  if (method === "internal") return "Internal Transfer";
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
  if (method === "business" || method === "government" || method === "utility") {
    // The recipient's account/bank details are already on file for these -
    // all that's needed is which bill/invoice this payment is for.
    return [{ key: "reference", label: "Reference Number", placeholder: "e.g. INV-00234" }];
  }
  if (method === "internal") {
    // Wallet-to-wallet within the business - nothing to collect beyond amount.
    return [];
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
  const title =
    method === "internal" && payee
      ? `Transfer to ${payee}`
      : payee
        ? `Pay ${payee}`
        : `Pay ${service}`;

  const availableSourceAccounts = useMemo(
    () => (method === "internal" && payee ? accounts.filter((a) => a.name !== payee) : accounts),
    [method, payee]
  );

  const [batchMode, setBatchMode] = useState<"single" | "batch">("single");
  const [batchFileName, setBatchFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"KES" | "USD">("KES");
  const [sourceAccount, setSourceAccount] = useState(() =>
    sourceAccountLabel(availableSourceAccounts[0] ?? accounts[0])
  );
  const [sourceOpen, setSourceOpen] = useState(false);
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

  // Business/Government/Utility payees already have their bank details on
  // file - the reference just needs to be checked against a real bill/invoice
  // before the payment can proceed, so those methods get a "Validate" step
  // instead of continuing straight through.
  const requiresValidation = method === "business" || method === "government" || method === "utility";
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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

  const singleFieldsValid =
    fields.every((f) => {
      const v = (fieldValues[f.key] ?? "").trim();
      if (!v) return false;
      if (f.key === "phone") return isValidKenyanPhone(v);
      return true;
    }) && Number(amount) > 0;

  const canSubmit =
    (batchMode === "batch" ? !!batchFileName : singleFieldsValid) &&
    !(requiresValidation && !!validationError);

  function handleContinue() {
    if (batchMode === "single" && !singleFieldsValid) return;
    if (batchMode === "batch" && !batchFileName) return;
    const params = new URLSearchParams();
    params.set("method", method);
    params.set("type", type);
    if (payee) params.set("payee", payee);
    params.set("mode", batchMode);
    params.set("label", selectedLabel || payee);
    params.set("source", sourceAccount);
    params.set("saveBen", saveBeneficiary ? "1" : "0");
    if (description.trim()) params.set("description", description.trim());

    if (batchMode === "batch") {
      params.set("reference", batchFileName ?? "");
    } else {
      params.set("reference", Object.values(fieldValues).filter(Boolean).join(" - "));
      for (const f of fields) params.set(f.key, fieldValues[f.key] ?? "");
      params.set("amount", amount);
      params.set("currency", currency);
    }

    router.push(`/pay/review?${params.toString()}`);
  }

  async function runValidation() {
    setValidating(true);
    setValidationError(null);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const ref = (fieldValues.reference ?? "").trim();
    // Demo-only simulated bill lookup: a reference that's shaped like a phone
    // number isn't a real invoice/PRN for this recipient, so it fails the
    // same way an unrecognized reference would against a real billing API.
    const looksLikeAPhoneNumber = isValidKenyanPhone(ref);
    setValidating(false);
    if (looksLikeAPhoneNumber) {
      setValidationError("Bill is either paid or does not exist");
      return;
    }
    handleContinue();
  }

  function handlePrimaryAction() {
    if (!canSubmit || validating) return;
    if (requiresValidation) {
      void runValidation();
    } else {
      handleContinue();
    }
  }

  function handleBatchFile(file: File | null | undefined) {
    if (!file) return;
    setBatchFileName(file.name);
  }

  return (
    <AppShell>
      <TopBar title={title} backHref="/pay" />

      <div className="p-4 sm:p-8 md:p-10 pb-16 max-w-2xl mx-auto">
        <div className="mb-6 relative">
          <label className="block text-[13px] font-semibold text-slate-700 mb-2">
            Source Account
          </label>
          <button
            type="button"
            onClick={() => setSourceOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <span>{sourceAccount}</span>
            <ChevronDownIcon
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${sourceOpen ? "rotate-180" : ""}`}
            />
          </button>
          {sourceOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSourceOpen(false)} />
              <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-lg py-1.5">
                {availableSourceAccounts.map((a) => {
                  const label = sourceAccountLabel(a);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setSourceAccount(label);
                        setSourceOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-sm hover:bg-slate-50 ${
                        label === sourceAccount ? "font-semibold text-brand-600" : "text-slate-900"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-slate-700 mb-2">
            Payment type
          </label>
          <div className="flex gap-5">
            {(["single", "batch"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setBatchMode(mode)}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                    batchMode === mode ? "border-brand-600" : "border-slate-300"
                  }`}
                >
                  {batchMode === mode && (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                  )}
                </span>
                <span
                  className={
                    batchMode === mode
                      ? "font-semibold text-slate-900"
                      : "font-medium text-slate-500"
                  }
                >
                  {mode === "single" ? "Single" : "Batch File"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {batchMode === "single" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {fields.map((f) => {
              const value = fieldValues[f.key] ?? "";
              const phoneInvalid = f.key === "phone" && value.trim() && !isValidKenyanPhone(value);
              const referenceInvalid = f.key === "reference" && !!validationError;
              const hasError = phoneInvalid || referenceInvalid;
              return (
                <div key={f.key}>
                  <label className="block text-[13px] font-semibold text-brand-600 mb-2">
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      setFieldValues((prev) => ({ ...prev, [f.key]: e.target.value }));
                      if (f.key === "reference" && validationError) setValidationError(null);
                    }}
                    placeholder={f.placeholder}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-sm text-slate-900 outline-none ${
                      hasError ? "border-red-400" : "border-brand-500"
                    }`}
                  />
                  {phoneInvalid && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1.5">
                      <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                      Enter a valid phone number, e.g. 07XX XXX XXX
                    </p>
                  )}
                  {referenceInvalid && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1.5">
                      <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                      {validationError}
                    </p>
                  )}
                </div>
              );
            })}
            <div className={fields.length > 1 ? "sm:col-span-2 max-w-xs" : ""}>
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
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "KES" | "USD")}
                  className="pl-3 pr-2 bg-slate-50 border-l border-slate-200 text-sm font-semibold text-slate-600 outline-none"
                >
                  <option value="KES">🇰🇪 KES</option>
                  <option value="USD">🇺🇸 USD</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[13px] font-semibold text-slate-700">
                Upload payments file
              </label>
              <a
                href="/xpayor-batch-template.csv"
                download
                className="text-[12.5px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <UploadCloudIcon className="w-3.5 h-3.5 rotate-180" />
                Download template
              </a>
            </div>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleBatchFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex flex-col items-center justify-center gap-2 px-6 py-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-brand-500 bg-brand-50"
                  : "border-slate-300 hover:border-slate-400"
              }`}
            >
              <UploadCloudIcon className="w-7 h-7 text-slate-400" />
              <div className="text-sm font-semibold text-slate-700">
                {batchFileName ?? "Drag & drop a file, or click to select"}
              </div>
              <div className="text-xs text-slate-400">
                Supported: CSV, XLS, XLSX &middot; Max size: 5MB
              </div>
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={(e) => handleBatchFile(e.target.files?.[0])}
              />
            </label>
            {!batchFileName && (
              <p className="text-xs text-amber-700 mt-2">
                Upload a file to continue.
              </p>
            )}
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

        {batchMode === "single" && (
          <>
            <div className="h-px bg-slate-200 mb-5" />
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold text-slate-900">Total</span>
              <span className="text-base font-bold text-slate-900">
                {formatMoney(Number(amount) || 0, currency)}
              </span>
            </div>
          </>
        )}

        <div className="h-px bg-slate-200 mb-6" />

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/pay")}
            className="px-5 py-3 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
          <button
            onClick={handlePrimaryAction}
            disabled={!canSubmit || validating}
            className="flex-1 sm:flex-none sm:px-8 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:hover:bg-brand-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {validating ? "Validating..." : requiresValidation ? "Validate" : "Continue"}
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
