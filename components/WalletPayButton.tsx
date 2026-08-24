"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { chargeFreeWallet } from "@/lib/freeCharge";

interface WalletPayButtonProps {
  priceKrw: number;
  category: string;
  title: string;
  purchaseUrl?: string;
  onSuccess: () => void;
}

type WalletState = { status: "loading" } | { status: "guest" } | { status: "ready"; balance: number };

export default function WalletPayButton({
  priceKrw,
  category,
  title,
  purchaseUrl = "/api/wallet/purchase",
  onSuccess,
}: WalletPayButtonProps) {
  const [wallet, setWallet] = useState<WalletState>({ status: "loading" });
  const [purchasing, setPurchasing] = useState(false);
  const [insufficient, setInsufficient] = useState<{ balance: number; required: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [charging, setCharging] = useState(false);
  const [chargeError, setChargeError] = useState<string | null>(null);

  async function handleFreeCharge() {
    setCharging(true);
    setChargeError(null);
    const result = await chargeFreeWallet();
    if (!result.ok) {
      setChargeError(result.error);
      setCharging(false);
      return;
    }
    const res = await fetch("/api/user/wallet");
    const data = (await res.json()) as { loggedIn: boolean; ticketBalance?: number };
    if (data.loggedIn) {
      setWallet({ status: "ready", balance: data.ticketBalance ?? 0 });
      setInsufficient(null);
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

  async function handlePurchase() {
    setPurchasing(true);
    setError(null);
    try {
      const res = await fetch(purchaseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, priceKrw }),
      });
      if (res.status === 402) {
        const data = (await res.json()) as { balance: number; required: number };
        setInsufficient({ balance: data.balance, required: data.required });
        return;
      }
      if (!res.ok) throw new Error();
      onSuccess();
    } catch {
      setError("처리에 실패했어요. 다시 시도해주세요.");
    } finally {
      setPurchasing(false);
    }
  }

  if (wallet.status === "loading") {
    return <div className="mt-5 h-11 w-full animate-pulse rounded-2xl bg-brown/5" />;
  }

  if (wallet.status === "guest") {
    return (
      <Link
        href="/my"
        className="mt-5 flex w-full items-center justify-center rounded-2xl border border-dashed border-coral bg-white/50 py-3 text-sm font-bold text-coral-dark transition active:scale-95 hover:bg-white"
      >
        🔒 로그인하고 열어보기
      </Link>
    );
  }

  if (insufficient) {
    return (
      <div className="mt-5 w-full">
        <button
          type="button"
          onClick={handleFreeCharge}
          disabled={charging}
          className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-coral bg-white/50 py-3 text-center text-sm font-bold text-coral-dark transition active:scale-95 hover:bg-white disabled:opacity-60"
        >
          <span>{charging ? "충전 중..." : "🌱 잔디가 부족해요 · 눌러서 충전하기"}</span>
          <span className="mt-0.5 text-[11px] font-normal text-brown-soft/90">
            보유 🌱{insufficient.balance.toLocaleString()} · 필요 🌱{insufficient.required.toLocaleString()}
          </span>
        </button>
        {chargeError && <p className="mt-1.5 text-center text-xs font-semibold text-coral-dark">{chargeError}</p>}
      </div>
    );
  }

  return (
    <div className="mt-5 w-full">
      {error && <p className="mb-2 text-center text-xs font-semibold text-coral-dark">{error}</p>}
      <button
        type="button"
        onClick={handlePurchase}
        disabled={purchasing}
        className="w-full rounded-2xl border border-dashed border-coral bg-white/50 py-3 text-sm font-bold text-coral-dark transition active:scale-95 hover:bg-white disabled:opacity-60"
      >
        {purchasing
          ? "처리 중..."
          : priceKrw === 0
            ? "🎁 무료로 열어보기"
            : `🔓 잔디로 열기 (🌱${priceKrw.toLocaleString()})`}
      </button>
    </div>
  );
}
