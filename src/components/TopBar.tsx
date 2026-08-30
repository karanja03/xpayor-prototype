"use client";

import Link from "next/link";
import { useMobileNav } from "./AppShell";
import { ChevronLeftIcon, HamburgerIcon, PlusIcon, UserIcon } from "./icons";

export function TopBar({
  title,
  backHref,
  showPay = false,
}: {
  title: string;
  backHref?: string;
  showPay?: boolean;
}) {
  const openMobileNav = useMobileNav();

  return (
    <div className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={openMobileNav}
          className="md:hidden w-8 h-8 -ml-1 flex items-center justify-center text-slate-600 shrink-0"
          aria-label="Open menu"
        >
          <HamburgerIcon className="w-5 h-5" />
        </button>
        {backHref && (
          <Link
            href={backHref}
            className="w-7 h-7 hidden sm:flex items-center justify-center text-slate-600 shrink-0"
          >
            <ChevronLeftIcon className="w-[18px] h-[18px]" />
          </Link>
        )}
        <div className="text-[15px] font-semibold text-slate-900 truncate">
          {title}
        </div>
      </div>
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {showPay && (
          <Link
            href="/pay"
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 transition-colors text-white text-[13.5px] font-semibold px-3.5 sm:px-4 py-2.5 rounded-lg"
          >
            <PlusIcon className="w-[15px] h-[15px]" />
            Pay
          </Link>
        )}
        <div className="w-[34px] h-[34px] rounded-full bg-violet-400 flex items-center justify-center shrink-0">
          <UserIcon className="w-[17px] h-[17px] text-white" />
        </div>
      </div>
    </div>
  );
}
