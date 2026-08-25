"use client";

import { forwardRef, useState } from "react";
import { ELEMENT_BANK, type ElementKey } from "@/lib/result-engine/elements";
import type { CelebrityEntry } from "@/lib/content/celebrities";

interface CelebrityMatchCardProps {
  element: ElementKey;
  celebrity: CelebrityEntry;
  imageUrl: string | null;
  /** 공유 이미지 안에 찍히는 안내 문구용 사이트 주소(없으면 그 줄은 생략). */
  siteUrl?: string;
}

const FALLBACK_RATIO = 3 / 4; // 위키 인물 사진 대부분이 3:4 근처라 로딩 전 기본값으로 사용

// 9:16 세로 카드 — 스토리 공유용. FoxCard와 같은 톤(오행 배경색, 하단 안내 문구).
// 사진 프레임을 고정 크기로 두고 object-contain만 쓰면, 프레임 비율과 실제 사진
// 비율이 달라서 옆(또는 위아래)에 빈 여백이 생긴다. 그렇다고 object-cover로 채우면
// 얼굴/머리가 잘리는 인물이 나온다. 그래서 프레임 자체를 사진의 실제 가로세로
// 비율에 맞춰(aspect-ratio) 렌더링한다 - 사진을 늘리지도, 자르지도, 여백을
// 남기지도 않는다.
const CelebrityMatchCard = forwardRef<HTMLDivElement, CelebrityMatchCardProps>(function CelebrityMatchCard(
  { element, celebrity, imageUrl, siteUrl },
  ref
) {
  const bank = ELEMENT_BANK[element];
  const [ratio, setRatio] = useState(FALLBACK_RATIO);

  return (
    <div
      ref={ref}
      className="relative mx-auto flex aspect-[9/16] w-full max-w-[320px] flex-col items-center overflow-hidden rounded-3xl px-6 py-8 text-center"
      style={{ background: `linear-gradient(180deg, ${bank.color}33 0%, #FFFFFF 100%)` }}
    >
      <p className="text-[10px] font-bold tracking-widest text-brown-soft/40">나와 잘 맞는 유명인</p>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
        <div
          className="w-full max-h-64 overflow-hidden rounded-2xl bg-white/70"
          style={{ aspectRatio: imageUrl ? ratio : FALLBACK_RATIO }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- 위키미디어 외부 이미지, next/image 최적화 대상 아님. crossOrigin은 캡처(html-to-image) 시 캔버스가 오염되지 않게 하기 위함.
            <img
              src={imageUrl}
              alt={celebrity.name}
              crossOrigin="anonymous"
              className="h-full w-full object-contain"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">🦊</div>
          )}
        </div>
        <p className="text-2xl font-extrabold text-brown">{celebrity.name}</p>
        <p className="px-2 text-sm leading-relaxed text-brown-soft">{celebrity.blurb}</p>
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
