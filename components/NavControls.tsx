"use client";

import { usePathname, useRouter } from "next/navigation";
import { tryConsumeBackHandler } from "@/lib/backHandler";

export default function NavControls() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  function handleBack() {
    if (isHome) return;
    if (tryConsumeBackHandler()) return;
    router.back();
  }

  function handleForward() {
    window.history.forward();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleBack}
        disabled={isHome}
        aria-disabled={isHome}
        aria-label="뒤로 가기"
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-cream text-lg text-brown transition active:scale-90 ${
          isHome ? "opacity-35" : ""
        }`}
      >
        ‹
      </button>
      <button
        type="button"
        onClick={handleForward}
        aria-label="앞으로 가기"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-lg text-brown transition active:scale-90"
      >
        ›
      </button>
    </div>
  );
}
