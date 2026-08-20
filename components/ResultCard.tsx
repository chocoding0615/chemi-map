"use client";

import ElementIcon from "./ElementIcon";
import ElementDistributionChart from "./ElementDistributionChart";
import MockPayGate from "./MockPayGate";
import { addActivity } from "@/lib/localActivity";
import type { ElementKey } from "@/lib/result-engine/elements";
import { FOX_BASE } from "@/lib/content/foxTypes";

interface ResultCardProps {
  title: string;
  element: ElementKey;
  elementBlurb: string;
  affinityLabel: string;
  affinityEmoji: string;
  affinityScore: number;
  affinityBlurb: string;
  distribution: Record<ElementKey, number>;
  distributionBlurb: string;
  pillarText: string;
  hasTimeInput: boolean;
}

export default function ResultCard({
  title,
  element,
  elementBlurb,
  affinityLabel,
  affinityEmoji,
  affinityScore,
  affinityBlurb,
  distribution,
  distributionBlurb,
  pillarText,
  hasTimeInput,
}: ResultCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-apricot to-cream p-6 text-center shadow-inner ring-1 ring-brown/10">
      <div className="flex justify-center">
        <ElementIcon element={element} size={64} />
      </div>
      <p className="mt-2 text-xs font-semibold text-brown-soft/50">{FOX_BASE[element].name}</p>
      <p className="mt-1 text-lg font-extrabold leading-snug text-brown">{title}</p>

      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-brown">
          {affinityEmoji} {affinityLabel}
        </span>
        <span className="inline-flex items-center rounded-full bg-coral-dark px-3 py-1 text-xs font-bold text-white">
          케미 {affinityScore}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-brown-soft/70">{affinityBlurb}</p>
      <p className="mt-2 text-sm leading-relaxed text-brown-soft/70">{elementBlurb}</p>

      <MockPayGate
        priceKrw={0}
        unlockLabel="🔒 테스트 결제로 상세 결과 열어보기 (실제 결제 아님)"
        onUnlock={() => addActivity({ category: "인연 매칭", title, priceKrw: 0 })}
      >
        <div className="mt-5 space-y-3 rounded-xl bg-white/60 p-4 text-left">
          <p className="text-center text-xs font-semibold text-brown-soft/50">
            사주 상세 · {hasTimeInput ? "출생시간 포함" : "출생시간 미입력 (참고용)"}
          </p>
          <p className="text-center text-xs text-brown-soft/70">{pillarText}</p>
          <ElementDistributionChart distribution={distribution} />
          <p className="text-sm leading-relaxed text-brown-soft/70">{distributionBlurb}</p>
        </div>
      </MockPayGate>
    </div>
  );
}
