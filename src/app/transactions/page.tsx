"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { CloseIcon, SearchIcon } from "@/components/icons";
import {
  getTransactions,
  updateTransactionStatus,
  type Transaction,
  type TxStatus,
} from "@/lib/store";
import { formatDate, formatDateTime, formatKES } from "@/lib/format";

const statusStyles: Record<TxStatus, string> = {
  Pending: "bg-amber-50 text-amber-800",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-slate-100 text-slate-500",
  Failed: "bg-red-50 text-red-700",
};

export default function TransactionsPage() {
  const [list, setList] = useState<Transaction[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Transaction | null>(null);

  useEffect(() => {
    setList(getTransactions());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((t) => t.reference.toLowerCase().includes(q));
  }, [list, query]);

  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  function recall(id: string) {
    updateTransactionStatus(id, "Cancelled");
    setList(getTransactions());
    setActive((prev) => (prev && prev.id === id ? { ...prev, status: "Cancelled" } : prev));
  }

  return (
    <AppShell>
      <TopBar title="Transactions" backHref="/" />

      <div className="p-4 sm:p-8 md:p-10 pb-16">
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <div className="relative w-full max-w-xs">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Reference"
              className="w-full pl-9.5 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="text-[13.5px] font-semibold text-slate-500">
            Amount: <span className="text-slate-900">{formatKES(total)}</span>{" "}
            <span className="text-slate-400 font-normal">
              ({filtered.length} total)
            </span>
          </div>
        </div>

        {/* Table - medium screens and up */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="border-b border-slate-200">
                {["Service", "Reference", "Amount", "To", "Date", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[11.5px] font-bold text-slate-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setActive(t)}
                >
                  <td className="px-5 py-3.5 text-[13.5px] font-semibold text-slate-900">
                    {t.service}
                  </td>
                  <td className="px-5 py-3.5 text-[13.5px] text-slate-600">
                    {t.reference}
                  </td>
                  <td className="px-5 py-3.5 text-[13.5px] font-semibold text-slate-900">
                    {formatKES(t.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-[13.5px] text-slate-600">{t.to}</td>
                  <td className="px-5 py-3.5 text-[13.5px] text-slate-400">
                    {formatDate(t.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActive(t);
                      }}
                      className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">
                    No transactions match that reference.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cards - small screens */}
        <div className="md:hidden flex flex-col gap-2.5">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t)}
              className="bg-white border border-slate-200 rounded-xl p-4 text-left"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold text-slate-900 truncate">
                    {t.service}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">{t.to}</div>
                </div>
                <div className="text-[13.5px] font-semibold text-slate-900 text-right shrink-0">
                  {formatKES(t.amount)}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400 truncate">
                  {t.reference} &middot; {formatDate(t.createdAt)}
                </span>
                <span
                  className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusStyles[t.status]}`}
                >
                  {t.status}
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-10 text-center text-sm text-slate-400">
              No transactions match that reference.
            </div>
          )}
        </div>
      </div>

      {active && (
        <div
          className="fixed inset-0 bg-slate-900/45 flex items-end sm:items-center justify-center z-50"
          onClick={() => setActive(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-[460px] max-h-[85vh] overflow-auto p-6 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[17px] font-bold text-slate-900">Transaction Details</h3>
              <button
                onClick={() => setActive(null)}
                className="w-5 h-5 text-slate-400 hover:text-slate-600"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12.5px] text-slate-400 mb-5">{active.id}</p>

            <div className="bg-brand-50 rounded-xl p-4 mb-5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Amount
              </div>
              <div className="text-xl font-bold text-slate-900">
                {formatKES(active.amount)}
              </div>
            </div>

            <h4 className="text-[12.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Transaction Information
            </h4>
            <div className="divide-y divide-slate-100 mb-5">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-400">Service</span>
                <span className="text-[13px] font-semibold text-slate-900">
                  {active.service}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-400">Reference</span>
                <span className="text-[13px] font-semibold text-slate-900">
                  {active.reference}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-400">Label</span>
                <span className="text-[13px] font-semibold text-slate-900">
                  {active.label}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-400">Status</span>
                <span
                  className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[active.status]}`}
                >
                  {active.status}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-400">From Account</span>
                <span className="text-[13px] font-semibold text-slate-900">
                  {active.fromAccount}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-400">To</span>
                <span className="text-[13px] font-semibold text-slate-900">{active.to}</span>
              </div>
            </div>

            <h4 className="text-[12.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Approval Workflow
            </h4>
            <div className="flex items-center justify-between py-2.5 mb-5">
              <span className="text-[13px] text-slate-400">Created By</span>
              <span className="text-right">
                <span className="block text-[13px] font-semibold text-slate-900">
                  {active.createdBy}
                </span>
                <span className="block text-[11.5px] text-slate-400 mt-0.5">
                  {formatDateTime(active.createdAt)}
                </span>
              </span>
            </div>

            {active.status === "Pending" && (
              <button
                onClick={() => recall(active.id)}
                className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm py-3 rounded-lg transition-colors"
              >
                Recall Transaction
              </button>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
