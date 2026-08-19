"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress, TAIL_THRESHOLDS, type FoxProgress } from "@/lib/progress";
import { onProgressChanged } from "@/lib/notify";

export default function TailProgress() {
  const [progress, setProgress] = useState<FoxProgress | null>(null);

  useEffect(() => {
    function refresh() {
      setProgress(getProgress());
    }
    // 서버 렌더와의 하이드레이션 불일치를 피하려고 마운트 후에만 localStorage를 읽는다.
    refresh();
    return onProgressChanged(refresh);
  }, []);

  if (!progress) {
    return <div className="mx-auto h-8 w-full max-w-[480px]" />;
  }

  const tails = progress.tails;
  const prevThreshold = TAIL_THRESHOLDS[tails];
  const nextThreshold = TAIL_THRESHOLDS[Math.min(tails + 1, 9)];
  const span = Math.max(1, nextThreshold - prevThreshold);
  const ratio = tails >= 9 ? 1 : Math.min(1, (progress.exp - prevThreshold) / span);

  return (
    <Link href="/collection" className="mx-auto flex w-full max-w-[480px] items-center gap-2 px-6 pt-3 text-xs">
      <span className="shrink-0 font-bold text-coral-dark">🦊 꼬리 {tails}/9</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brown/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-coral to-lavender transition-all"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="shrink-0 text-brown-soft/40">부적함</span>
    </Link>
  );
}
