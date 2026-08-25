"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TestDef } from "@/lib/content/tests";

// 심리테스트 퀴즈 러너. 시작 -> 문항 하나씩 -> 합산 점수로 결과 페이지로 이동.
// 채점 자체는 단순 합산이라 클라에서 하고, 결과 유형 판정과 통계 기록은
// 결과 페이지(서버)와 /api/tests/[slug]/play가 담당한다.
export default function TestRunner({ def }: { def: TestDef }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [nickname, setNickname] = useState("");
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const progress = useMemo(() => Math.round((idx / def.questions.length) * 100), [idx, def.questions.length]);

  async function pick(optionScore: number) {
    if (submitting) return;
    const next = score + optionScore;
    if (idx + 1 < def.questions.length) {
      setIdx(idx + 1);
      setScore(next);
      return;
    }
    // 마지막 문항 - 결과 확정 후 기록하고 이동한다.
    setSubmitting(true);
    setScore(next);
    try {
      await fetch(`/api/tests/${def.slug}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: next }),
      }).catch(() => undefined);
    } finally {
      const n = nickname.trim().slice(0, 12);
      const qs = new URLSearchParams({ s: String(next) });
      if (n) qs.set("n", n);
      // t(resultTypeId)는 결과 페이지 서버에서 점수로 다시 계산해 넘겨준다.
      router.replace(`/test/${def.slug}/result?${qs.toString()}`);
    }
  }

  function start() {
    setStarted(true);
    setIdx(0);
    setScore(0);
  }

  if (!started) {
    return (
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 py-14 text-center">
        <span className="text-6xl">{def.emoji}</span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">{def.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-brown-soft">{def.subtitle}</p>

        <div className="mt-8 w-full rounded-3xl border border-brown/5 bg-white p-5 shadow-lg shadow-brown/5">
          <label className="block text-left text-xs font-bold text-brown/60" htmlFor="test-nickname">
            결과 카드에 표시될 이름 <span className="font-normal">(선택)</span>
          </label>
          <input
            id="test-nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={12}
            placeholder="예) 복실이"
            className="mt-2 w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm font-semibold text-brown placeholder:font-normal placeholder:text-brown/30 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/25"
          />
          <button
            onClick={start}
            className="mt-4 w-full rounded-2xl bg-gradient-to-b from-coral to-coral-dark py-3.5 text-base font-extrabold text-white shadow-lg shadow-coral-dark/25 transition active:scale-95"
          >
            {def.questions.length}문항 시작!
          </button>
          <p className="mt-3 text-[11px] font-semibold text-brown/40">로그인 없이 참여할 수 있어요</p>
        </div>
      </div>
    );
  }

  const q = def.questions[idx];

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 py-14">
      {/* 진행바 */}
      <div className="flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-brown/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-coral to-coral-dark transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-extrabold tabular-nums text-brown/50">
          {idx + 1}/{def.questions.length}
        </span>
      </div>

      {/* 문항 */}
      <h2 key={idx} className="mt-10 animate-[fadeIn_0.3s_ease-out] text-lg font-extrabold leading-relaxed tracking-tight text-brown">
        {q.q}
      </h2>

      <div className="mt-6 flex flex-col gap-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            disabled={submitting}
            onClick={() => pick(opt.score)}
            className="w-full rounded-2xl border border-brown/10 bg-white p-4 text-left text-sm font-semibold leading-relaxed text-brown shadow-sm transition hover:border-coral/40 hover:bg-coral/5 active:scale-[0.98]"
          >
            {opt.text}
          </button>
        ))}
      </div>

      {submitting && (
        <p className="mt-6 animate-pulse text-center text-xs font-bold text-coral-dark">
          결과 정리하는 중... 🦊
        </p>
      )}
    </div>
  );
}
