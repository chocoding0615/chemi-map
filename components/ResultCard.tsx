"use client";

import { useState } from "react";
import ElementIcon from "./ElementIcon";
import ElementDistributionChart from "./ElementDistributionChart";
import type { ElementKey } from "@/lib/result-engine/elements";

interface ResultCardProps {
  title: string;
  element: ElementKey;
  elementBlurb: string;
  relationshipBlurb: string;
  distribution: Record<ElementKey, number>;
  distributionBlurb: string;
  pillarText: string;
  hasTimeInput: boolean;
}

export default function ResultCard({
  title,
  element,
  elementBlurb,
  relationshipBlurb,
  distribution,
  distributionBlurb,
  pillarText,
  hasTimeInput,
}: ResultCardProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [paying, setPaying] = useState(false);

  function handleTestPay() {
    setPaying(true);
    // 실제 PG 연동 전이라 결제 자체는 모의(mock) 처리 — 나중에 여기를 실제
    // 결제 위젯 호출로 교체하면 UI 흐름은 그대로 재사용 가능.
    setTimeout(() => {
      setPaying(false);
      setUnlocked(true);
    }, 900);
  }

  return (
    <div className="rounded-2xl bg-gradient-to-b from-amber-100 to-orange-100 p-6 text-center shadow-inner ring-1 ring-amber-900/10">
      <div className="flex justify-center">
        <ElementIcon element={element} size={64} />
      </div>
      <p className="mt-3 text-lg font-extrabold leading-snug text-amber-950">{title}</p>
      <p className="mt-4 text-sm leading-relaxed text-amber-900/70">{elementBlurb}</p>
      <p className="mt-2 text-sm leading-relaxed text-amber-900/70">{relationshipBlurb}</p>

      {unlocked ? (
        <div className="mt-5 space-y-3 rounded-xl bg-white/60 p-4 text-left">
          <p className="text-center text-xs font-semibold text-amber-900/50">
            사주 상세 · {hasTimeInput ? "출생시간 포함" : "출생시간 미입력 (참고용)"}
          </p>
          <p className="text-center text-xs text-amber-900/70">{pillarText}</p>
          <ElementDistributionChart distribution={distribution} />
          <p className="text-sm leading-relaxed text-amber-900/70">{distributionBlurb}</p>
        </div>
      ) : (
        <button
          onClick={handleTestPay}
          disabled={paying}
          className="mt-5 w-full rounded-xl border border-dashed border-amber-400 bg-white/50 py-3 text-sm font-bold text-amber-700 transition hover:bg-white disabled:opacity-60"
        >
          {paying ? "결제 처리 중..." : "🔒 테스트 결제로 상세 결과 열어보기 (실제 결제 아님)"}
        </button>
      )}
    </div>
  );
}
