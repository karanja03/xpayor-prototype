"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon } from "./icons";

export type Method = "mpesa" | "airtel" | "bank" | "intl";

export const directMethodMap: Record<string, Method> = {
  "M-Pesa": "mpesa",
  "Airtel Money": "airtel",
  "Bank Transfer": "bank",
  "Int'l Transfer": "intl",
};

const methodChoices: { key: Method; label: string; sub: string }[] = [
  { key: "mpesa", label: "M-Pesa", sub: "Mobile money" },
  { key: "airtel", label: "Airtel Money", sub: "Mobile money" },
  { key: "bank", label: "Bank Transfer", sub: "Direct to account" },
];

const typeChoices = [
  { key: "mobile", label: "Mobile", sub: "Mobile Number" },
  { key: "paybill", label: "Paybill", sub: "Paybill Number" },
  { key: "till", label: "Till", sub: "Till Number" },
] as const;

export function usePaymentFlowModal() {
  const router = useRouter();
  const [modalStep, setModalStep] = useState<"method" | "type" | null>(null);
  const [payee, setPayee] = useState<string | undefined>(undefined);
  const [method, setMethod] = useState<Method | undefined>(undefined);
  const [type, setType] = useState<(typeof typeChoices)[number]["key"]>("mobile");

  function goToDetails(m: Method, t?: string, p?: string) {
    const params = new URLSearchParams();
    params.set("method", m);
    if (t) params.set("type", t);
    if (p) params.set("payee", p);
    router.push(`/pay/details?${params.toString()}`);
  }

  function openFor(name: string) {
    const directMethod = directMethodMap[name];
    if (directMethod === "bank" || directMethod === "intl") {
      goToDetails(directMethod);
      return;
    }
    if (directMethod === "mpesa" || directMethod === "airtel") {
      setPayee(undefined);
      setMethod(directMethod);
      setType("mobile");
      setModalStep("type");
      return;
    }
    setPayee(name);
    setMethod(undefined);
    setModalStep("method");
  }

  function closeModal() {
    setModalStep(null);
  }

  function pickMethod(m: Method) {
    setMethod(m);
    if (m === "bank") {
      setModalStep(null);
      goToDetails("bank", undefined, payee);
      return;
    }
    setType("mobile");
    setModalStep("type");
  }

  function confirmType() {
    if (!method) return;
    setModalStep(null);
    goToDetails(method, type, payee);
  }

  const modal = modalStep ? (
    <div
      className="fixed inset-0 bg-slate-900/45 flex items-center justify-center z-50"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-2xl w-[420px] p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {modalStep === "method" ? (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-[17px] font-bold text-slate-900">
                Select Payment Method
              </h3>
              <button
                onClick={closeModal}
                className="w-5 h-5 text-slate-400 hover:text-slate-600"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            {payee && (
              <p className="text-[13px] text-slate-400 mb-5">
                Paying <span className="font-semibold text-slate-600">{payee}</span>
              </p>
            )}
            <div className="flex flex-col gap-2.5">
              {methodChoices.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => pickMethod(opt.key)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-lg border-[1.5px] border-slate-200 bg-white hover:border-brand-500 hover:bg-brand-50/40 text-left transition-colors"
                >
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {opt.label}
                    </span>
                    <span className="block text-xs text-slate-400 mt-0.5">
                      {opt.sub}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5.5">
              <h3 className="text-[17px] font-bold text-slate-900">
                Select {method === "airtel" ? "Airtel Money" : "M-Pesa"} Payment Type
              </h3>
              <button
                onClick={closeModal}
                className="w-5 h-5 text-slate-400 hover:text-slate-600"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 mb-5.5">
              {typeChoices.map((opt) => {
                const selected = type === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setType(opt.key)}
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
              onClick={confirmType}
              className="w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm py-3 rounded-lg transition-colors"
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  ) : null;

  return { openFor, modal };
}
