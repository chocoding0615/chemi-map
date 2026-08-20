import { forwardRef } from "react";
import { ELEMENT_ORDER, ELEMENT_BANK, type ElementKey } from "@/lib/result-engine/elements";
import type { MatchTagEntry } from "@/lib/content/foxTypes";
import FoxCharacterImage from "./FoxCharacterImage";

interface FoxCardProps {
  label: string;
  tagline: string;
  element: ElementKey;
  color: string;
  bg: string;
  img: string;
  prop: string;
  matchTag?: MatchTagEntry | null;
  distribution?: Record<ElementKey, number>;
  /** 공유 이미지 안에 찍히는 안내 문구용 사이트 주소(없으면 그 줄은 생략). */
  siteUrl?: string;
}

// 9:16 세로 카드 — 스토리 공유용. 캐릭터 이미지는 오행별로 다르게(없으면 이모지로
// 자동 대체) 보여줘서 5종이 서로 다르게 보이도록 한다.
const FoxCard = forwardRef<HTMLDivElement, FoxCardProps>(function FoxCard(
  { label, tagline, element, color, bg, img, prop, matchTag, distribution, siteUrl },
  ref
) {
  const max = distribution ? Math.max(1, ...ELEMENT_ORDER.map((key) => distribution[key])) : 1;

  return (
    <div
      ref={ref}
      className="relative mx-auto flex aspect-[9/16] w-full max-w-[280px] flex-col items-center overflow-hidden rounded-3xl px-6 py-8 text-center"
      style={{ background: `linear-gradient(180deg, ${bg} 0%, #FFFFFF 100%)` }}
    >
      <p className="text-[10px] font-bold tracking-widest text-brown-soft/40">나의 여우상</p>
      <div className="flex flex-1 flex-col items-center justify-center">
        <FoxCharacterImage src={img} fallbackEmoji={prop} size={88} alt={label} />
        <p className="mt-5 px-2 text-xl font-extrabold leading-snug text-brown">{label}</p>
        <p className="mt-1 px-2 text-sm font-semibold" style={{ color }}>
          {tagline}
        </p>

        {matchTag && (
          <span
            className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {matchTag.label}
          </span>
        )}

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
                      backgroundColor: key === element ? color : ELEMENT_BANK[key].color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-[10px] font-semibold tracking-widest text-brown-soft/40">
        여우점에서 내 여우상 확인하기
      </p>
      {siteUrl && <p className="mt-0.5 text-[9px] text-brown-soft/30">{siteUrl}</p>}
    </div>
  );
});

export default FoxCard;
