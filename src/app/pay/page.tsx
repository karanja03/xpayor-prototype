"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { FunctionComponent } from "react";
import {
  ArrowRightIcon,
  BankBuildingIcon,
  BoltIcon,
  GlobeIcon,
  GovBuildingIcon,
  MobileMoneyIcon,
  RefreshIcon,
  SearchIcon,
  ShipIcon,
} from "@/components/icons";
import { usePaymentFlowModal } from "@/components/usePaymentFlowModal";
import {
  allPayToOptions,
  directTransfers,
  governmentPayees,
  logisticsShown,
  recentPayees,
  utilityPayees,
  type Payee,
} from "@/lib/data";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";

type IconComponent = FunctionComponent<{ className?: string }>;
type IconResolver = (name: string) => IconComponent | undefined;

function constIcon(Icon: IconComponent): IconResolver {
  return () => Icon;
}

function directTransferIcon(name: string): IconComponent | undefined {
  if (name === "M-Pesa" || name === "Airtel Money") return MobileMoneyIcon;
  if (name === "Bank Transfer") return BankBuildingIcon;
  if (name === "Int'l Transfer") return GlobeIcon;
  if (name === "Internal Transfer") return RefreshIcon;
  return undefined;
}

function iconForAnyPayee(name: string): IconComponent | undefined {
  if (governmentPayees.some((p) => p.name === name)) return GovBuildingIcon;
  if (logisticsShown.some((p) => p.name === name)) return ShipIcon;
  if (utilityPayees.some((p) => p.name === name)) return BoltIcon;
  return directTransferIcon(name);
}

function Tile({
  payee,
  onClick,
  icon,
}: {
  payee: Payee;
  onClick: () => void;
  icon?: IconResolver;
}) {
  const Icon = icon?.(payee.name);
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 w-full px-2.5 py-4 border border-slate-200 rounded-xl bg-white hover:border-brand-500 hover:shadow-sm transition-colors text-center"
    >
      <div
        className={`w-11 h-11 rounded-[11px] ${payee.bg} ${payee.fg} flex items-center justify-center text-xs font-bold`}
      >
        {Icon ? <Icon className="w-5 h-5" /> : payee.initials}
      </div>
      <div className="text-[12.5px] font-semibold text-slate-900 leading-tight">
        {payee.name}
      </div>
    </button>
  );
}

function ViewAllTile({ href, count }: { href: string; count: number }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 w-full px-2.5 py-4 border border-dashed border-slate-300 rounded-xl bg-white hover:border-brand-500 hover:bg-brand-50/40 transition-colors text-center"
    >
      <div className="w-11 h-11 rounded-[11px] bg-slate-100 text-slate-500 flex items-center justify-center">
        <ArrowRightIcon className="w-5 h-5" />
      </div>
      <div className="text-[12.5px] font-semibold text-brand-600 leading-tight">
        View all {count}
      </div>
    </Link>
  );
}

function CategorySection({
  title,
  items,
  onTileClick,
  icon,
  viewAllHref,
  viewAllCount,
  last = false,
}: {
  title: string;
  items: Payee[];
  onTileClick: (name: string) => void;
  icon?: IconResolver;
  viewAllHref?: string;
  viewAllCount?: number;
  last?: boolean;
}) {
  return (
    <section className={last ? "" : "mb-8"}>
      <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-wide mb-3.5">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {items.map((p) => (
          <Tile key={p.name} payee={p} onClick={() => onTileClick(p.name)} icon={icon} />
        ))}
        {viewAllHref && viewAllCount && (
          <ViewAllTile href={viewAllHref} count={viewAllCount} />
        )}
      </div>
    </section>
  );
}

export default function PayToPage() {
  const [query, setQuery] = useState("");
  const { openFor, modal } = usePaymentFlowModal();

  const hasQuery = query.trim().length > 0;
  const matches = useMemo(() => {
    if (!hasQuery) return [];
    const q = query.toLowerCase();
    return allPayToOptions.filter((p) => p.name.toLowerCase().includes(q));
  }, [query, hasQuery]);

  return (
    <AppShell>
      <TopBar title="Pay to" backHref="/" />

      <div className="p-4 sm:p-8 md:p-10 pb-16 max-w-4xl mx-auto">
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
                {matches.map((p) => {
                  const Icon = iconForAnyPayee(p.name);
                  return (
                    <button
                      key={p.name}
                      onClick={() => openFor(p.name)}
                      className="flex items-center gap-3 px-3.5 py-3 border border-slate-200 rounded-lg bg-white hover:border-brand-500 text-left transition-colors"
                    >
                      <div
                        className={`w-9.5 h-9.5 rounded-[10px] ${p.bg} ${p.fg} flex items-center justify-center text-[11px] font-bold shrink-0`}
                      >
                        {Icon ? <Icon className="w-4.5 h-4.5" /> : p.initials}
                      </div>
                      <div className="text-[13.5px] font-semibold text-slate-900">
                        {p.name}
                      </div>
                    </button>
                  );
                })}
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
                    onClick={() => openFor(p.name)}
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
              onTileClick={openFor}
              icon={constIcon(GovBuildingIcon)}
            />
            <CategorySection
              title="Logistics & Freight"
              items={logisticsShown}
              onTileClick={openFor}
              icon={constIcon(ShipIcon)}
              viewAllHref="/pay/logistics"
              viewAllCount={32}
            />
            <CategorySection
              title="Direct Transfers"
              items={directTransfers}
              onTileClick={openFor}
              icon={directTransferIcon}
            />
            <CategorySection
              title="Utilities & Billers"
              items={utilityPayees}
              onTileClick={openFor}
              icon={constIcon(BoltIcon)}
              last
            />
          </div>
        )}
      </div>

      {modal}
    </AppShell>
  );
}
