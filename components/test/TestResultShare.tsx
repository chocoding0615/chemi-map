"use client";

import { useRef, useState } from "react";
import {
  captureNodeAsPng,
  downloadBlob,
  shareImageOrCopyLink,
  isUserCancelledShare,
} from "@/lib/shareCard";
import { notify } from "@/lib/notify";

export type CardTheme = "ice" | "wave" | "fire" | "burst";

const THEME_BG: Record<CardTheme, string> = {
  ice: "from-sky-100 via-blue-50 to-indigo-100",
  wave: "from-cyan-100 via-teal-50 to-teal-100",
  fire: "from-orange-100 via-amber-50 to-red-100",
  burst: "from-fuchsia-100 via-purple-50 to-violet-200",
};

export interface TestResultCardData {
  slug: string;
  testTitle: string;
  emoji: string;
  name: string;
  tagline: string;
  nickname: string;
  score: number;
  percent: number;
  theme: CardTheme;
}

// 캡처 영역(카드)과 공유 버튼을 한 컴포넌트에 담았다.
// 카드는 html-to-image로 PNG로 뽑아 저장/공유한다 - 스크린샷 문화를 정면으로 타는 장르라 필수.
export default function TestResultShare({ data }: { data: TestResultCardData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"save" | "share" | null>(null);

  const who = data.nickname ? `${data.nickname}님의 점수` : "내 점수";

  async function makeBlob(): Promise<Blob> {
    if (!cardRef.current) throw new Error("카드를 찾지 못했어요.");
    return captureNodeAsPng(cardRef.current);
  }

  async function onSave() {
    setBusy("save");
    try {
      downloadBlob(await makeBlob(), `yeojujeom-${data.name}.png`);
      notify({ kind: "normal", text: "이미지로 저장했어요! 📸" });
    } catch (err) {
      if (!isUserCancelledShare(err)) notify({ kind: "normal", text: "저장에 실패했어요 😢" });
    } finally {
      setBusy(null);
    }
  }

  async function onShare() {
    setBusy("share");
    try {
      const blob = await makeBlob();
      // 결과 페이지(내 점수) 링크가 아니라 테스트 시작 링크를 보내야 받은 사람이
      // 바로 자기 결과를 볼 수 있다 - 이미지만 보내면 받은 사람은 참여할 방법이 없었다.
      const inviteUrl = `${window.location.origin}/test/${data.slug}`;
      const res = await shareImageOrCopyLink(blob, `yeojujeom-${data.name}.png`, `${data.nickname || "나"}는 ${data.name}? 나도 해봐!`, inviteUrl);
      notify({ kind: "normal", text: res === "shared" ? "공유했어요! 🎉" : "링크를 복사했어요! 🔗" });
    } catch (err) {
      if (!isUserCancelledShare(err)) notify({ kind: "normal", text: "공유에 실패했어요 😢" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex w-full flex-col items-center">
      {/* ===== 캡처되는 카드 영역 ===== */}
      <div
        ref={cardRef}
        className={`flex w-full flex-col items-center rounded-[2rem] bg-gradient-to-br ${THEME_BG[data.theme]} px-8 py-10 shadow-xl shadow-brown/10`}
      >
        <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-extrabold tracking-wide text-brown/60">
          여우점 · {data.testTitle}
        </span>
        <span className="mt-6 text-[64px] leading-none drop-shadow-sm">{data.emoji}</span>
        <p
          className="mt-4 text-center text-3xl font-extrabold text-brown"
          style={{ fontFamily: "var(--font-hand)" }}
        >
          {data.name}
        </p>
        <p className="mt-2 text-center text-sm font-bold italic text-brown/60">“{data.tagline}”</p>

        <div className="mt-7 w-full rounded-2xl bg-white/75 py-3.5 text-center backdrop-blur-sm">
          <p className="text-xs font-bold text-brown/50">{who}</p>
          <p className="text-xl font-extrabold tabular-nums text-coral-dark">{data.score}점</p>
        </div>
        <div className="mt-2.5 w-full rounded-2xl bg-white/75 py-2.5 text-center backdrop-blur-sm">
          <p className="text-xs font-bold text-brown/60">
            전국민 <span className="font-extrabold text-coral-dark">{data.percent}%</span>가 같은 유형
          </p>
        </div>

        <p className="mt-7 text-[10px] font-extrabold tracking-widest text-brown/35">YEOJUJEOM 🦊</p>
      </div>
      {/* ===== /캡처 영역 ===== */}

      <div className="mt-6 flex w-full gap-3">
        <button
          onClick={onSave}
          disabled={busy !== null}
          className="flex-1 rounded-2xl border border-brown/15 bg-white py-3.5 text-sm font-extrabold text-brown shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          {busy === "save" ? "만드는 중..." : "📸 이미지 저장"}
        </button>
        <button
          onClick={onShare}
          disabled={busy !== null}
          className="flex-1 rounded-2xl bg-gradient-to-b from-coral to-coral-dark py-3.5 text-sm font-extrabold text-white shadow-lg shadow-coral-dark/25 transition active:scale-95 disabled:opacity-50"
        >
          {busy === "share" ? "준비 중..." : "🎉 친구에게 공유"}
        </button>
      </div>
    </div>
  );
}
