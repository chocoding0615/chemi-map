"use client";

import { notify } from "@/lib/notify";

export default function SubscribeCta() {
  return (
    <button
      type="button"
      onClick={() => notify({ kind: "normal", text: "구독 오픈 준비 중이에요! 조금만 기다려주세요 🦊" })}
      className="w-full rounded-2xl bg-gradient-to-b from-coral to-coral-dark py-4 text-base font-bold text-white shadow-lg shadow-coral-dark/25 transition active:scale-95 hover:brightness-105"
    >
      🔒 구독 준비 중이에요
    </button>
  );
}
