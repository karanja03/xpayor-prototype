"use client";

import { useEffect, useMemo, useState } from "react";
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
  StarIcon,
} from "@/components/icons";
import { usePaymentFlowModal } from "@/components/usePaymentFlowModal";
import {
  allPayToOptions,
  directTransfers,
  findPayee,
  governmentPayees,
  logisticsShown,
  recentPayees,
  utilityPayees,
  type Payee,
} from "@/lib/data";
import { getFavoritePayees, toggleFavoritePayee } from "@/lib/store";
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

// Brand logos are optional files dropped into public/logos/ - most won't
// exist yet. Rendering an <img src> straight from SSR races React's
// hydration: a fast localhost 404 fires the native error event before
// React has attached onError, so the handler never runs and a broken-image
// glyph sticks around. Pre-checking the URL client-side with a plain
// Image() sidesteps that race entirely.
function useLogoAvailable(src: string | undefined): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => !cancelled && setOk(true);
    img.onerror = () => !cancelled && setOk(false);
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);
  return ok;
}

function PayeeAvatar({
  payee,
  icon: Icon,
  shape = "square",
  className = "",
}: {
  payee: Payee;
  icon?: IconComponent;
  shape?: "square" | "circle";
  className?: string;
}) {
  const showLogo = useLogoAvailable(payee.logo);
  return (
    <div
      className={`overflow-hidden flex items-center justify-center font-bold ${
        shape === "circle" ? "rounded-full" : "rounded-[11px]"
      } ${showLogo ? "bg-white border border-slate-100" : `${payee.bg} ${payee.fg}`} ${className}`}
    >
      {showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={payee.logo} alt={payee.name} className="w-full h-full object-contain p-1" />
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : (
        payee.initials
      )}
    </div>
  );
}

function FavoriteToggle({
  active,
  onToggle,
  name,
}: {
  active: boolean;
  onToggle: () => void;
  name: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={active ? `Remove ${name} from frequent` : `Mark ${name} as frequent`}
      aria-pressed={active}
      className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/95 flex items-center justify-center shadow-sm transition-colors ${
        active ? "text-amber-500" : "text-slate-300 hover:text-amber-400"
      }`}
    >
      <StarIcon className="w-4 h-4" filled={active} />
    </button>
  );
}

function Tile({
  payee,
  onClick,
  icon,
  isFavorite,
  onToggleFavorite,
}: {
  payee: Payee;
  onClick: () => void;
  icon?: IconResolver;
  isFavorite?: boolean;
  onToggleFavorite?: (name: string) => void;
}) {
  const Icon = icon?.(payee.name);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 w-full px-2.5 py-4 border border-slate-200 rounded-xl bg-white hover:border-brand-500 hover:shadow-sm transition-colors text-center"
      >
        <PayeeAvatar payee={payee} icon={Icon} className="w-12 h-12 text-xs" />
        <div className="text-[12.5px] font-semibold text-slate-900 leading-tight">
          {payee.name}
        </div>
      </button>
      {onToggleFavorite && (
        <FavoriteToggle
          active={!!isFavorite}
          onToggle={() => onToggleFavorite(payee.name)}
          name={payee.name}
        />
      )}
    </div>
  );
}

function ViewAllTile({ href, count }: { href: string; count: number }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 w-full px-2.5 py-4 border border-dashed border-slate-300 rounded-xl bg-white hover:border-brand-500 hover:bg-brand-50/40 transition-colors text-center"
    >
      <div className="w-12 h-12 rounded-[11px] bg-slate-100 text-slate-500 flex items-center justify-center">
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
  favoriteNames,
  onToggleFavorite,
  last = false,
}: {
  title: string;
  items: Payee[];
  onTileClick: (name: string) => void;
  icon?: IconResolver;
  viewAllHref?: string;
  viewAllCount?: number;
  favoriteNames?: Set<string>;
  onToggleFavorite?: (name: string) => void;
  last?: boolean;
}) {
  return (
    <>
      <section className="mb-7">
        <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-wide mb-3.5">
          {title}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((p) => (
            <Tile
              key={p.name}
              payee={p}
              onClick={() => onTileClick(p.name)}
              icon={icon}
              isFavorite={favoriteNames?.has(p.name)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
          {viewAllHref && viewAllCount && (
            <ViewAllTile href={viewAllHref} count={viewAllCount} />
          )}
        </div>
      </section>
      {!last && <div className="h-px bg-slate-200 mb-8" />}
    </>
  );
}

export default function PayToPage() {
  const [query, setQuery] = useState("");
  const [favoriteNamesList, setFavoriteNamesList] = useState<string[]>([]);
  const { openFor, modal } = usePaymentFlowModal();

  useEffect(() => {
    setFavoriteNamesList(getFavoritePayees());
  }, []);

  function handleToggleFavorite(name: string) {
    toggleFavoritePayee(name);
    setFavoriteNamesList(getFavoritePayees());
  }

  const favoriteNames = useMemo(() => new Set(favoriteNamesList), [favoriteNamesList]);

  const frequentPayees = useMemo(() => {
    const merged = [...recentPayees];
    for (const name of favoriteNamesList) {
      if (merged.some((p) => p.name === name)) continue;
      const payee = findPayee(name);
      if (payee) merged.push(payee);
    }
    return merged;
  }, [favoriteNamesList]);

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
         Pay to
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
                      <PayeeAvatar payee={p} icon={Icon} className="w-9.5 h-9.5 text-[11px] shrink-0" />
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
                {frequentPayees.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => openFor(p.name)}
                    className="flex flex-col items-center gap-2 w-20"
                  >
                    <PayeeAvatar payee={p} shape="circle" className="w-14 h-14 text-[13px]" />
                    <div className="text-[11.5px] font-semibold text-slate-600 text-center leading-tight truncate w-full">
                      {p.name}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <div className="h-px bg-slate-200 mb-8" />

            <CategorySection
              title="Government & Statutory"
              items={governmentPayees}
              onTileClick={openFor}
              icon={constIcon(GovBuildingIcon)}
              favoriteNames={favoriteNames}
              onToggleFavorite={handleToggleFavorite}
            />
            <CategorySection
              title="Logistics & Freight"
              items={logisticsShown}
              onTileClick={openFor}
              icon={constIcon(ShipIcon)}
              viewAllHref="/pay/logistics"
              viewAllCount={32}
              favoriteNames={favoriteNames}
              onToggleFavorite={handleToggleFavorite}
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
              favoriteNames={favoriteNames}
              onToggleFavorite={handleToggleFavorite}
              last
            />
          </div>
        )}
      </div>

      {modal}
    </AppShell>
  );
}
