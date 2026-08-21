"use client";

import { useState } from "react";

export default function CopyLinkButton({ path, label }: { path: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable; nothing to fall back to here
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mt-3 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-coral-dark shadow-sm ring-1 ring-brown/10 transition active:scale-95"
    >
      {copied ? "복사됨!" : label}
    </button>
  );
}
