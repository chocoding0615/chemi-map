"use client";

import { useState } from "react";

export default function ShareBanner({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/m/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable; user can still select the URL manually via the browser bar
    }
  }

  return (
    <div className="mb-6 w-full max-w-sm rounded-xl border border-amber-300 bg-amber-50 p-4 text-center">
      <p className="text-sm font-medium text-amber-900">지도가 만들어졌어요! 링크를 복사해서 공유해보세요.</p>
      <button
        onClick={handleCopy}
        className="mt-3 w-full rounded-lg bg-amber-500 py-2 text-sm font-bold text-white transition hover:bg-amber-600"
      >
        {copied ? "복사됨!" : "링크 복사하기"}
      </button>
    </div>
  );
}
