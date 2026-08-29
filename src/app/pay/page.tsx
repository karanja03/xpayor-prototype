"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { CloseIcon, SearchIcon } from "@/components/icons";
import {
  allPayToOptions,
  directTransfers,
  governmentPayees,
  logisticsShown,
  recentPayees,
  utilityPayees,
  type Payee,
} from "@/lib/data";

function Tile({ payee, onClick }: { payee: Payee; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 w-[148px] px-2.5 py-4 border border-slate-200 rounded-xl bg-white hover:border-brand-500 hover:shadow-sm transition-colors text-center"
    >
      <div
        className={`w-11 h-11 rounded-[11px] ${payee.bg} ${payee.fg} flex items-center justify-center text-xs font-bold`}
      >
        {payee.initials}
      </div>
      <div className="text-[12.5px] font-semibold text-slate-900 leading-tight">
        {payee.name}
      </div>
    </button>
  );
}

function CategorySection({
  title,
  items,
  onTileClick,
  viewAllHref,
  viewAllLabel,
  last = false,
}: {
  title: string;
  items: Payee[];
  onTileClick: (name: string) => void;
  viewAllHref?: string;
  viewAllLabel?: string;
  last?: boolean;
}) {
  return (
    <section className={last ? "" : "mb-8"}>
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">
          {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-[12.5px] font-semibold text-brand-600 hover:text-brand-700"
          >
            {viewAllLabel}
          </Link>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {items.map((p) => (
          <Tile key={p.name} payee={p} onClick={() => onTileClick(p.name)} />
        ))}
      </div>
    </section>
  );
}

const typeOptions = [
  { key: "mobile", label: "Mobile", sub: "Mobile Number" },
  { key: "paybill", label: "Paybill", sub: "Paybill Number" },
  { key: "till", label: "Till", sub: "Till Number" },
] as const;

export default function PayToPage() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] =
    useState<(typeof typeOptions)[number]["key"]>("mobile");
  const router = useRouter();

  const hasQuery = query.trim().length > 0;
  const matches = useMemo(() => {
    if (!hasQuery) return [];
    const q = query.toLowerCase();
    return allPayToOptions.filter((p) => p.name.toLowerCase().includes(q));
  }, [query, hasQuery]);

  function handleTileClick(name: string) {
    if (name === "M-Pesa") setModalOpen(true);
  }

  return (
    <AppShell>
      <TopBar title="Pay to" backHref="/" />

      <div className="p-8 md:p-10 pb-16">
        <h1 className="text-[22px] font-bold text-slate-900 mb-5">
          Who are you paying?
        </h1>

        <div className="relative mb-7">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search businesses, services, or accounts..."
            className="w-full max-w-xl pl-11 pr-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {hasQuery ? (
          <div>
            <div className="text-[13px] font-bold text-slate-500 uppercase tracking-wide mb-3.5">
              {matches.length} result{matches.length === 1 ? "" : "s"} for &ldquo;
              {query}&rdquo;
            </div>
            {matches.length === 0 ? (
              <div className="text-sm text-slate-400">
                No matches. Try a different name.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-w-xl">
                {matches.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handleTileClick(p.name)}
                    className="flex items-center gap-3 px-3.5 py-3 border border-slate-200 rounded-lg bg-white hover:border-brand-500 text-left transition-colors"
                  >
                    <div
                      className={`w-9.5 h-9.5 rounded-[10px] ${p.bg} ${p.fg} flex items-center justify-center text-[11px] font-bold shrink-0`}
                    >
                      {p.initials}
                    </div>
                    <div className="text-[13.5px] font-semibold text-slate-900">
                      {p.name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <section className="mb-8">
              <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-wide mb-3.5">
                Recent &amp; frequent
              </h2>
              <div className="flex gap-5.5 flex-wrap">
                {recentPayees.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handleTileClick(p.name)}
                    className="flex flex-col items-center gap-2 w-20"
                  >
                    <div
                      className={`w-13 h-13 rounded-full ${p.bg} ${p.fg} flex items-center justify-center text-[13px] font-bold`}
                    >
                      {p.initials}
                    </div>
                    <div className="text-[11.5px] font-semibold text-slate-600 text-center leading-tight truncate w-full">
                      {p.name}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <div className="h-px bg-slate-200 mb-7" />

            <CategorySection
              title="Government & Statutory"
              items={governmentPayees}
              onTileClick={handleTileClick}
            />
            <CategorySection
              title="Logistics & Freight"
              items={logisticsShown}
              onTileClick={handleTileClick}
              viewAllHref="/pay/logistics"
              viewAllLabel="View all 32 →"
            />
            <CategorySection
              title="Direct Transfers"
              items={directTransfers}
              onTileClick={handleTileClick}
            />
            <CategorySection
              title="Utilities & Billers"
              items={utilityPayees}
              onTileClick={handleTileClick}
              last
            />
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/45 flex items-center justify-center z-50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-[420px] p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5.5">
              <h3 className="text-[17px] font-bold text-slate-900">
                Select M-Pesa Payment Type
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-5 h-5 text-slate-400 hover:text-slate-600"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 mb-5.5">
              {typeOptions.map((opt) => {
                const selected = selectedType === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedType(opt.key)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border-[1.5px] text-left transition-colors ${
                      selected
                        ? "border-brand-600 bg-brand-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span
                      className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selected ? "border-brand-600" : "border-slate-300"
                      }`}
                    >
                      {selected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">
                        {opt.label}
                      </span>
                      <span className="block text-xs text-slate-400 mt-0.5">
                        {opt.sub}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => router.push(`/pay/mpesa-mobile?type=${selectedType}`)}
              className="w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm py-3 rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
