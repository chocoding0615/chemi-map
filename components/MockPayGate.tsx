"use client";

import { useState } from "react";
import { FORTUNE_FREE_PREVIEW } from "@/lib/config";

interface MockPayGateProps {
  priceKrw: number;
  unlockLabel?: string;
  onUnlock?: () => void;
  children: React.ReactNode;
}

// 실제 PG 연동 전 공용 모의 결제 UI. 나중에 real PG로 교체할 땐 handleTestPay
// 내부만 실제 결제 위젯 호출로 바꾸면 되고, 이 컴포넌트를 쓰는 화면들은 그대로 둬도 된다.
// 지금은 lib/config.ts의 FORTUNE_FREE_PREVIEW로 전부 무료 공개 중.
export default function MockPayGate({ priceKrw, unlockLabel, onUnlock, children }: MockPayGateProps) {
  const [unlocked, setUnlocked] = useState(FORTUNE_FREE_PREVIEW);
  const [paying, setPaying] = useState(false);

  function handleTestPay() {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setUnlocked(true);
      onUnlock?.();
    }, 900);
  }

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
    <button
      type="button"
      onClick={handleTestPay}
      disabled={paying}
      className="mt-5 w-full rounded-2xl border border-dashed border-coral bg-white/50 py-3 text-sm font-bold text-coral-dark transition active:scale-95 hover:bg-white disabled:opacity-60"
    >
      {paying
        ? "결제 처리 중..."
        : unlockLabel ?? `🔒 테스트 결제로 열어보기 (${priceKrw.toLocaleString()}원 · 실제 결제 아님)`}
    </button>
  );
}
