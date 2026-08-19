"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyMapSlug } from "@/lib/myMap";

export default function MyMapBanner() {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    // 서버 렌더와의 하이드레이션 불일치를 피하려고 마운트 후에만 localStorage를 읽는다.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setSlug(getMyMapSlug());
  }, []);

  if (!slug) return null;

  return (
    <Link
      href={`/m/${slug}`}
      className="mt-6 flex w-full items-center justify-between rounded-2xl bg-gradient-to-b from-coral to-coral-dark px-5 py-4 text-white shadow-lg shadow-coral-dark/25 transition active:scale-[0.98]"
    >
      <span className="text-sm font-bold">🗺️ 내가 만든 지도 보러 가기</span>
      <span className="text-lg">→</span>
    </Link>
  );
}
