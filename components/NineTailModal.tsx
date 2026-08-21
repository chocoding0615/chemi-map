"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onNineTail } from "@/lib/notify";

export default function NineTailModal() {
  const [open, setOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => onNineTail(() => setOpen(true)), []);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  async function handleShare() {
    const text = "복실이가 진짜 구미호가 됐어요! 나도 여우점에서 꼬리를 모아봤어요 🦊✨";
    const url = window.location.origin;
    try {
      if (navigator.share) {
        await navigator.share({ text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // 공유 취소/미지원 — 조용히 무시
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nine-tail-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-brown/50 px-6"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-5xl">✨🦊✨</span>
        <p id="nine-tail-title" className="mt-3 text-lg font-extrabold text-brown">
          복실이가 진짜 구미호가 됐어요! ✨
        </p>
        <p className="mt-2 text-sm leading-relaxed text-brown-soft">
          여기까지 함께 와줘서 고마워요. 아홉 꼬리 인장을 선물할게요.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="rounded-xl bg-gradient-to-b from-coral to-coral-dark py-2.5 text-sm font-bold text-white shadow-md shadow-coral-dark/25 transition active:scale-95"
          >
            {shared ? "복사됨!" : "자랑하기"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/my?tab=collection");
            }}
            className="rounded-xl bg-cream py-2.5 text-sm font-bold text-brown-soft ring-1 ring-brown/10 transition active:scale-95"
          >
            부적 보러 가기
          </button>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={() => setOpen(false)}
          className="mt-3 text-xs font-semibold text-brown-soft/40 underline underline-offset-2"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
