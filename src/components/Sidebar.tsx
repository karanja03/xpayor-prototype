"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  TasksIcon,
  TransactionsIcon,
  StatementsIcon,
  ReimbursementsIcon,
  BeneficiariesIcon,
  LabelsIcon,
  SettingsIcon,
  ChevronDownIcon,
} from "./icons";
import { getTransactions } from "@/lib/store";

const navItems = [
  { key: "home", label: "Home", href: "/", icon: HomeIcon },
  { key: "tasks", label: "Tasks", href: "/tasks", icon: TasksIcon, badge: true },
  { key: "transactions", label: "Transactions", href: "/transactions", icon: TransactionsIcon },
  { key: "statements", label: "Statements", icon: StatementsIcon },
  { key: "reimbursements", label: "Reimbursements", icon: ReimbursementsIcon },
  { key: "beneficiaries", label: "Beneficiaries", icon: BeneficiariesIcon },
  { key: "labels", label: "Labels", icon: LabelsIcon },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setPendingCount(getTransactions().filter((t) => t.status === "Pending").length);
  }, [pathname]);

  return (
    <aside className="w-[232px] shrink-0 border-r border-slate-200 bg-white flex flex-col p-3">
      <div className="flex items-center gap-2.5 px-2 pb-4 mb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-[9px] bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
          ETL
        </div>
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-slate-900 truncate">
            Expayor Tech Li...
          </div>
        </div>
        <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0" />
      </div>

      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map((item) => {
          const isActive = item.href ? pathname === item.href : false;
          const Icon = item.icon;
          const rowClasses = `flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[14px] ${
            isActive
              ? "bg-brand-50 text-brand-600 font-semibold"
              : "text-slate-600 font-medium"
          }`;

          if (item.href) {
            return (
              <Link key={item.key} href={item.href} className={rowClasses}>
                <Icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          }

          return (
            <div key={item.key} className={`${rowClasses} cursor-default`}>
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="pt-3.5 px-2 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-1.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 12 12 4l8 8-8 8-8-8Z" fill="#0F172A" />
            <path d="M9 12l3-3 3 3-3 3-3-3Z" fill="#3AC8E0" />
          </svg>
          <span className="text-sm font-extrabold tracking-wide text-slate-900">
            XPAYOR
          </span>
        </div>
      </div>
    </aside>
  );
}
