"use client";

import { useState } from "react";
import { CloseIcon } from "./icons";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Transaction, TxStatus } from "@/lib/store";

const statusStyles: Record<TxStatus, string> = {
  Pending: "bg-amber-50 text-amber-800",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-slate-100 text-slate-500",
  Failed: "bg-red-50 text-red-700",
};

export function TransactionDetailsModal({
  transaction,
  onClose,
  onRecall,
}: {
  transaction: Transaction;
  onClose: () => void;
  onRecall: (id: string) => void;
}) {
  const [confirmingRecall, setConfirmingRecall] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-slate-900/45 flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-[460px] max-h-[85vh] overflow-auto p-6 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {confirmingRecall ? (
          <div className="py-2 text-center">
            <h3 className="text-[17px] font-bold text-slate-900 mb-2">
              Recall this transaction?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              The transaction will be cancelled before any approval or
              processing. This cannot be undone.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  onRecall(transaction.id);
                  setConfirmingRecall(false);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-3 rounded-lg transition-colors"
              >
                Yes, recall
              </button>
              <button
                onClick={() => setConfirmingRecall(false)}
                className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm py-3 rounded-lg transition-colors"
              >
                Go back
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[17px] font-bold text-slate-900">
                Transaction Details
              </h3>
              <button
                onClick={onClose}
                className="w-5 h-5 text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12.5px] text-slate-400 mb-5">{transaction.id}</p>

            <div className="bg-brand-50 rounded-xl p-4 mb-5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Amount
              </div>
              <div className="text-xl font-bold text-slate-900">
                {formatMoney(transaction.amount, transaction.currency)}
              </div>
            </div>

            <h4 className="text-[12.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Transaction Information
            </h4>
            <div className="divide-y divide-slate-100 mb-5">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-400">Service</span>
                <span className="text-[13px] font-semibold text-slate-900">
                  {transaction.service}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-400">Reference</span>
                <span className="text-[13px] font-semibold text-slate-900">
                  {transaction.reference}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-400">Label</span>
                <span className="text-[13px] font-semibold text-slate-900">
                  {transaction.label}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-400">Status</span>
                <span
                  className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[transaction.status]}`}
                >
                  {transaction.status}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-400">From Account</span>
                <span className="text-[13px] font-semibold text-slate-900">
                  {transaction.fromAccount}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-400">To</span>
                <span className="text-[13px] font-semibold text-slate-900">
                  {transaction.to}
                </span>
              </div>
            </div>

            <h4 className="text-[12.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Approval Workflow
            </h4>
            <div className="flex items-center justify-between py-2.5 mb-5">
              <span className="text-[13px] text-slate-400">Created By</span>
              <span className="text-right">
                <span className="block text-[13px] font-semibold text-slate-900">
                  {transaction.createdBy}
                </span>
                <span className="block text-[11.5px] text-slate-400 mt-0.5">
                  {formatDateTime(transaction.createdAt)}
                </span>
              </span>
            </div>

            {transaction.status === "Pending" && (
              <button
                onClick={() => setConfirmingRecall(true)}
                className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm py-3 rounded-lg transition-colors"
              >
                Recall Transaction
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
