"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChargeButton() {
  const router = useRouter();
  const [charging, setCharging] = useState(false);

  async function handleCharge() {
    setCharging(true);
    await fetch("/api/user/charge", { method: "POST" });
    router.refresh();
    setCharging(false);
  }

  return (
    <button
      type="button"
      onClick={handleCharge}
      disabled={charging}
      className="mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-lavender-dark shadow-sm ring-1 ring-brown/10 transition active:scale-95 disabled:opacity-60"
    >
      {charging ? "충전 처리 중..." : "🌱 잔디 7개 충전하기 (테스트, 실제 결제 아님)"}
    </button>
  );
}
