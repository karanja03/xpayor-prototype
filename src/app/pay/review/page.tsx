"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { serviceLabelFor } from "@/app/pay/details/page";
import { addBeneficiary, addTransaction, genXPayorRef } from "@/lib/store";
import { formatMoney } from "@/lib/format";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[13.5px] text-slate-400">{label}</span>
      <span className="text-[13.5px] font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function ReviewInner() {
  const router = useRouter();
  const params = useSearchParams();

  const method = params.get("method") ?? "mpesa";
  const type = params.get("type") ?? "mobile";
  const payee = params.get("payee") ?? "";
  const mode = params.get("mode") === "batch" ? "batch" : "single";
  const reference = params.get("reference") || "—";
  const currency = params.get("currency") || "KES";
  const amountRaw = params.get("amount") || "0";
  const label = params.get("label") || payee || "—";
  const source = params.get("source") || "Product Testing B (KES)";
  const saveBen = params.get("saveBen") === "1";

  const service = mode === "batch" ? "Batch File Upload" : serviceLabelFor(method, type);
  const amount = Number(amountRaw) || 0;
  // Prefer a named recipient, then whatever the payment was labelled, and only
  // fall back to the channel name when neither is known - repeating the
  // channel in "To" tells the reader nothing about who actually got paid.
  const to = payee || (label !== "—" ? label : service);

  function handleSend() {
    const id = genXPayorRef();
    addTransaction({
      id,
      service,
      reference,
      label,
      amount,
      currency,
      fromAccount: source,
      to,
      status: "Pending",
      createdBy: "Wambui Initiator",
      createdAt: new Date().toISOString(),
    });
    if (saveBen && reference && reference !== "—" && mode === "single") {
      addBeneficiary({
        name: label,
        method,
        type,
        account: reference,
        createdAt: new Date().toISOString(),
      });
    }
    router.push(`/pay/confirmation?ref=${id}`);
  }

  return (
    <AppShell>
      <TopBar title="Review and send" backHref="/pay/details" />

      <div className="p-4 sm:p-8 md:p-10 pb-16 max-w-2xl mx-auto">
        <p className="text-sm text-slate-400 mb-1">Paying {service}</p>
        <div className="text-[32px] font-bold text-slate-900 mb-8">
          {mode === "batch" ? reference : formatMoney(amount, currency)}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
          <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-wide mb-1">
            Invoice details
          </h2>
          <div className="divide-y divide-slate-100">
            <Row label="Service" value={service} />
            <Row label="Reference" value={reference} />
            <Row label="Label" value={label} />
            <Row label="Payment source" value={source} />
            <Row label="Currency" value={currency === "USD" ? "US Dollar" : "Kenyan Shilling"} />
          </div>
        </div>

        {mode === "batch" ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 text-sm text-slate-500">
            Individual amounts and recipients will be read from the uploaded
            file and confirmed before any payment is made.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Payment details
            </h2>
            <div className="divide-y divide-slate-100">
              <Row label="Amount" value={formatMoney(amount, currency)} />
            </div>
            <div className="flex items-center justify-between pt-3.5 mt-1 border-t border-slate-200">
              <span className="text-sm font-bold text-slate-900">Total amount</span>
              <span className="text-base font-bold text-slate-900">
                {formatMoney(amount, currency)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-3 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
          <button
            onClick={handleSend}
            className="flex-1 sm:flex-none sm:px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold text-center transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </AppShell>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={null}>
      <ReviewInner />
    </Suspense>
  );
}
