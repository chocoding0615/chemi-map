"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import FoxMascot from "@/components/FoxMascot";
import ElementIcon from "@/components/ElementIcon";
import FoxCard from "@/components/FoxCard";
import MbtiSelect from "@/components/MbtiSelect";
import { calculateElementProfile, type ElementKey } from "@/lib/result-engine/elements";
import { getFoxType, type FoxTypeResult } from "@/lib/result-engine/foxType";
import { captureNodeAsPng, downloadBlob, shareImageOrCopyLink } from "@/lib/shareCard";
import { awardForAction } from "@/lib/foxRewards";
import { registerBackHandler } from "@/lib/backHandler";

const MATCH_TAG_STYLE: Record<string, string> = {
  "타고난 결": "bg-lavender/40 text-lavender-dark",
  "은은한 조화": "bg-mint/30 text-mint-dark",
  "반전 매력": "bg-coral/25 text-coral-dark",
};

interface PageResult extends FoxTypeResult {
  distribution: Record<ElementKey, number>;
}

export default function FoxTypePage() {
  const [birthdate, setBirthdate] = useState("");
  const [mbti, setMbti] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PageResult | null>(null);
  const [shareStatus, setShareStatus] = useState<"idle" | "working" | "copied">("idle");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result) return;
    return registerBackHandler(() => setResult(null));
  }, [result]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!birthdate) {
      setError("생년월일을 입력해주세요.");
      return;
    }
    setError("");
    const { distribution } = calculateElementProfile(birthdate);
    const foxType = getFoxType({ distribution, mbti: mbti || undefined });
    setResult({ ...foxType, distribution });
    awardForAction("foxtype");
  }

  async function handleSaveImage() {
    if (!cardRef.current || !result) return;
    setShareStatus("working");
    try {
      const blob = await captureNodeAsPng(cardRef.current);
      downloadBlob(blob, `foxjum-${result.element}.png`);
      awardForAction("share");
    } catch {
      // 캡처 실패 — 조용히 무시(브라우저 호환성 이슈일 가능성)
    } finally {
      setShareStatus("idle");
    }
  }

  async function handleShare() {
    if (!cardRef.current || !result) return;
    setShareStatus("working");
    try {
      const blob = await captureNodeAsPng(cardRef.current);
      const status = await shareImageOrCopyLink(blob, `foxjum-${result.element}.png`, `나는 ${result.label}! 🦊`);
      awardForAction("share");
      setShareStatus(status === "copied" ? "copied" : "idle");
      if (status === "copied") setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      setShareStatus("idle");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} prop="star" />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">나는 무슨 여우상일까</h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-brown-soft/60">
        생일만 넣어도 바로 알 수 있어요 · 무료
      </p>

      {!result ? (
        <form
          onSubmit={handleSubmit}
          className="mt-8 w-full space-y-5 rounded-3xl bg-white p-6 shadow-xl shadow-brown/5 ring-1 ring-brown/5"
        >
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brown">생년월일</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brown">
              성격유형 <span className="font-normal text-brown/40">(선택, 넣으면 궁합 태그가 함께 나와요)</span>
            </label>
            <MbtiSelect value={mbti} onChange={setMbti} />
          </div>
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-b from-mint to-mint-dark py-3.5 text-sm font-bold text-white shadow-lg shadow-mint-dark/25 transition active:scale-95 hover:brightness-105"
          >
            여우상 확인하기
          </button>
        </form>
      ) : (
        <div className="mt-8 w-full rounded-2xl bg-gradient-to-b from-apricot to-cream p-6 text-center shadow-inner ring-1 ring-brown/10">
          <div className="flex justify-center gap-2">
            <ElementIcon element={result.element} size={64} />
          </div>
          <p className="mt-3 text-xl font-extrabold text-brown">{result.label}</p>
          {result.matchTag && (
            <span
              className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${MATCH_TAG_STYLE[result.matchTag]}`}
            >
              {result.matchTag}
            </span>
          )}
          <p className="mt-4 text-sm leading-relaxed text-brown-soft/70">{result.description}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-lg bg-cream p-2">
              <p className="font-bold text-coral-dark">행운의 색</p>
              <p className="mt-0.5 text-brown-soft/70">{result.luckyColor}</p>
            </div>
            <div className="rounded-lg bg-cream p-2">
              <p className="font-bold text-coral-dark">행운의 아이템</p>
              <p className="mt-0.5 text-brown-soft/70">{result.luckyItem}</p>
            </div>
          </div>

          <div className="mt-5">
            <FoxCard
              ref={cardRef}
              label={result.label}
              element={result.element}
              matchTag={result.matchTag}
              distribution={result.distribution}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSaveImage}
              disabled={shareStatus === "working"}
              className="rounded-xl bg-white py-3 text-sm font-bold text-coral-dark shadow-sm ring-1 ring-brown/10 transition active:scale-95 hover:bg-cream disabled:opacity-60"
            >
              이미지 저장
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={shareStatus === "working"}
              className="rounded-xl bg-gradient-to-b from-coral to-coral-dark py-3 text-sm font-bold text-white shadow-md shadow-coral-dark/25 transition active:scale-95 disabled:opacity-60"
            >
              {shareStatus === "copied" ? "링크 복사됨!" : "공유하기"}
            </button>
          </div>

          <Link
            href="/fortune/love"
            className="mt-3 block w-full rounded-xl bg-lavender/30 py-3 text-sm font-bold text-lavender-dark transition active:scale-95 hover:bg-lavender/40"
          >
            🔮 이 여우의 올해 인연운 자세히 보기
          </Link>

          <button
            type="button"
            onClick={() => setResult(null)}
            className="mt-4 text-xs font-semibold text-brown-soft/50 underline underline-offset-2"
          >
            다시 확인하기
          </button>
        </div>
      )}
    </div>
  );
}
