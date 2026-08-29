import Link from "next/link";
import { ChevronLeftIcon, PlusIcon, UserIcon } from "./icons";

export function TopBar({
  title,
  backHref,
  showPay = false,
}: {
  title: string;
  backHref?: string;
  showPay?: boolean;
}) {
  return (
    <div className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="w-7 h-7 flex items-center justify-center text-slate-600"
          >
            <ChevronLeftIcon className="w-[18px] h-[18px]" />
          </Link>
        )}
        <div className="text-[15px] font-semibold text-slate-900">{title}</div>
      </div>
      <div className="flex items-center gap-4">
        {showPay && (
          <Link
            href="/pay"
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 transition-colors text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-lg"
          >
            <PlusIcon className="w-[15px] h-[15px]" />
            Pay
          </Link>
        )}
        <div className="w-[34px] h-[34px] rounded-full bg-violet-400 flex items-center justify-center">
          <UserIcon className="w-[17px] h-[17px] text-white" />
        </div>
      </div>
    </div>
  );
}
