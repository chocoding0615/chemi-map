import { forwardRef } from "react";
import { ELEMENT_BANK, ELEMENT_ORDER, type ElementKey } from "@/lib/result-engine/elements";
import type { MatchTag } from "@/lib/result-engine/foxType";
import FoxMascot from "./FoxMascot";

interface FoxCardProps {
  label: string;
  element: ElementKey;
  matchTag?: MatchTag | null;
  distribution?: Record<ElementKey, number>;
}

const MATCH_TAG_STYLE: Record<MatchTag, string> = {
  "타고난 결": "bg-lavender/40 text-lavender-dark",
  "은은한 조화": "bg-mint/30 text-mint-dark",
  "반전 매력": "bg-coral/25 text-coral-dark",
};

// 9:16 세로 카드 — 스토리 공유용. FoxMascot이 이모지 플레이스홀더이므로
// 캡처(html-to-image)해도 별도 이미지 로딩 대기 없이 안전하다.
const FoxCard = forwardRef<HTMLDivElement, FoxCardProps>(function FoxCard(
  { label, element, matchTag, distribution },
  ref
) {
  const bank = ELEMENT_BANK[element];
  const max = distribution ? Math.max(1, ...ELEMENT_ORDER.map((key) => distribution[key])) : 1;

  return (
    <div
      ref={ref}
      className="relative mx-auto flex aspect-[9/16] w-full max-w-[280px] flex-col items-center overflow-hidden rounded-3xl px-6 py-8 text-center"
      style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #FFEEDD 55%, #FFE3C4 100%)" }}
    >
      <p className="text-[10px] font-bold tracking-widest text-brown-soft/40">나의 여우상</p>
      <div className="flex flex-1 flex-col items-center justify-center">
        <FoxMascot size={88} prop="star" />
        <p className="mt-5 px-2 text-xl font-extrabold leading-snug text-brown">{label}</p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: bank.color }}
          >
            {bank.label}({bank.hanja})
          </span>
          {matchTag && (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${MATCH_TAG_STYLE[matchTag]}`}>
              {matchTag}
            </span>
          )}
        </div>

        {distribution && (
          <div className="mt-5 w-full max-w-[160px] space-y-1">
            {ELEMENT_ORDER.map((key) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="w-6 shrink-0 text-[9px] text-brown-soft/50">{ELEMENT_BANK[key].label}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-brown/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(distribution[key] / max) * 100}%`,
                      backgroundColor: ELEMENT_BANK[key].color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-[10px] font-semibold tracking-widest text-brown-soft/40">여우점 · FOXJUM</p>
    </div>
  );
});

export default FoxCard;
