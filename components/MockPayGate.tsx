"use client";

import { useState } from "react";
import { FORTUNE_FREE_PREVIEW } from "@/lib/config";
import WalletPayButton from "./WalletPayButton";

interface MockPayGateProps {
  priceKrw: number;
  category: string;
  title: string;
  children: React.ReactNode;
}

// 실제 PG 연동 전 공용 잠금 UI. 잠금 해제는 WalletPayButton(잔디 지갑 차감)이
// 전담하고, 여기는 FORTUNE_FREE_PREVIEW 캠페인 오버라이드만 담당한다.
// 지금은 lib/config.ts의 FORTUNE_FREE_PREVIEW로 전부 무료 공개 중.
export default function MockPayGate({ priceKrw, category, title, children }: MockPayGateProps) {
  const [unlocked, setUnlocked] = useState(FORTUNE_FREE_PREVIEW);

  if (unlocked) {
    return (
      <>
        {FORTUNE_FREE_PREVIEW && (
          <p className="mt-3 text-center text-[11px] font-semibold text-mint-dark">
            🎁 지금은 기간 한정으로 무료로 볼 수 있어요
          </p>
        )}
        {children}
      </>
    );
  }

  return (
    <WalletPayButton priceKrw={priceKrw} category={category} title={title} onSuccess={() => setUnlocked(true)} />
  );
}
