"use client";

import { useEffect, useState } from "react";
import { getCelebrityMatches } from "@/lib/result-engine/celebrityMatch";
import type { ElementKey } from "@/lib/result-engine/elements";
import type { CelebrityEntry } from "@/lib/content/celebrities";

interface CelebrityMatchSectionProps {
  dominant: ElementKey;
  seed: string;
}

interface ImageInfo {
  imageUrl: string;
  sourcePageUrl: string;
}

function CelebrityCard({ entry, image, loading }: { entry: CelebrityEntry; image: ImageInfo | null; loading: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-brown/10">
      <div className="h-20 w-20 overflow-hidden rounded-full bg-cream ring-2 ring-coral/20">
        {loading ? (
          <div className="h-full w-full animate-pulse bg-brown/10" />
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element -- 외부(위키미디어) 이미지라 next/image 최적화 대상이 아님
          <img src={image.imageUrl} alt={entry.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">🦊</div>
        )}
      </div>
      <p className="mt-2 text-sm font-extrabold text-brown">{entry.name}</p>
      <p className="mt-1 text-xs leading-relaxed text-brown-soft">{entry.blurb}</p>
      {image && (
        <a
          href={image.sourcePageUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-2 text-[10px] font-semibold text-brown/30 underline underline-offset-2"
        >
          사진: 위키백과
        </a>
      )}
    </div>
  );
}

// 나와 가장 잘 맞는 오행 쪽 유명인을 성별 무관하게 남/녀 한 명씩 보여준다.
// 매칭 자체(getCelebrityMatches)는 결정론적 순수 함수라 클라이언트에서 바로 계산하고,
// 사진만 서버(캐시 API)에서 받아온다.
export default function CelebrityMatchSection({ dominant, seed }: CelebrityMatchSectionProps) {
  const matches = getCelebrityMatches(dominant, seed);
  const [images, setImages] = useState<Record<string, ImageInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/celebrity-image?ids=${matches.male.id},${matches.female.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { images: Record<string, ImageInfo> } | null) => {
        if (!cancelled && data) setImages(data.images);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [matches.male.id, matches.female.id]);

  return (
    <div className="border-t border-brown/10 pt-4">
      <p className="text-xs font-bold text-coral-dark">✨ 나와 잘 맞는 유명인</p>
      <div className="mt-3 flex gap-3">
        <CelebrityCard entry={matches.male} image={images[matches.male.id] ?? null} loading={loading} />
        <CelebrityCard entry={matches.female} image={images[matches.female.id] ?? null} loading={loading} />
      </div>
    </div>
  );
}
