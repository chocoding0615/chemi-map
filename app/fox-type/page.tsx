"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import FoxMascot from "@/components/FoxMascot";
import FoxCharacterImage from "@/components/FoxCharacterImage";
import FoxCard from "@/components/FoxCard";
import MbtiSelect from "@/components/MbtiSelect";
import BirthDatePicker from "@/components/BirthDatePicker";
import { calculateElementProfile, ELEMENT_BANK, type ElementKey } from "@/lib/result-engine/elements";
import { getFoxType, type FoxTypeResult } from "@/lib/result-engine/foxType";
import { captureNodeAsPng, downloadBlob, shareImageOrCopyLink } from "@/lib/shareCard";
import { awardForAction } from "@/lib/foxRewards";
import { registerBackHandler } from "@/lib/backHandler";

interface PageResult extends FoxTypeResult {
  distribution: Record<ElementKey, number>;
}

export default function FoxTypePage() {
  const [birthdate, setBirthdate] = useState("");
  const [isLunar, setIsLunar] = useState(false);
  const [mbti, setMbti] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PageResult | null>(null);
  const [shareStatus, setShareStatus] = useState<"idle" | "working" | "copied">("idle");
  const [siteUrl, setSiteUrl] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 서버 렌더와의 하이드레이션 불일치를 피하려고 마운트 후에만 origin을 읽는다.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setSiteUrl(window.location.origin.replace(/^https?:\/\//, ""));
  }, []);

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
    const { distribution } = calculateElementProfile(birthdate, undefined, { isLunar: isLunar || undefined });
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
    <div className="mx-auto flex w-full max-w-[480px] md:max-w-2xl flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} prop="star" />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">나는 무슨 여우상일까</h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-brown-soft">
        생일만 넣어도 바로 알 수 있어요 · 무료
      </p>

      {!result ? (
        <form
          onSubmit={handleSubmit}
          className="mt-8 w-full space-y-5 rounded-3xl bg-white p-6 shadow-xl shadow-brown/5 ring-1 ring-brown/5"
        >
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brown">생년월일</label>
            <BirthDatePicker value={birthdate} onChange={setBirthdate} isLunar={isLunar} onLunarChange={setIsLunar} />
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
        <div
          className="mt-8 w-full rounded-2xl p-6 text-center shadow-inner ring-1 ring-brown/10"
          style={{ background: `linear-gradient(180deg, ${result.bg} 0%, #fff8f0 100%)` }}
        >
          <div className="flex justify-center">
            <FoxCharacterImage src={result.img} fallbackEmoji={result.prop} size={72} alt={result.label} />
          </div>
          <p className="mt-3 text-xl font-extrabold text-brown">{result.label}</p>
          <p className="mt-1 text-sm font-semibold" style={{ color: result.color }}>
            {result.tagline}
          </p>
          {result.matchTag && (
            <span
              className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ backgroundColor: result.color }}
            >
              {result.matchTag.label}
            </span>
          )}
          <p className="mt-4 text-sm leading-relaxed text-brown-soft">{result.description}</p>
          {result.matchTag && (
            <p className="mt-2 text-xs leading-relaxed text-brown-soft/90">{result.matchTag.desc}</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-lg bg-cream p-2">
              <p className="font-bold text-coral-dark">행운의 색</p>
              <p className="mt-0.5 text-brown-soft">{result.luckyColor}</p>
            </div>
            <div className="rounded-lg bg-cream p-2">
              <p className="font-bold text-coral-dark">행운의 아이템</p>
              <p className="mt-0.5 text-brown-soft">{result.luckyItem}</p>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-brown-soft/40">
            {ELEMENT_BANK[result.element].label}({ELEMENT_BANK[result.element].hanja}) 기운이 가장 강해요
          </p>

          <div className="mt-5">
            <FoxCard
              ref={cardRef}
              label={result.label}
              tagline={result.tagline}
              element={result.element}
              color={result.color}
              bg={result.bg}
              img={result.img}
              prop={result.prop}
              matchTag={result.matchTag}
              distribution={result.distribution}
              siteUrl={siteUrl}
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
            href="/saju"
            className="mt-3 block w-full rounded-xl bg-lavender/30 py-3 text-sm font-bold text-lavender-dark transition active:scale-95 hover:bg-lavender/40"
          >
            🔮 이 여우의 올해 인연운 보러가기
          </Link>

          <button
            type="button"
            onClick={() => setResult(null)}
            className="mt-4 text-xs font-semibold text-brown-soft/90 underline underline-offset-2"
          >
            다시 확인하기
          </button>
        </div>
      )}
    </div>
  );
}
