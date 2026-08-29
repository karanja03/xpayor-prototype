import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { recentActivity } from "@/lib/data";

export default function HomePage() {
  return (
    <AppShell>
      <TopBar title="Home" showPay />

      <div className="p-8 md:p-10">
        <div className="mb-7">
          <h1 className="text-[21px] font-bold text-slate-900">
            Good afternoon, Wambui
          </h1>
          <p className="text-[13.5px] text-slate-400 mt-1">
            Here&apos;s what&apos;s happening across your accounts today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-[12.5px] font-semibold text-slate-400 mb-2.5">
              TOTAL AVAILABLE BALANCE
            </div>
            <div className="text-2xl font-bold text-slate-900">
              KES 2,486,300
            </div>
            <div className="text-xs font-semibold text-green-600 mt-1.5">
              Across 4 accounts
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-[12.5px] font-semibold text-slate-400 mb-2.5">
              PENDING APPROVAL
            </div>
            <div className="text-2xl font-bold text-slate-900">
              KES 184,520
            </div>
            <div className="text-xs font-semibold text-amber-600 mt-1.5">
              7 transactions awaiting sign-off
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-[12.5px] font-semibold text-slate-400 mb-2.5">
              PAID OUT THIS MONTH
            </div>
            <div className="text-2xl font-bold text-slate-900">
              KES 1,092,760
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1.5">
              across 38 payments
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[15px] font-semibold text-slate-900">
            Recent activity
          </h2>
          <span className="text-[13px] font-semibold text-brand-600">
            View all
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {recentActivity.map((row) => (
            <div
              key={row.name}
              className="flex items-center gap-3.5 px-4.5 py-3.5 border-b border-slate-100 last:border-b-0"
            >
              <div
                className={`w-9.5 h-9.5 rounded-[10px] ${row.bg} ${row.fg} flex items-center justify-center text-xs font-bold shrink-0`}
              >
                {row.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-slate-900 truncate">
                  {row.name}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{row.meta}</div>
              </div>
              <div className="text-[13.5px] font-semibold text-slate-900 mr-4">
                {row.amount}
              </div>
              <span
                className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${row.statusBg} ${row.statusFg} shrink-0`}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
