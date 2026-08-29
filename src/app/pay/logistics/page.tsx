"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { SearchIcon, ShipIcon } from "@/components/icons";
import { usePaymentFlowModal } from "@/components/usePaymentFlowModal";
import { logisticsAll } from "@/lib/data";

export default function LogisticsAllPage() {
  const [query, setQuery] = useState("");
  const { openFor, modal } = usePaymentFlowModal();

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logisticsAll;
    return logisticsAll.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <AppShell>
      <TopBar title="Logistics & Freight" backHref="/pay" />

      <div className="p-8 md:p-10 pb-16">
        <div className="relative mb-5 max-w-xl">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search logistics & freight..."
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="text-[12.5px] font-semibold text-slate-400 mb-4">
          Showing {list.length} of {logisticsAll.length}, A&ndash;Z
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 bg-white border border-slate-200 rounded-xl p-2">
          {list.map((p) => (
            <button
              key={p.name}
              onClick={() => openFor(p.name)}
              className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg hover:bg-slate-50 text-left transition-colors"
            >
              <div
                className={`w-8.5 h-8.5 rounded-[9px] ${p.bg} ${p.fg} flex items-center justify-center shrink-0`}
              >
                <ShipIcon className="w-4 h-4" />
              </div>
              <div className="text-[13.5px] font-semibold text-slate-900 truncate">
                {p.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {modal}
    </AppShell>
  );
}
