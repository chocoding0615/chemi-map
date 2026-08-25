"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SimpleMarkdown from "@/components/SimpleMarkdown";
import { chargeFreeWallet } from "@/lib/freeCharge";

// 운세 카테고리별 특화 AI 리딩 섹션. SajuLlmReportSection과 동일한 패턴:
// [지갑 로딩 -> 게스트면 로그인 유도] -> 버튼 클릭 시 POST /api/fortune/{slug}/reading
// -> 402면 무료 충전 버튼 노출 -> 완료되면 마크다운 렌더.
type WalletState = { status: "loading" } | { status: "guest" } | { status: "ready"; balance: number };
type ResultState =
  | { phase: "idle" }
  | { phase: "generating" }
  | { phase: "ready"; readingText: string }
  | { phase: "insufficient"; balance: number; required: number }
  | { phase: "unauthorized" }
  | { phase: "error"; message: string };

interface CategoryReadingSectionProps {
  slug: string;
  nameKo: string;
  icon: string;
  priceKrw: number;
  /** POST 바디 - FortuneForm이 결과 확정 시점에 만들어 넘긴다 { me, partner?, pairInfo? } */
  requestBody: Record<string, unknown>;
}

export default function CategoryReadingSection({ slug, nameKo, icon, priceKrw, requestBody }: CategoryReadingSectionProps) {
  const [wallet, setWallet] = useState<WalletState>({ status: "loading" });
  const [result, setResult] = useState<ResultState>({ phase: "idle" });
  const [charging, setCharging] = useState(false);
  const [chargeError, setChargeError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/wallet")
      .then((res) => res.json())
      .then((data: { loggedIn: boolean; ticketBalance?: number }) => {
        setWallet(data.loggedIn ? { status: "ready", balance: data.ticketBalance ?? 0 } : { status: "guest" });
      })
      .catch(() => setWallet({ status: "guest" }));
  }, []);

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

  async function handleGenerate() {
    setResult({ phase: "generating" });
    try {
      const res = await fetch(`/api/fortune/${slug}/reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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
        throw new Error(data?.error || `${nameKo} 리딩 생성에 실패했어요.`);
      }
      const data = (await res.json()) as { readingText: string };
      setResult({ phase: "ready", readingText: data.readingText });
    } catch (err) {
      setResult({ phase: "error", message: err instanceof Error ? err.message : `${nameKo} 리딩 생성에 실패했어요.` });
    }
  }

  if (result.phase === "ready") {
    return (
      <div className="mt-5 rounded-2xl bg-white p-5 text-left shadow-lg shadow-brown/5 ring-1 ring-brown/5">
        <p className="text-xs font-bold text-coral-dark">{icon} AI {nameKo} 상세 리딩</p>
        <div className="mt-3">
          <SimpleMarkdown text={result.readingText} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl bg-white p-5 text-center shadow-lg shadow-brown/5 ring-1 ring-brown/5">
      <p className="text-sm font-bold text-brown">{icon} 진짜 자세한 AI {nameKo} 리딩</p>
      <p className="mt-1 text-xs leading-relaxed text-brown-soft/90">
        이 사주의 데이터를 근거로 {nameKo}에만 집중해 새로 써드려요.
        지금 결과 위에 붙은 짧은 풀이와는 완전히 다른 깊이예요.
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
          🔒 로그인하고 읽기
        </Link>
      )}

      {wallet.status === "ready" && result.phase !== "generating" && result.phase !== "unauthorized" && (
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-4 w-full rounded-2xl bg-gradient-to-b from-coral to-coral-dark py-3 text-sm font-bold text-white shadow-lg shadow-coral-dark/25 transition active:scale-95 hover:brightness-105"
        >
          {nameKo} 상세 리딩 받기 (🌱{priceKrw.toLocaleString()})
        </button>
      )}
    </div>
  );
}
