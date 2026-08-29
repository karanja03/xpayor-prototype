import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[13.5px] text-slate-400">{label}</span>
      <span className="text-[13.5px] font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <AppShell>
      <TopBar title="Review and send" backHref="/pay/mpesa-mobile" />

      <div className="p-8 md:p-10 pb-16 max-w-2xl">
        <p className="text-sm text-slate-400 mb-1">Paying M-Pesa Mobile</p>
        <div className="text-[32px] font-bold text-slate-900 mb-8">
          KES 2,450.00
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
          <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-wide mb-1">
            Invoice details
          </h2>
          <div className="divide-y divide-slate-100">
            <Row label="Service" value="M-Pesa Mobile" />
            <Row label="Reference" value="757346436" />
            <Row label="Label" value="MAJI MAZURI FLOWERS LIMITED" />
            <Row label="Payment source" value="Product Testing B (KES)" />
            <Row label="Currency" value="Kenyan Shilling" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
          <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-wide mb-1">
            Payment details
          </h2>
          <div className="divide-y divide-slate-100">
            <Row label="Amount" value="KES 2,450.00" />
          </div>
          <div className="flex items-center justify-between pt-3.5 mt-1 border-t border-slate-200">
            <span className="text-sm font-bold text-slate-900">Total amount</span>
            <span className="text-base font-bold text-slate-900">KES 2,450.00</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/pay/mpesa-mobile"
            className="px-5 py-3 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
          <Link
            href="/pay/confirmation"
            className="flex-1 sm:flex-none sm:px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold text-center transition-colors"
          >
            Send
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
