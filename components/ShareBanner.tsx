"use client";

import { useEffect, useState } from "react";

export default function ShareBanner({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    // 하이드레이션 불일치를 피하려고 마운트 후에만 window.location을 읽는다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(`${window.location.origin}/m/${slug}`);
  }, [slug]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable; the URL text below is still selectable manually
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-coral to-coral-dark p-5 text-center shadow-lg shadow-coral-dark/25">
      <p className="text-sm font-bold text-white">🎉 지도가 만들어졌어요!</p>
      <p className="mt-1 text-xs leading-relaxed text-white/85">
        이 링크가 있어야 나중에 다시 볼 수 있어요.
        <br />
        꼭 저장하거나 지금 공유해두세요.
      </p>
      <div className="mt-3 truncate rounded-lg bg-white/15 px-3 py-2 text-xs text-white/90">{url || " "}</div>
      <button
        onClick={handleCopy}
        className="mt-3 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-coral-dark transition hover:bg-cream active:scale-95"
      >
        {copied ? "복사됨!" : "링크 복사하기"}
      </button>
    </div>
  );
}
