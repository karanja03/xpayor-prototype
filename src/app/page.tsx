"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { avatarFor } from "@/lib/avatar";
import { formatDate, formatKES } from "@/lib/format";
import { getTransactions, type Transaction } from "@/lib/store";

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const pending = transactions.filter((t) => t.status === "Pending");
  const pendingTotal = pending.reduce((sum, t) => sum + t.amount, 0);

  const now = new Date();
  const paidThisMonth = transactions.filter((t) => {
    if (t.status !== "Completed") return false;
    const d = new Date(t.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const paidTotal = paidThisMonth.reduce((sum, t) => sum + t.amount, 0);

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

          <Link
            href="/tasks"
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-300 transition-colors"
          >
            <div className="text-[12.5px] font-semibold text-slate-400 mb-2.5">
              PENDING APPROVAL
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatKES(pendingTotal)}
            </div>
            <div className="text-xs font-semibold text-amber-600 mt-1.5">
              {pending.length} transaction{pending.length === 1 ? "" : "s"} awaiting sign-off
            </div>
          </Link>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-[12.5px] font-semibold text-slate-400 mb-2.5">
              PAID OUT THIS MONTH
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatKES(paidTotal)}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1.5">
              across {paidThisMonth.length} payments
            </div>
          </div>
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
              No activity yet.
            </div>
          )}
          {recent.map((row) => {
            const avatar = avatarFor(row.to);
            return (
              <div
                key={row.id}
                className="flex items-center gap-3.5 px-4.5 py-3.5 border-b border-slate-100 last:border-b-0"
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
                  <div className="text-xs text-slate-400 mt-0.5">
                    {row.to === row.service ? formatDate(row.createdAt) : row.service}
                  </div>
                </div>
                <div className="text-[13.5px] font-semibold text-slate-900 mr-4">
                  {formatKES(row.amount)}
                </div>
                <span
                  className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[row.status]} shrink-0`}
                >
                  {row.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
