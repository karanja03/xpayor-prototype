"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { CloseIcon, DownloadIcon, FilterIcon, SearchIcon } from "@/components/icons";
import { TransactionDetailsModal } from "@/components/TransactionDetailsModal";
import {
  getTransactions,
  updateTransactionStatus,
  type Transaction,
  type TxStatus,
} from "@/lib/store";
import { formatDate, formatKES, formatMoney } from "@/lib/format";

const statusStyles: Record<TxStatus, string> = {
  Pending: "bg-amber-50 text-amber-800",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-slate-100 text-slate-500",
  Failed: "bg-red-50 text-red-700",
};

const dateRanges = ["All Time", "Today", "This Week", "This Month"] as const;

function inRange(iso: string, range: (typeof dateRanges)[number]) {
  if (range === "All Time") return true;
  const d = new Date(iso);
  const now = new Date();
  if (range === "Today") return d.toDateString() === now.toDateString();
  if (range === "This Week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo;
  }
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function downloadCsv(rows: Transaction[]) {
  const header = ["Service", "Reference", "Label", "Amount", "Currency", "To", "Date", "Status"];
  const lines = rows.map((t) =>
    [t.service, t.reference, t.label, t.amount, t.currency, t.to, formatDate(t.createdAt), t.status]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "xpayor-transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function TransactionsPage() {
  const [list, setList] = useState<Transaction[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Transaction | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRange, setFilterRange] = useState<(typeof dateRanges)[number]>("All Time");

  useEffect(() => {
    setList(getTransactions());
  }, []);

  const serviceOptions = useMemo(
    () => Array.from(new Set(list.map((t) => t.service))).sort(),
    [list]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((t) => {
      if (q && !t.reference.toLowerCase().includes(q)) return false;
      if (filterService && t.service !== filterService) return false;
      if (filterStatus && t.status !== filterStatus) return false;
      if (!inRange(t.createdAt, filterRange)) return false;
      return true;
    });
  }, [list, query, filterService, filterStatus, filterRange]);

  const activeFilterCount = [filterService, filterStatus, filterRange !== "All Time" ? filterRange : ""].filter(
    Boolean
  ).length;

  // Amounts can be mixed currencies once USD payments exist; the running
  // total is a KES-denominated approximation for the header summary only.
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  function recall(id: string) {
    updateTransactionStatus(id, "Cancelled");
    setList(getTransactions());
    setActive((prev) => (prev && prev.id === id ? { ...prev, status: "Cancelled" } : prev));
  }

  function clearFilters() {
    setFilterService("");
    setFilterStatus("");
    setFilterRange("All Time");
  }

  return (
    <AppShell>
      <TopBar title="Transactions" backHref="/" />

      <div className="p-4 sm:p-8 md:p-10 pb-16 max-w-5xl mx-auto">
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Reference"
                className="w-full pl-9.5 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-600 bg-white hover:bg-slate-50"
            >
              <FilterIcon className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => downloadCsv(filtered)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-600 bg-white hover:bg-slate-50"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              Download Report
            </button>
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
                {["To", "Service", "Reference", "Amount", "Date", "Status", ""].map((h) => (
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
                    {t.to}
                  </td>
                  <td className="px-5 py-3.5 text-[13.5px] text-slate-500">{t.service}</td>
                  <td className="px-5 py-3.5 text-[13.5px] text-slate-600">
                    {t.reference}
                  </td>
                  <td className="px-5 py-3.5 text-[13.5px] font-semibold text-slate-900">
                    {formatMoney(t.amount, t.currency)}
                  </td>
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
                    {t.to}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">{t.service}</div>
                </div>
                <div className="text-[13.5px] font-semibold text-slate-900 text-right shrink-0">
                  {formatMoney(t.amount, t.currency)}
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

      {filtersOpen && (
        <div
          className="fixed inset-0 bg-slate-900/45 flex items-end sm:items-center justify-center z-50"
          onClick={() => setFiltersOpen(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-[420px] p-6 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[17px] font-bold text-slate-900">Filters</h3>
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-5 h-5 text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Service
                </label>
                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-brand-500"
                >
                  <option value="">All services</option>
                  {serviceOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-brand-500"
                >
                  <option value="">All statuses</option>
                  {(["Pending", "Completed", "Cancelled", "Failed"] as TxStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Date Range
                </label>
                <select
                  value={filterRange}
                  onChange={(e) => setFilterRange(e.target.value as (typeof dateRanges)[number])}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-brand-500"
                >
                  {dateRanges.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm py-3 rounded-lg transition-colors"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm py-3 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {active && (
        <TransactionDetailsModal
          transaction={active}
          onClose={() => setActive(null)}
          onRecall={recall}
        />
      )}
    </AppShell>
  );
}
