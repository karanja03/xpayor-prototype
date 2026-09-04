"use client";

import { useState } from "react";
import {
  ArrowUpCircleIcon,
  AttachmentIcon,
  CloseIcon,
  DownloadIcon,
  InfoIcon,
  TruckIcon,
  UploadCloudIcon,
  UserIcon,
} from "./icons";
import { formatDateTimeLong, formatMoney } from "@/lib/format";
import { isCreditTransaction, type Transaction, type TxStatus } from "@/lib/store";

const statusStyles: Record<TxStatus, string> = {
  Pending: "bg-amber-50 text-amber-800",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-slate-100 text-slate-500",
  Failed: "bg-red-50 text-red-700",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-[13px] font-semibold text-slate-900 text-right">{value}</span>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: (props: { className?: string }) => React.ReactElement;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
        {children}
      </h4>
    </div>
  );
}

function downloadReceipt(transaction: Transaction) {
  const lines = [
    "XPAYOR TRANSACTION RECEIPT",
    "",
    `Reference: ${transaction.id}`,
    `Service: ${transaction.service}`,
    `Amount: ${formatMoney(transaction.amount, transaction.currency)}`,
    `Status: ${transaction.status}`,
    `From Account: ${transaction.fromAccount}`,
    `To: ${transaction.to}`,
    `Created By: ${transaction.createdBy} on ${formatDateTimeLong(transaction.createdAt)}`,
    transaction.approvedBy
      ? `Approved By: ${transaction.approvedBy} on ${formatDateTimeLong(transaction.approvedAt ?? transaction.createdAt)}`
      : null,
    transaction.completedAt ? `Completed At: ${formatDateTimeLong(transaction.completedAt)}` : null,
    transaction.externalReference ? `External Reference: ${transaction.externalReference}` : null,
    transaction.receiverName ? `Receiver Name: ${transaction.receiverName}` : null,
    transaction.description ? `Description: ${transaction.description}` : null,
  ].filter(Boolean);

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `xpayor-receipt-${transaction.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

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
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);

  const credit = isCreditTransaction(transaction.service);
  const hasFulfillment =
    transaction.externalReference || transaction.receiverName || transaction.description;

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
            <div className="flex items-center gap-1.5 mb-3">
              <InfoIcon className="w-4 h-4 text-brand-600" />
              <h3 className="text-[17px] font-bold text-slate-900 flex-1">
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

            <div className="flex items-center justify-between mb-5">
              <p className="text-[12px] text-slate-400 tracking-wide">{transaction.id}</p>
              <button
                onClick={() => downloadReceipt(transaction)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11.5px] font-semibold text-slate-600 bg-white hover:bg-slate-50"
              >
                <DownloadIcon className="w-3 h-3" />
                Download Transaction Receipt
              </button>
            </div>

            <div className="bg-brand-50 rounded-xl p-4 mb-5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Amount
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    credit ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <ArrowUpCircleIcon
                    className={`w-3.5 h-3.5 ${credit ? "rotate-180" : ""}`}
                  />
                </span>
                <div className="text-xl font-bold text-slate-900">
                  {formatMoney(transaction.amount, transaction.currency)}
                </div>
              </div>
            </div>

            <SectionHeading icon={InfoIcon}>Transaction Information</SectionHeading>
            <div className="divide-y divide-slate-100 mb-5">
              <Row label="Service" value={transaction.service} />
              <Row label="Reference" value={transaction.reference} />
              <Row
                label="Status"
                value={
                  <span
                    className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[transaction.status]}`}
                  >
                    {transaction.status}
                  </span>
                }
              />
              {transaction.completedAt && (
                <Row label="Completed At" value={formatDateTimeLong(transaction.completedAt)} />
              )}
              <Row label="From Account" value={transaction.fromAccount} />
              <Row label="To" value={transaction.to} />
            </div>

            <SectionHeading icon={UserIcon}>Approval Workflow</SectionHeading>
            <div className="divide-y divide-slate-100 mb-5">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Created By
                </span>
                <span className="text-right">
                  <span className="block text-[13px] font-semibold text-slate-900">
                    {transaction.createdBy}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">
                    {formatDateTimeLong(transaction.createdAt)}
                  </span>
                </span>
              </div>
              {transaction.approvedBy && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    Approved By
                  </span>
                  <span className="text-right">
                    <span className="block text-[13px] font-semibold text-slate-900">
                      {transaction.approvedBy}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      {formatDateTimeLong(transaction.approvedAt ?? transaction.createdAt)}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {hasFulfillment && (
              <>
                <SectionHeading icon={TruckIcon}>Fulfillment Details</SectionHeading>
                <div className="divide-y divide-slate-100 mb-5">
                  {transaction.externalReference && (
                    <Row label="External Reference" value={transaction.externalReference} />
                  )}
                  {transaction.receiverName && (
                    <Row label="Receiver Name" value={transaction.receiverName} />
                  )}
                  {transaction.description && (
                    <Row label="Description" value={transaction.description} />
                  )}
                </div>
              </>
            )}

            <SectionHeading icon={AttachmentIcon}>Confirmation Receipt</SectionHeading>
            <label className="mb-5 flex flex-col items-center justify-center gap-1.5 px-4 py-6 border-2 border-dashed border-slate-300 rounded-xl text-center cursor-pointer hover:border-slate-400 transition-colors">
              <UploadCloudIcon className="w-5 h-5 text-slate-400" />
              <span className="text-[12.5px] font-semibold text-slate-600">
                {receiptFileName ?? "Attach Confirmation Receipt"}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setReceiptFileName(e.target.files?.[0]?.name ?? null)}
              />
            </label>

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
