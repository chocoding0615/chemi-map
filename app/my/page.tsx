"use client";

import { useEffect, useState } from "react";
import FoxMascot from "@/components/FoxMascot";
import { getActivity, getCashBalance, addCash, type ActivityEntry } from "@/lib/localActivity";

export default function MyPage() {
  const [hydrated, setHydrated] = useState(false);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [cash, setCash] = useState(0);
  const [charging, setCharging] = useState(false);

  useEffect(() => {
    // 서버 렌더와의 하이드레이션 불일치를 피하려고 마운트 후에만 localStorage를 읽는다.
    /* eslint-disable react-hooks/set-state-in-effect */
    setActivity(getActivity());
    setCash(getCashBalance());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function handleCharge() {
    setCharging(true);
    setTimeout(() => {
      setCash(addCash(1000));
      setCharging(false);
    }, 700);
  }

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">마이페이지</h1>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-brown-soft/40">
        이 브라우저에만 저장돼요 · 다른 기기·앱에서는 보이지 않아요
      </p>

      {!hydrated ? (
        <div className="mt-8 h-56 w-full animate-pulse rounded-3xl bg-white/60" />
      ) : (
        <>
          <div className="mt-8 w-full rounded-2xl bg-gradient-to-b from-lavender/30 to-cream p-6 text-center shadow-inner ring-1 ring-brown/10">
            <p className="text-xs font-semibold text-brown-soft/50">질문권 잔액</p>
            <p className="mt-1 text-3xl font-extrabold text-brown">{cash.toLocaleString()}원</p>
            <button
              type="button"
              onClick={handleCharge}
              disabled={charging}
              className="mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-lavender-dark shadow-sm ring-1 ring-brown/10 transition active:scale-95 disabled:opacity-60"
            >
              {charging ? "충전 처리 중..." : "충전하기 (테스트, 실제 결제 아님)"}
            </button>
          </div>

          <div className="mt-8 w-full">
            <h2 className="text-sm font-semibold text-brown-soft/50">구매한 풀이</h2>
            {activity.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-white p-5 text-center text-sm text-brown-soft/50 ring-1 ring-brown/5">
                아직 열어본 풀이가 없어요.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brown/5"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-coral-dark">{item.category}</p>
                      <p className="truncate text-sm font-bold text-brown">{item.title}</p>
                      <p className="mt-0.5 text-[11px] text-brown-soft/40">
                        {new Date(item.unlockedAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-xs font-bold text-brown-soft/60">
                      {item.priceKrw > 0 ? `${item.priceKrw.toLocaleString()}원` : "무료"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
