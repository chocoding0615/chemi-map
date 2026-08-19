import { forwardRef } from "react";
import { ELEMENT_BANK, type ElementKey } from "@/lib/result-engine/elements";
import FoxMascot from "./FoxMascot";

interface FoxCardProps {
  foxName: string;
  tagline: string;
  element: ElementKey;
}

// 9:16 세로 카드 — 스토리 공유용. FoxMascot이 이모지 플레이스홀더이므로
// 캡처(html-to-image)해도 별도 이미지 로딩 대기 없이 안전하다.
const FoxCard = forwardRef<HTMLDivElement, FoxCardProps>(function FoxCard(
  { foxName, tagline, element },
  ref
) {
  const bank = ELEMENT_BANK[element];
  return (
    <div
      ref={ref}
      className="relative mx-auto flex aspect-[9/16] w-full max-w-[280px] flex-col items-center justify-center overflow-hidden rounded-3xl p-6 text-center"
      style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #FFEEDD 55%, #FFE3C4 100%)" }}
    >
      <FoxMascot size={88} prop="star" />
      <p className="mt-5 text-2xl font-extrabold text-brown">{foxName}</p>
      <p className="mt-1 px-4 text-sm font-semibold text-coral-dark">{tagline}</p>
      <span
        className="mt-5 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white"
        style={{ backgroundColor: bank.color }}
      >
        {bank.label}({bank.hanja})
      </span>
      <p className="absolute bottom-5 text-[10px] font-semibold tracking-widest text-brown-soft/40">
        여우점 · FOXJUM
      </p>
    </div>
  );
});

export default FoxCard;
