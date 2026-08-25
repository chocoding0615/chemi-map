"use client";

import { useEffect, useState } from "react";
import { watchRewardedAd } from "@/lib/ads";
import { notify } from "@/lib/notify";

interface AdStatus {
  remaining: number;
  limit: number;
}

export default function AdRewardSection() {
  const [status, setStatus] = useState<AdStatus | null>(null);
  const [guest, setGuest] = useState(false);
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    fetch("/api/user/watch-ad")
      .then((res) => {
        if (res.status === 401) {
          setGuest(true);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data: AdStatus | null) => {
        if (data) setStatus(data);
      })
      .catch(() => {});
  }, []);

  if (guest) {
    return <p className="text-center text-sm text-brown-soft">로그인하면 광고 보고 잔디를 받을 수 있어요.</p>;
  }

  async function handleWatch() {
    setWatching(true);
    try {
      await watchRewardedAd();
      const res = await fetch("/api/user/watch-ad", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; remaining: number; limit?: number; reward?: number; error?: string };
      if (!res.ok) {
        notify({ kind: "normal", text: data.error || "받지 못했어요. 다시 시도해주세요." });
        setStatus((prev) => (prev ? { ...prev, remaining: data.remaining } : prev));
        return;
      }
      setStatus((prev) => (prev ? { ...prev, remaining: data.remaining } : prev));
      notify({ kind: "normal", text: `🌱${data.reward} 받았어요!` });
    } catch {
      notify({ kind: "normal", text: "광고를 불러오지 못했어요. 다시 시도해주세요." });
    } finally {
      setWatching(false);
    }
  }

  const loading = status === null;
  const exhausted = status?.remaining === 0;

  return (
    <div className="w-full">
      <div className="rounded-2xl bg-gradient-to-b from-mint/20 to-cream p-6 text-center shadow-inner ring-1 ring-brown/10">
        <p className="text-sm font-semibold text-brown-soft/90">📺 광고 보고 잔디 받기</p>
        <p className="mt-1 text-2xl font-extrabold text-brown">🌱 +1</p>
        <p className="mt-2 text-xs text-brown-soft/60">
          {loading ? "확인 중..." : `오늘 ${status.limit - status.remaining}/${status.limit}회 받음`}
        </p>
        <button
          type="button"
          onClick={handleWatch}
          disabled={watching || loading || exhausted}
          className="mt-4 w-full rounded-2xl bg-gradient-to-b from-coral to-coral-dark py-3.5 text-sm font-bold text-white shadow-lg shadow-coral-dark/25 transition active:scale-95 disabled:opacity-50"
        >
          {watching ? "광고 재생 중..." : exhausted ? "오늘은 다 받았어요" : "광고 보고 🌱1 받기"}
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-brown-soft/40">
        하루 최대 {status?.limit ?? 3}개까지 받을 수 있어요. 내일 다시 채워져요.
      </p>
    </div>
  );
}
