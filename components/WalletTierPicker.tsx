"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WALLET_TIERS } from "@/lib/walletTiers";
import { chargeFreeWallet } from "@/lib/freeCharge";

export default function WalletTierPicker() {
  const router = useRouter();
  const [chargingId, setChargingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy(tierId: string) {
    setChargingId(tierId);
    setError(null);
    const result = await chargeFreeWallet(tierId);
    if (!result.ok) {
      setError(result.error);
      setChargingId(null);
      return;
    }
    router.refresh();
    setChargingId(null);
  }

  return (
    <div className="mt-4 w-full">
      <p className="text-[11px] font-semibold text-brown-soft/60">
        🚧 베타 테스트 기간이라 아직 실제 결제 없이 체험용으로 충전돼요
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {WALLET_TIERS.map((tier) => {
          const total = tier.jandi + tier.bonus;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => handleBuy(tier.id)}
              disabled={chargingId !== null}
              className="flex flex-col items-center rounded-2xl bg-white p-3 shadow-sm ring-1 ring-brown/10 transition active:scale-95 disabled:opacity-60"
            >
              <span className="text-base font-extrabold text-brown">🌱{total}</span>
              {tier.bonus > 0 && (
                <span className="mt-0.5 text-[10px] font-bold text-mint-dark">{tier.jandi}+{tier.bonus} 보너스</span>
              )}
              <span className="mt-1.5 text-xs font-bold text-coral-dark">
                {chargingId === tier.id ? "충전 중..." : `${tier.priceKrw.toLocaleString()}원`}
              </span>
              <span className="mt-0.5 text-[10px] text-brown-soft/40">
                개당 {Math.round(tier.priceKrw / total).toLocaleString()}원
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-center text-xs font-semibold text-coral-dark">{error}</p>}
    </div>
  );
}
