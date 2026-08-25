"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SimpleMarkdown from "./SimpleMarkdown";
import SajuLlmChat from "./SajuLlmChat";
import type { SajuReportInput } from "@/lib/result-engine/sajuPrompt";
import { SAJU_LLM_REPORT_PRICE_KRW, SAJU_LLM_CHAT_FREE_QUESTIONS } from "@/lib/sajuLlmPricing";
import { chargeFreeWallet } from "@/lib/freeCharge";

type WalletState = { status: "loading" } | { status: "guest" } | { status: "ready"; balance: number };
type ResultState =
  | { phase: "idle" }
  | { phase: "generating" }
  | { phase: "ready"; reportText: string; reportId: string }
  | { phase: "insufficient"; balance: number; required: number }
  | { phase: "unauthorized" }
  | { phase: "error"; message: string };

export default function SajuLlmReportSection({ input }: { input: SajuReportInput }) {
  const [wallet, setWallet] = useState<WalletState>({ status: "loading" });
  const [result, setResult] = useState<ResultState>({ phase: "idle" });
  const [charging, setCharging] = useState(false);
  const [chargeError, setChargeError] = useState<string | null>(null);

  async function handleFreeCharge() {
    setCharging(true);
    setChargeError(null);
    const chargeResult = await chargeFreeWallet();
    if (!chargeResult.ok) {
      setChargeError(chargeResult.error);
      setCharging(false);
      return;
    }
    const res = await fetch("/api/user/wallet");
    const data = (await res.json()) as { loggedIn: boolean; ticketBalance?: number };
    if (data.loggedIn) {
      setWallet({ status: "ready", balance: data.ticketBalance ?? 0 });
      setResult({ phase: "idle" });
    }
    setCharging(false);
  }

  useEffect(() => {
    fetch("/api/user/wallet")
      .then((res) => res.json())
      .then((data: { loggedIn: boolean; ticketBalance?: number }) => {
        setWallet(data.loggedIn ? { status: "ready", balance: data.ticketBalance ?? 0 } : { status: "guest" });
      })
      .catch(() => setWallet({ status: "guest" }));
  }, []);

  async function handleGenerate() {
    setResult({ phase: "generating" });
    try {
      const res = await fetch("/api/saju/llm-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.status === 402) {
        const data = (await res.json()) as { balance: number; required: number };
        setResult({ phase: "insufficient", balance: data.balance, required: data.required });
        return;
      }
      if (res.status === 401) {
        setResult({ phase: "unauthorized" });
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "리포트 생성에 실패했어요.");
      }
      const data = (await res.json()) as { reportText: string; reportId: string };
      setResult({ phase: "ready", reportText: data.reportText, reportId: data.reportId });
    } catch (err) {
      setResult({ phase: "error", message: err instanceof Error ? err.message : "리포트 생성에 실패했어요." });
    }
  }

  if (result.phase === "ready") {
    return (
      <div className="mt-5 rounded-2xl bg-white p-5 shadow-lg shadow-brown/5 ring-1 ring-brown/5">
        <p className="text-xs font-bold text-coral-dark">🔮 AI 상세 사주 리포트</p>
        <div className="mt-3">
          <SimpleMarkdown text={result.reportText} />
        </div>
        <SajuLlmChat reportId={result.reportId} freeQuestionsTotal={SAJU_LLM_CHAT_FREE_QUESTIONS} />
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl bg-white p-5 text-center shadow-lg shadow-brown/5 ring-1 ring-brown/5">
      <p className="text-sm font-bold text-brown">🔮 진짜 상세한 AI 사주 리포트</p>
      <p className="mt-1 text-xs leading-relaxed text-brown-soft/90">
        타고난 그릇부터 평생 운의 흐름, 돈·일·연애·결혼·건강, 대운·세운까지 —
        지금 이 사주만을 위해 새로 써드려요. 후속 질문 {SAJU_LLM_CHAT_FREE_QUESTIONS}개 무료 포함.
      </p>

      {result.phase === "generating" && (
        <div className="mt-4 space-y-2">
          <div className="h-4 w-2/3 mx-auto animate-pulse rounded bg-brown/5" />
          <div className="h-4 w-1/2 mx-auto animate-pulse rounded bg-brown/5" />
          <p className="mt-2 text-xs text-brown-soft/90">복실이가 정성껏 풀어쓰는 중이에요... (최대 1분 정도 걸려요)</p>
        </div>
      )}

      {result.phase === "insufficient" && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleFreeCharge}
            disabled={charging}
            className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-coral bg-white/50 py-3 text-center text-sm font-bold text-coral-dark transition active:scale-95 hover:bg-white disabled:opacity-60"
          >
            <span>{charging ? "충전 중..." : "🌱 잔디가 부족해요 · 눌러서 충전하기"}</span>
            <span className="mt-0.5 text-[11px] font-normal text-brown-soft/90">
              보유 🌱{result.balance.toLocaleString()} · 필요 🌱{result.required.toLocaleString()}
            </span>
          </button>
          {chargeError && <p className="mt-1.5 text-center text-xs font-semibold text-coral-dark">{chargeError}</p>}
        </div>
      )}

      {result.phase === "error" && <p className="mt-3 text-xs font-semibold text-coral-dark">{result.message}</p>}

      {result.phase === "unauthorized" && (
        <p className="mt-3 text-xs font-semibold text-coral-dark">로그인이 끊겼어요. 다시 로그인해주세요.</p>
      )}

      {wallet.status === "loading" && <div className="mt-4 h-11 w-full animate-pulse rounded-2xl bg-brown/5" />}

      {(wallet.status === "guest" || result.phase === "unauthorized") && (
        <Link
          href="/my"
          className="mt-4 flex w-full items-center justify-center rounded-2xl border border-dashed border-coral bg-white/50 py-3 text-sm font-bold text-coral-dark transition active:scale-95 hover:bg-white"
        >
          🔒 로그인하고 생성하기
        </Link>
      )}

      {wallet.status === "ready" && result.phase !== "generating" && result.phase !== "unauthorized" && (
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-4 w-full rounded-2xl bg-gradient-to-b from-coral to-coral-dark py-3 text-sm font-bold text-white shadow-lg shadow-coral-dark/25 transition active:scale-95 hover:brightness-105"
        >
          AI 리포트 생성하기 (🌱{SAJU_LLM_REPORT_PRICE_KRW.toLocaleString()})
        </button>
      )}
    </div>
  );
}
