"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PurchaseProductId } from "@/lib/pricing";
import ConfirmModal from "./ConfirmModal";
import InsufficientBalanceCTA from "./common/InsufficientBalanceCTA";

interface WalletPayButtonProps {
  /** /api/wallet/purchase 기본 경로를 쓸 때 서버가 실제 가격을 다시 계산하는 기준.
   * purchaseUrl을 커스텀으로 넘겨서 서버가 자체적으로 가격을 정하는 경우(비밀편지 등)엔 안 써도 된다. */
  productId?: PurchaseProductId;
  priceKrw: number;
  category: string;
  title: string;
  purchaseUrl?: string;
  onSuccess: () => void;
}

type WalletState = { status: "loading" } | { status: "guest" } | { status: "ready"; balance: number };

export default function WalletPayButton({
  productId,
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
  const [sessionExpired, setSessionExpired] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetch("/api/user/wallet")
      .then((res) => res.json())
      .then((data: { loggedIn: boolean; ticketBalance?: number }) => {
        setWallet(data.loggedIn ? { status: "ready", balance: data.ticketBalance ?? 0 } : { status: "guest" });
      })
      .catch(() => setWallet({ status: "guest" }));
  }, []);

  async function handlePurchase() {
    setConfirming(false);
    setPurchasing(true);
    setError(null);
    try {
      const res = await fetch(purchaseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, category, title, priceKrw }),
      });
      if (res.status === 402) {
        const data = (await res.json()) as { balance: number; required: number };
        setInsufficient({ balance: data.balance, required: data.required });
        return;
      }
      if (res.status === 401) {
        setSessionExpired(true);
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

  if (wallet.status === "guest" || sessionExpired) {
    return (
      <div className="mt-5 w-full">
        {sessionExpired && (
          <p className="mb-1.5 text-center text-xs font-semibold text-coral-dark">
            로그인이 끊겼어요. 다시 로그인해주세요.
          </p>
        )}
        <Link
          href="/my"
          className="flex w-full items-center justify-center rounded-2xl border border-dashed border-coral bg-white/50 py-3 text-sm font-bold text-coral-dark transition active:scale-95 hover:bg-white"
        >
          🔒 로그인하고 열어보기
        </Link>
      </div>
    );
  }

  if (insufficient) {
    return (
      <div className="mt-5 w-full">
        <InsufficientBalanceCTA balance={insufficient.balance} required={insufficient.required} />
      </div>
    );
  }

  return (
    <div className="mt-5 w-full">
      {error && <p className="mb-2 text-center text-xs font-semibold text-coral-dark">{error}</p>}
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={purchasing}
        className="w-full rounded-2xl border border-dashed border-coral bg-white/50 py-3 text-sm font-bold text-coral-dark transition active:scale-95 hover:bg-white disabled:opacity-60"
      >
        {purchasing
          ? "처리 중..."
          : priceKrw === 0
            ? "🎁 무료로 열어보기"
            : `🔓 잔디로 열기 (🌱${priceKrw.toLocaleString()})`}
      </button>

      {confirming && (
        <ConfirmModal
          title={priceKrw === 0 ? "무료로 사용하시겠어요?" : `🌱${priceKrw.toLocaleString()}로 여시겠어요?`}
          description={`${title} — 한 번 열면 다시 잠글 수 없어요.`}
          pending={purchasing}
          onConfirm={handlePurchase}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
