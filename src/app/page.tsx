"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { ArrowUpCircleIcon, EyeIcon, RefreshIcon } from "@/components/icons";
import { accounts } from "@/lib/accounts";
import { avatarFor } from "@/lib/avatar";
import { formatDate, formatKES } from "@/lib/format";
import { getTransactions, type Transaction } from "@/lib/store";

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const recent = transactions.slice(0, 5);

  const statusStyles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-800",
    Completed: "bg-green-50 text-green-700",
    Cancelled: "bg-slate-100 text-slate-500",
    Failed: "bg-red-50 text-red-700",
  };

  return (
    <AppShell>
      <TopBar title="Home" showPay />

      <div className="p-4 sm:p-8 md:p-10">
        <div className="mb-7">
          <h1 className="text-[21px] font-bold text-slate-900">
            Welcome, Wambui
          </h1>
          <p className="text-[13.5px] text-slate-400 mt-1">
            Here&apos;s your business overview.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-slate-200 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <ArrowUpCircleIcon className="w-[18px] h-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-slate-900 truncate">
                      {a.name}
                    </div>
                    <div className="text-[12px] text-slate-400 flex items-center gap-1 mt-0.5">
                      {a.category} &middot; {a.masked}
                      <EyeIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
                <button
                  className="text-slate-300 hover:text-slate-500 shrink-0"
                  aria-label="Refresh balance"
                >
                  <RefreshIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {formatKES(a.balance)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[15px] font-semibold text-slate-900">
            Recent activity
          </h2>
          <Link
            href="/transactions"
            className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
          >
            View all
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {recent.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-slate-400">
              Nothing here yet &mdash; payments you initiate will show up here.
            </div>
          )}
          {recent.map((row) => {
            const avatar = avatarFor(row.to);
            return (
              <div
                key={row.id}
                className="flex items-center gap-3 sm:gap-3.5 px-3.5 sm:px-4.5 py-3.5 border-b border-slate-100 last:border-b-0"
              >
                <div
                  className={`w-9.5 h-9.5 rounded-[10px] ${avatar.bg} ${avatar.fg} flex items-center justify-center text-xs font-bold shrink-0`}
                >
                  {avatar.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-slate-900 truncate">
                    {row.to}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400 truncate">
                      {row.to === row.service ? formatDate(row.createdAt) : row.service}
                    </span>
                    <span
                      className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[row.status]} shrink-0`}
                    >
                      {row.status}
                    </span>
                  </div>
                </div>
                <div className="text-[13.5px] font-semibold text-slate-900 text-right shrink-0">
                  {formatKES(row.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
