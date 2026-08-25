"use client";

import { useState } from "react";
import { isUserCancelledShare } from "@/lib/shareCard";
import { notify } from "@/lib/notify";

const BRAG_TEXTS = [
  "🦊💌 나 방금 비밀편지 받았어! 근데 누가 보냈는지 아직도 모르겠어... 궁금하면 너도 나한테 편지 보내볼래?",
  "🦊💌 여우점 비밀편지함에 편지가 와있길래 열어봤더니 완전 궁금해지는 내용이었어. 너도 나한테 몰래 편지 써봐!",
  "🦊💌 누가 나한테 비밀편지 보냈어... 너무 궁금해서 잠도 안 와. 너도 궁금하지 않아? 나한테도 하나 보내줘!",
];

interface BragShareCardProps {
  handle: string;
  unlockedCount: number;
}

export default function BragShareCard({ handle, unlockedCount }: BragShareCardProps) {
  const [status, setStatus] = useState<"idle" | "shared" | "copied">("idle");

  async function handleShare() {
    const text = BRAG_TEXTS[unlockedCount % BRAG_TEXTS.length];
    const url = `${window.location.origin}/letter/${handle}`;

    const nav = navigator as Navigator & { share?: (data: { title?: string; text?: string; url?: string }) => Promise<void> };
    try {
      if (nav.share) {
        await nav.share({ title: "여우점 비밀편지", text, url });
        setStatus("shared");
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setStatus("copied");
      }
    } catch (err) {
      // Web Share 시트를 직접 닫은 경우(AbortError)는 실패가 아니라 마음을 바꾼 것뿐이라 조용히 넘어간다.
      if (!isUserCancelledShare(err)) {
        notify({ kind: "normal", text: "공유에 실패했어요. 다시 시도해주세요." });
      }
    }
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <div className="mt-4 w-full rounded-2xl bg-gradient-to-b from-coral to-coral-dark p-5 text-center text-white shadow-lg shadow-coral-dark/25">
      <p className="text-sm font-bold">🦊💌 나 비밀편지 받았다고 자랑하기</p>
      <p className="mt-1 text-xs leading-relaxed text-white/85">
        받은 편지를 친구한테 슬쩍 흘려보세요. 궁금해진 친구가 나한테도 편지를 보낼지도 몰라요.
      </p>
      <button
        type="button"
        onClick={handleShare}
        className="mt-3 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-coral-dark transition active:scale-95 hover:bg-cream"
      >
        {status === "shared" ? "공유했어요!" : status === "copied" ? "복사됐어요!" : "친구에게 자랑하기"}
      </button>
    </div>
  );
}
