"use client";

import { useState } from "react";
import { FORTUNE_FREE_PREVIEW } from "@/lib/config";
import type { PurchaseProductId } from "@/lib/pricing";
import WalletPayButton from "./WalletPayButton";

interface MockPayGateProps {
  productId: PurchaseProductId;
  priceKrw: number;
  category: string;
  title: string;
  children: React.ReactNode;
}

// 실제 PG 연동 전 공용 잠금 UI. 잠금 해제는 WalletPayButton(잔디 지갑 차감)이
// 전담하고, 여기는 FORTUNE_FREE_PREVIEW 캠페인 오버라이드만 담당한다.
// 지금은 lib/config.ts의 FORTUNE_FREE_PREVIEW로 전부 무료 공개 중.
// priceKrw는 화면 표시용일 뿐이고, 실제 차감 금액은 productId로 서버가 다시 계산한다
// (/api/wallet/purchase가 클라이언트가 보낸 priceKrw를 신뢰하지 않도록).
export default function MockPayGate({ productId, priceKrw, category, title, children }: MockPayGateProps) {
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
    <WalletPayButton
      productId={productId}
      priceKrw={priceKrw}
      category={category}
      title={title}
      onSuccess={() => setUnlocked(true)}
    />
  );
}
