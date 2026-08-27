"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import FoxMascot from "@/components/FoxMascot";
import CharmFlipCard from "@/components/CharmFlipCard";
import { getCharmById, type Rarity } from "@/lib/charms";
import { drawTodayCharm, getTodayDrawResult, DAILY_MESSAGES, type DrawTodayCharmResult } from "@/lib/dailyCharm";
import {
  captureNodeAsPng,
  saveImage,
  shareLink,
  isUserCancelledShare,
  copyPageUrlFallback,
} from "@/lib/shareCard";
import { notify } from "@/lib/notify";

const RARITY_LABEL: Record<Rarity, string> = { common: "커먼", rare: "레어", epic: "에픽" };
const RARITY_DOT: Record<Rarity, string> = {
  common: "bg-rarity-common",
  rare: "bg-rarity-rare",
  epic: "bg-rarity-epic",
};

export default function DailyCharmPage() {
  const [hydrated, setHydrated] = useState(false);
  const [result, setResult] = useState<DrawTodayCharmResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "working" | "copied">("idle");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = getTodayDrawResult();
    if (existing) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setResult({ ...existing, isNewCharm: false });
      setRevealed(true);
      setHydrated(true);
      return;
    }
    // 오늘 내가 뽑은 기록이 없으면, 공유 링크(?charm=id&m=메시지번호)로 들어온 건 아닌지
    // 확인한다 - 안 그러면 친구가 링크를 눌러도 빈 "뽑기" 화면(초기 화면)만 보게 된다.
    const params = new URLSearchParams(window.location.search);
    const charmId = params.get("charm");
    const mIdx = Number.parseInt(params.get("m") ?? "", 10);
    const message = Number.isInteger(mIdx) ? DAILY_MESSAGES[mIdx] : undefined;
    if (charmId && getCharmById(charmId) && message) {
      setResult({ charmId, message, isNewCharm: false });
      setRevealed(true);
    }
    setHydrated(true);
  }, []);

  // result가 생기면(직접 뽑았든, 위 복원 효과로 채워졌든) 항상 URL에 반영해서
  // "공유하기"가 window.location.href를 보낼 때 결과가 그대로 실려 있게 한다.
  useEffect(() => {
    if (!result) return;
    const mIdx = DAILY_MESSAGES.indexOf(result.message);
    if (mIdx < 0) return;
    const url = new URL(window.location.href);
    url.searchParams.set("charm", result.charmId);
    url.searchParams.set("m", String(mIdx));
    window.history.replaceState(null, "", url);
  }, [result]);

  function handleDraw() {
    setDrawing(true);
    setTimeout(() => {
      const drawn = drawTodayCharm();
      setResult(drawn);
      setDrawing(false);
      requestAnimationFrame(() => setRevealed(true));
    }, 350);
  }

  async function handleSaveImage() {
    if (!cardRef.current) return;
    setShareStatus("working");
    try {
      const blob = await captureNodeAsPng(cardRef.current);
      const status = await saveImage(blob, "foxjum-daily-charm.png");
      if (status === "downloaded") notify({ kind: "normal", text: "이미지로 저장했어요! 📸" });
    } catch (err) {
      if (!isUserCancelledShare(err)) notify({ kind: "normal", text: "이미지 저장에 실패했어요. 다시 시도해주세요." });
    } finally {
      setShareStatus("idle");
    }
  }

  async function handleShare() {
    setShareStatus("working");
    try {
      const status = await shareLink("오늘의 부적을 뽑았어요 🎴", window.location.href);
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

  const charm = result ? getCharmById(result.charmId) : null;

  return (
    <div className="mx-auto flex w-full max-w-[480px] md:max-w-2xl flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} prop="scroll" />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">오늘의 부적</h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-brown-soft">
        하루 한 번, 복실이가 부적을 뽑아드려요
      </p>

      {!hydrated ? (
        <div className="mt-8 h-64 w-full animate-pulse rounded-3xl bg-white/60" />
      ) : !result ? (
        <div className="mt-10 flex w-full flex-col items-center">
          <CharmFlipCard emoji="" revealed={false} />
          <p className="mt-6 text-sm leading-relaxed text-brown-soft">오늘은 어떤 부적이 나올까요?</p>
          <button
            type="button"
            onClick={handleDraw}
            disabled={drawing}
            className="mt-5 w-full rounded-xl bg-gradient-to-b from-coral to-coral-dark py-3.5 text-sm font-bold text-white shadow-lg shadow-coral-dark/25 transition active:scale-95 disabled:opacity-60"
          >
            {drawing ? "뽑는 중..." : "부적 뽑기"}
          </button>
        </div>
      ) : (
        <div className="mt-10 flex w-full flex-col items-center">
          <CharmFlipCard emoji={charm?.emoji ?? "🎴"} revealed={revealed} />

          {charm?.rarity === "epic" && (
            <p className="mt-4 text-sm font-bold text-coral-dark">✨ 귀한 부적이 나왔어요!</p>
          )}

          <div ref={cardRef} className="mt-4 w-full rounded-2xl bg-gradient-to-b from-apricot to-cream p-5 text-center">
            <p className="text-lg font-extrabold text-brown">{charm?.name}</p>
            {charm && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-brown-soft">
                <span className={`h-2 w-2 rounded-full ${RARITY_DOT[charm.rarity]}`} />
                {RARITY_LABEL[charm.rarity]}
              </span>
            )}
            <p className="mt-3 text-sm leading-relaxed text-brown-soft">{result.message}</p>
            <p className="mt-4 text-[10px] font-semibold tracking-widest text-brown-soft/30">여우점 · FOXJUM</p>
          </div>

          <p className="mt-4 text-xs font-semibold text-coral-dark">
            {result.isNewCharm ? "부적 주머니에 담겼어요 👝" : "이미 가진 부적이에요, 오늘도 잘 부탁해요!"}
          </p>

          <div className="mt-5 grid w-full grid-cols-2 gap-2">
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

          <Link href="/my?tab=collection" className="mt-4 text-xs font-semibold text-brown-soft/90 underline underline-offset-2">
            부적 주머니 보러 가기
          </Link>
          <p className="mt-2 text-[11px] text-brown-soft/40">내일 다시 올래요? 🌙</p>
        </div>
      )}
    </div>
  );
}
