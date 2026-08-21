"use client";

import { useState } from "react";

const MAX_LEN = 50;

export default function SecretLetterForm({ handle }: { handle: string }) {
  const [senderName, setSenderName] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, senderName, content }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("전송에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-6 w-full rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-brown/5">
        <p className="text-2xl">🦊💌</p>
        <p className="mt-2 text-sm font-bold text-brown">편지가 전달됐어요!</p>
        <p className="mt-1 text-xs text-brown-soft/90">복실이가 몰래 가져다 놓을게요.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 w-full space-y-3">
      <input
        type="text"
        value={senderName}
        onChange={(e) => setSenderName(e.target.value)}
        maxLength={20}
        placeholder="이름 (안 쓰면 '익명의 여우'로 보여요)"
        className="w-full rounded-xl bg-white px-4 py-3 text-sm text-brown shadow-sm ring-1 ring-brown/10 placeholder:text-brown-soft/30"
      />
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_LEN))}
          rows={3}
          placeholder="짧게, 하고 싶은 말을 적어주세요."
          className="w-full resize-none rounded-xl bg-white px-4 py-3 text-sm text-brown shadow-sm ring-1 ring-brown/10 placeholder:text-brown-soft/30"
        />
        <span className="absolute bottom-2 right-3 text-[11px] text-brown-soft/30">
          {content.length}/{MAX_LEN}
        </span>
      </div>
      {error && <p className="text-center text-xs font-semibold text-coral-dark">{error}</p>}
      <button
        type="submit"
        disabled={sending || !content.trim()}
        className="w-full rounded-xl bg-gradient-to-b from-coral to-coral-dark py-3 text-sm font-bold text-white shadow-md shadow-coral-dark/25 transition active:scale-95 disabled:opacity-60"
      >
        {sending ? "보내는 중..." : "몰래 편지 보내기"}
      </button>
    </form>
  );
}
