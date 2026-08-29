"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { CheckIcon, ChevronDownIcon } from "@/components/icons";

const steps = [
  { key: "initiated", label: "Initiated", state: "done" as const },
  { key: "approval", label: "Approval", state: "current" as const },
  { key: "processing", label: "Processing", state: "upcoming" as const },
  { key: "completed", label: "Completed", state: "upcoming" as const },
];

function StepCircle({ state }: { state: "done" | "current" | "upcoming" }) {
  if (state === "done") {
    return (
      <span className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
        <CheckIcon className="w-4 h-4 text-white" />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="w-8 h-8 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
      </span>
    );
  }
  return (
    <span className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 shrink-0" />
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[13px] text-slate-400">{label}</span>
      <span className="text-[13px] font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export default function ConfirmationPage() {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <AppShell>
      <TopBar title="Pay to" />

      <div className="p-8 md:p-10 pb-16 max-w-2xl">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-7 mb-7">
          <div className="flex items-start gap-4">
            <span className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5.5 h-5.5 text-amber-600"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3.2 2" />
              </svg>
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-900">
                Payment pending approval
              </h1>
              <p className="text-sm text-amber-800 mt-1">
                Your payment has been initiated and is awaiting approval from
                a company signatory.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-amber-200/70 flex items-end justify-between">
            <span className="text-sm font-semibold text-amber-800">
              Total amount
            </span>
            <span className="text-[26px] font-bold text-slate-900">
              KES 2,450.00
            </span>
          </div>
        </div>

        <div className="mb-7">
          <div className="flex items-center">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <StepCircle state={step.state} />
                  <span
                    className={`text-[11.5px] font-semibold whitespace-nowrap ${
                      step.state === "upcoming" ? "text-slate-400" : "text-slate-900"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 -mt-5 ${
                      step.state === "done" ? "bg-brand-600" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl mb-7 overflow-hidden">
          <button
            onClick={() => setDetailsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <span className="text-[13.5px] font-semibold text-slate-700">
              Details
            </span>
            <ChevronDownIcon
              className={`w-4 h-4 text-slate-400 transition-transform ${
                detailsOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {detailsOpen && (
            <div className="px-5 pb-4 divide-y divide-slate-100 border-t border-slate-100">
              <DetailRow label="Service" value="M-Pesa Mobile" />
              <DetailRow label="Reference" value="757346436" />
              <DetailRow label="Label" value="MAJI MAZURI FLOWERS LIMITED" />
              <DetailRow label="Payment source" value="Product Testing B (KES)" />
              <DetailRow label="Time" value="29/08/2026 21:04:09" />
              <DetailRow label="XPayor Reference" value="XPWGMCK2QE6A" />
            </div>
          )}
        </div>

        <Link
          href="/"
          className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm py-3.5 rounded-lg mb-3 transition-colors"
        >
          View Transactions
        </Link>

        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
            Save as Beneficiary
          </button>
          <Link
            href="/pay"
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-600 hover:bg-slate-50 text-center"
          >
            Make another transfer
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
