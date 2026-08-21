"use client";

import { useState } from "react";

interface ChatEntry {
  role: "user" | "assistant";
  text: string;
}

interface SajuLlmChatProps {
  reportId: string;
  freeQuestionsTotal: number;
}

export default function SajuLlmChat({ reportId, freeQuestionsTotal }: SajuLlmChatProps) {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState(freeQuestionsTotal);
  const [insufficient, setInsufficient] = useState<{ balance: number; required: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const question = input.trim();
    if (!question || sending) return;
    setSending(true);
    setError(null);
    setInsufficient(null);
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");

    try {
      const res = await fetch("/api/saju/llm-report/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, message: question }),
      });
      if (res.status === 402) {
        const data = (await res.json()) as { balance: number; required: number };
        setInsufficient({ balance: data.balance, required: data.required });
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { reply: string; freeRemaining: number };
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      setFreeRemaining(data.freeRemaining);
    } catch {
      setError("답변을 받아오지 못했어요. 다시 시도해주세요.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-5 rounded-xl bg-white/60 p-4">
      <p className="text-xs font-semibold text-brown-soft/90">
        궁금한 점을 더 물어보세요 · {freeRemaining > 0 ? `무료 질문 ${freeRemaining}개 남음` : "질문당 🌱2"}
      </p>

      {messages.length > 0 && (
        <div className="mt-3 space-y-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-lg p-3 text-sm leading-relaxed ${
                m.role === "user" ? "bg-coral/10 text-brown" : "bg-cream/60 text-brown-soft"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
      )}

      {sending && <div className="mt-2 h-16 animate-pulse rounded-lg bg-brown/5" />}

      {insufficient && (
        <p className="mt-2 text-center text-xs font-semibold text-coral-dark">
          🌱 잔디가 부족해요 (보유 {insufficient.balance} · 필요 {insufficient.required})
        </p>
      )}
      {error && <p className="mt-2 text-center text-xs font-semibold text-coral-dark">{error}</p>}

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          maxLength={200}
          placeholder="예: 올해 하반기 이직해도 될까요?"
          className="min-w-0 flex-1 rounded-xl border border-brown/10 bg-cream px-3 py-2 text-sm text-brown placeholder:text-brown/30 focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="shrink-0 rounded-xl bg-gradient-to-b from-coral to-coral-dark px-4 py-2 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50"
        >
          질문
        </button>
      </div>
    </div>
  );
}
