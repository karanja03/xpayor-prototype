"use client";

import { Suspense, useMemo, useRef, useState } from "react";
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

const typeMeta: Record<string, { title: string; fieldLabel: string; placeholder: string }> = {
  mobile: { title: "Pay M-Pesa Mobile", fieldLabel: "Phone Number", placeholder: "07XX XXX XXX" },
  paybill: { title: "Pay M-Pesa Paybill", fieldLabel: "Paybill Number", placeholder: "e.g. 522522" },
  till: { title: "Pay M-Pesa Till", fieldLabel: "Till Number", placeholder: "e.g. 819430" },
};

const recentLabels = paymentLabels.filter((l) => l.recent);
const alphabeticalLabels = [...paymentLabels]
  .filter((l) => !l.recent)
  .sort((a, b) => a.name.localeCompare(b.name));

function PaymentFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "mobile";
  const meta = typeMeta[type] ?? typeMeta.mobile;

  const [batchMode, setBatchMode] = useState<"single" | "batch">("single");
  const [fieldValue, setFieldValue] = useState("");
  const [amount, setAmount] = useState("");

  const [labelOpen, setLabelOpen] = useState(false);
  const [labelQuery, setLabelQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const labelInputRef = useRef<HTMLInputElement>(null);

  const [descOpen, setDescOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const filteredRecent = useMemo(() => {
    const q = labelQuery.trim().toLowerCase();
    if (!q) return recentLabels;
    return recentLabels.filter((l) => l.name.toLowerCase().includes(q));
  }, [labelQuery]);

  const filteredAlphabetical = useMemo(() => {
    const q = labelQuery.trim().toLowerCase();
    if (!q) return alphabeticalLabels;
    return alphabeticalLabels.filter((l) => l.name.toLowerCase().includes(q));
  }, [labelQuery]);

  return (
    <AppShell>
      <TopBar title={meta.title} backHref="/pay" />

      <div className="p-8 md:p-10 pb-16 max-w-2xl">
        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-slate-700 mb-2">
            Source Account
          </label>
          <div className="relative">
            <select className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
              <option>Product Testing B - KES 300.00</option>
              <option>Operations - KES 1,204,500.00</option>
              <option>Payroll - KES 82,000.00</option>
            </select>
            <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
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
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[13px] font-semibold text-brand-600 mb-2">
                {meta.fieldLabel}
              </label>
              <input
                type="text"
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                placeholder={meta.placeholder}
                className="w-full px-4 py-3 border-2 border-brand-500 rounded-lg text-sm text-slate-900 outline-none"
              />
            </div>
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
          </div>
        ) : (
          <div className="mb-6 px-4 py-6 border border-dashed border-slate-300 rounded-lg text-center text-sm text-slate-400">
            Upload a batch file (.csv) to pay multiple recipients at once.
          </div>
        )}

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
              <div
                className="fixed inset-0 z-40"
                onClick={() => setLabelOpen(false)}
              />
              <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 overflow-auto py-1.5">
                {filteredRecent.length > 0 && (
                  <>
                    <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      Recent
                    </div>
                    {filteredRecent.map((l) => (
                      <button
                        key={l.name}
                        onClick={() => {
                          setSelectedLabel(l.name);
                          setLabelOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-sm text-slate-900 hover:bg-slate-50"
                      >
                        {l.name}
                      </button>
                    ))}
                    <div className="h-px bg-slate-100 my-1.5" />
                  </>
                )}
                {filteredAlphabetical.length > 0 ? (
                  filteredAlphabetical.map((l) => (
                    <button
                      key={l.name}
                      onClick={() => {
                        setSelectedLabel(l.name);
                        setLabelOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-sm text-slate-900 hover:bg-slate-50"
                    >
                      {l.name}
                    </button>
                  ))
                ) : filteredRecent.length === 0 ? (
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
            onClick={() => router.push("/pay/review")}
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
