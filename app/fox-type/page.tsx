"use client";

import { useRef, useState } from "react";
import FoxMascot from "@/components/FoxMascot";
import ElementIcon from "@/components/ElementIcon";
import FoxCard from "@/components/FoxCard";
import { calculateElementProfile, type ElementKey } from "@/lib/result-engine/elements";
import { getFoxType, type FoxTypeEntry } from "@/lib/result-engine/foxType";
import { captureNodeAsPng, downloadBlob, shareImageOrCopyLink } from "@/lib/shareCard";
import { awardForAction } from "@/lib/foxRewards";

interface FoxTypeResult {
  element: ElementKey;
  entry: FoxTypeEntry;
  description: string;
}

export default function FoxTypePage() {
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<FoxTypeResult | null>(null);
  const [shareStatus, setShareStatus] = useState<"idle" | "working" | "copied">("idle");
  const cardRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!birthdate) {
      setError("생년월일을 입력해주세요.");
      return;
    }
    setError("");
    const { dominant } = calculateElementProfile(birthdate);
    const { entry, description } = getFoxType(dominant, birthdate);
    setResult({ element: dominant, entry, description });
    awardForAction("foxtype");
  }

  async function handleSaveImage() {
    if (!cardRef.current || !result) return;
    setShareStatus("working");
    try {
      const blob = await captureNodeAsPng(cardRef.current);
      downloadBlob(blob, `여우점_${result.entry.name}.png`);
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
      const status = await shareImageOrCopyLink(
        blob,
        `여우점_${result.entry.name}.png`,
        `나는 ${result.entry.name}! ${result.entry.tagline} 🦊`
      );
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
        생일 하나만 넣으면 바로 알 수 있어요 · 무료
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
          <p className="mt-3 text-xl font-extrabold text-brown">{result.entry.name}</p>
          <p className="mt-1 text-sm font-semibold text-coral-dark">{result.entry.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-brown-soft/70">{result.description}</p>

          <div className="mt-5">
            <FoxCard ref={cardRef} foxName={result.entry.name} tagline={result.entry.tagline} element={result.element} />
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
