"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import FoxMascot from "@/components/FoxMascot";
import BirthDatePicker from "@/components/BirthDatePicker";
import CelebrityMatchCard from "@/components/CelebrityMatchCard";
import { calculateElementProfile, ELEMENT_BANK, type ElementKey } from "@/lib/result-engine/elements";
import { getCelebrityMatches, type CelebrityMatches } from "@/lib/result-engine/celebrityMatch";
import {
  captureNodeAsPng,
  downloadBlob,
  shareImageOrCopyLink,
  isUserCancelledShare,
  copyPageUrlFallback,
} from "@/lib/shareCard";
import { awardForAction } from "@/lib/foxRewards";
import { registerBackHandler } from "@/lib/backHandler";
import { notify } from "@/lib/notify";

interface ImageInfo {
  imageUrl: string;
  sourcePageUrl: string;
}

interface PageResult extends CelebrityMatches {
  element: ElementKey;
}

export default function CelebMatchPage() {
  const [birthdate, setBirthdate] = useState("");
  const [isLunar, setIsLunar] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PageResult | null>(null);
  const [images, setImages] = useState<Record<string, ImageInfo>>({});
  // 이 키(id 쌍)에 대한 이미지가 이미 왔는지로 로딩 여부를 판단한다 - 별도 boolean을
  // 이펙트 시작부에서 동기적으로 set하지 않아도 되어 cascading render를 피한다.
  const [imagesFetchedFor, setImagesFetchedFor] = useState<string | null>(null);
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

  useEffect(() => {
    if (!result) return;
    const key = `${result.male.id},${result.female.id}`;
    let cancelled = false;
    fetch(`/api/celebrity-image?ids=${key}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { images: Record<string, ImageInfo> } | null) => {
        if (cancelled) return;
        if (data) setImages(data.images);
        setImagesFetchedFor(key);
      })
      .catch(() => {
        if (!cancelled) setImagesFetchedFor(key);
      });
    return () => {
      cancelled = true;
    };
  }, [result]);

  const imagesLoading = result ? imagesFetchedFor !== `${result.male.id},${result.female.id}` : false;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!birthdate) {
      setError("생년월일을 입력해주세요.");
      return;
    }
    setError("");
    const { dominant } = calculateElementProfile(birthdate, undefined, { isLunar: isLunar || undefined });
    const matches = getCelebrityMatches(dominant, `${birthdate}-${isLunar}-celeb`);
    setResult({ element: dominant, ...matches });
    awardForAction("celebmatch");
  }

  async function handleSaveImage() {
    if (!cardRef.current || !result) return;
    setShareStatus("working");
    try {
      const blob = await captureNodeAsPng(cardRef.current);
      downloadBlob(blob, `yeojujeom-celeb-${result.element}.png`);
      awardForAction("share");
    } catch {
      notify({ kind: "normal", text: "이미지 저장에 실패했어요. 다시 시도해주세요." });
    } finally {
      setShareStatus("idle");
    }
  }

  async function handleShare() {
    if (!cardRef.current || !result) return;
    setShareStatus("working");
    try {
      const blob = await captureNodeAsPng(cardRef.current);
      const text = `나랑 잘 맞는 유명인은 ${result.male.name} · ${result.female.name}래! 🦊`;
      const status = await shareImageOrCopyLink(blob, `yeojujeom-celeb-${result.element}.png`, text, window.location.href);
      awardForAction("share");
      setShareStatus(status === "copied" ? "copied" : "idle");
      if (status === "copied") setTimeout(() => setShareStatus("idle"), 2000);
    } catch (err) {
      setShareStatus("idle");
      if (isUserCancelledShare(err)) return;
      const copied = await copyPageUrlFallback();
      notify({
        kind: "normal",
        text: copied ? "공유는 실패했지만 링크는 복사했어요!" : "공유에 실패했어요. 다시 시도해주세요.",
      });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[480px] md:max-w-2xl flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} prop="star" />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">나랑 잘 맞는 유명인은?</h1>
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
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-b from-mint to-mint-dark py-3.5 text-sm font-bold text-white shadow-lg shadow-mint-dark/25 transition active:scale-95 hover:brightness-105"
          >
            유명인 매칭 확인하기
          </button>
        </form>
      ) : (
        <div
          className="mt-8 w-full rounded-2xl p-6 text-center shadow-inner ring-1 ring-brown/10"
          style={{ background: `linear-gradient(180deg, ${ELEMENT_BANK[result.element].color}22 0%, #fff8f0 100%)` }}
        >
          <p className="text-sm leading-relaxed text-brown-soft">
            당신은 {ELEMENT_BANK[result.element].label}({ELEMENT_BANK[result.element].hanja}) 기운과 잘 맞는 편이에요.
            <br />그 기운을 닮은 유명인은 바로 이 두 분이에요.
          </p>

          <div className="mt-5">
            <CelebrityMatchCard
              ref={cardRef}
              element={result.element}
              male={result.male}
              female={result.female}
              maleImageUrl={imagesLoading ? null : (images[result.male.id]?.imageUrl ?? null)}
              femaleImageUrl={imagesLoading ? null : (images[result.female.id]?.imageUrl ?? null)}
              siteUrl={siteUrl}
            />
          </div>

          <div className="mt-4 space-y-1.5 text-left">
            {[result.male, result.female].map((entry) => {
              const image = images[entry.id];
              return (
                <div key={entry.id} className="rounded-xl bg-white/60 p-2.5">
                  <p className="text-xs font-bold text-brown">{entry.name}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-brown-soft">{entry.blurb}</p>
                  {image && (
                    <a
                      href={image.sourcePageUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="mt-1 inline-block text-[10px] font-semibold text-brown/30 underline underline-offset-2"
                    >
                      사진: 위키백과
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSaveImage}
              disabled={shareStatus === "working" || imagesLoading}
              className="rounded-xl bg-white py-3 text-sm font-bold text-coral-dark shadow-sm ring-1 ring-brown/10 transition active:scale-95 hover:bg-cream disabled:opacity-60"
            >
              이미지 저장
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={shareStatus === "working" || imagesLoading}
              className="rounded-xl bg-gradient-to-b from-coral to-coral-dark py-3 text-sm font-bold text-white shadow-md shadow-coral-dark/25 transition active:scale-95 disabled:opacity-60"
            >
              {shareStatus === "copied" ? "링크 복사됨!" : "공유하기"}
            </button>
          </div>

          <Link
            href="/saju"
            className="mt-3 block w-full rounded-xl bg-lavender/30 py-3 text-sm font-bold text-lavender-dark transition active:scale-95 hover:bg-lavender/40"
          >
            🔮 내 사주도 자세히 보러가기
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
