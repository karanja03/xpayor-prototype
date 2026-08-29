"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { getTransactions, updateTransactionStatus, type Transaction } from "@/lib/store";
import { formatDateTime, formatKES } from "@/lib/format";

export default function TasksPage() {
  const [pending, setPending] = useState<Transaction[]>([]);

  function refresh() {
    setPending(getTransactions().filter((t) => t.status === "Pending"));
  }

  useEffect(() => {
    refresh();
  }, []);

  function decide(id: string, status: "Completed" | "Cancelled") {
    updateTransactionStatus(id, status);
    refresh();
  }

  return (
    <AppShell>
      <TopBar title="Tasks" backHref="/" />

      <div className="p-8 md:p-10 pb-16 max-w-2xl">
        <h1 className="text-[18px] font-bold text-slate-900 mb-1">
          Payments awaiting your approval
        </h1>
        <p className="text-[13.5px] text-slate-400 mb-6">
          Approve or decline pending payments initiated by your team.
        </p>

        {pending.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl px-6 py-14 text-center">
            <p className="text-sm text-slate-400">
              Nothing needs your approval right now.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-slate-200 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <div className="text-[14.5px] font-bold text-slate-900">
                      {t.to === t.service ? t.service : `${t.service} · ${t.to}`}
                    </div>
                    <div className="text-[12.5px] text-slate-400 mt-1">
                      Ref {t.reference} &middot; Initiated by {t.createdBy} on{" "}
                      {formatDateTime(t.createdAt)}
                    </div>
                  </div>
                  <div className="text-[16px] font-bold text-slate-900 whitespace-nowrap">
                    {formatKES(t.amount)}
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => decide(t.id, "Completed")}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-[13px] py-2.5 rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => decide(t.id, "Cancelled")}
                    className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-[13px] py-2.5 rounded-lg transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
