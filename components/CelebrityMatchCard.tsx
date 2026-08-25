import { forwardRef } from "react";
import { ELEMENT_BANK, type ElementKey } from "@/lib/result-engine/elements";
import type { CelebrityEntry } from "@/lib/content/celebrities";

interface CelebrityMatchCardProps {
  element: ElementKey;
  male: CelebrityEntry;
  female: CelebrityEntry;
  maleImageUrl: string | null;
  femaleImageUrl: string | null;
  /** 공유 이미지 안에 찍히는 안내 문구용 사이트 주소(없으면 그 줄은 생략). */
  siteUrl?: string;
}

function Portrait({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-white/80">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- 위키미디어 외부 이미지, next/image 최적화 대상 아님. crossOrigin은 캡처(html-to-image) 시 캔버스가 오염되지 않게 하기 위함.
        <img src={imageUrl} alt={name} crossOrigin="anonymous" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-3xl">🦊</div>
      )}
    </div>
  );
}

// 9:16 세로 카드 — 스토리 공유용. FoxCard와 같은 톤(오행 배경색, 하단 안내 문구).
const CelebrityMatchCard = forwardRef<HTMLDivElement, CelebrityMatchCardProps>(function CelebrityMatchCard(
  { element, male, female, maleImageUrl, femaleImageUrl, siteUrl },
  ref
) {
  const bank = ELEMENT_BANK[element];

  return (
    <div
      ref={ref}
      className="relative mx-auto flex aspect-[9/16] w-full max-w-[280px] flex-col items-center overflow-hidden rounded-3xl px-6 py-8 text-center"
      style={{ background: `linear-gradient(180deg, ${bank.color}33 0%, #FFFFFF 100%)` }}
    >
      <p className="text-[10px] font-bold tracking-widest text-brown-soft/40">나와 잘 맞는 유명인</p>
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <div className="flex flex-col items-center gap-2">
          <Portrait name={male.name} imageUrl={maleImageUrl} />
          <p className="text-lg font-extrabold text-brown">{male.name}</p>
        </div>
        <p className="text-xs font-bold text-brown-soft/50">&</p>
        <div className="flex flex-col items-center gap-2">
          <Portrait name={female.name} imageUrl={femaleImageUrl} />
          <p className="text-lg font-extrabold text-brown">{female.name}</p>
        </div>
        <p className="mt-1 text-[11px] text-brown-soft/40">
          {bank.label}({bank.hanja}) 기운과 잘 맞는 인연이에요
        </p>
      </div>
      <p className="text-[10px] font-semibold tracking-widest text-brown-soft/40">
        여우점에서 내 유명인 매칭 확인하기
      </p>
      {siteUrl && <p className="mt-0.5 text-[9px] text-brown-soft/30">{siteUrl}</p>}
    </div>
  );
});

export default CelebrityMatchCard;
