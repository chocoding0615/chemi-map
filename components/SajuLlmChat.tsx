"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InsufficientBalanceCTA from "./common/InsufficientBalanceCTA";

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restoring, setRestoring] = useState(true);
  const [freeRemaining, setFreeRemaining] = useState(freeQuestionsTotal);
  const [insufficient, setInsufficient] = useState<{ balance: number; required: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // 과거 대화 복원 — 조회에 실패해도(비로그인, 네트워크 오류 등) 조용히 넘어가고
  // freeRemaining은 prop 기본값(무료 질문 전체 개수)을 그대로 쓴다. 새 채팅은 그대로 가능해야 한다.
  useEffect(() => {
    fetch(`/api/saju/llm-report/chat?reportId=${encodeURIComponent(reportId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { messages: ChatEntry[]; questionsUsed: number } | null) => {
        if (!data) return;
        setMessages(data.messages);
        setFreeRemaining(Math.max(0, freeQuestionsTotal - data.questionsUsed));
      })
      .catch(() => {})
      .finally(() => setRestoring(false));
  }, [reportId, freeQuestionsTotal]);

  // LLM 호출은 최대 1분 정도 걸릴 수 있어서(lib/llm.ts 타임아웃), 그냥 스켈레톤만
  // 띄우면 멈춘 것처럼 보인다 — 기다린 시간을 초 단위로 보여줘서 안심시킨다.
  // 카운터 시작은 handleSend에서 sending을 켜기 직전에 0으로 리셋해둔다.
  useEffect(() => {
    if (!sending) return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [sending]);

  async function handleSend() {
    const question = input.trim();
    if (!question || sending) return;
    setElapsedSeconds(0);
    setSending(true);
    setError(null);
    setInsufficient(null);
    setSessionExpired(false);
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
        setInput(question);
        return;
      }
      if (res.status === 401) {
        setSessionExpired(true);
        setMessages((prev) => prev.slice(0, -1));
        setInput(question);
        return;
      }
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { reply: string; freeRemaining: number };
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      setFreeRemaining(data.freeRemaining);
    } catch {
      setError("답변을 받아오지 못했어요. 다시 시도해주세요.");
      setInput(question);
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

      {restoring && (
        <div className="mt-3 space-y-2">
          <div className="h-10 animate-pulse rounded-lg bg-brown/5" />
          <div className="h-10 w-2/3 animate-pulse rounded-lg bg-brown/5" />
        </div>
      )}

      {!restoring && messages.length > 0 && (
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

      {sending && (
        <div className="mt-2 space-y-1.5">
          <div className="h-16 animate-pulse rounded-lg bg-brown/5" />
          <p className="text-center text-[11px] text-brown-soft/70">
            복실이가 답변을 준비하고 있어요... {elapsedSeconds}초
            {elapsedSeconds >= 15 && " (최대 1분 정도 걸릴 수 있어요)"}
          </p>
        </div>
      )}

      {insufficient && (
        <div className="mt-2">
          <InsufficientBalanceCTA balance={insufficient.balance} required={insufficient.required} />
        </div>
      )}
      {error && <p className="mt-2 text-center text-xs font-semibold text-coral-dark">{error}</p>}
      {sessionExpired && (
        <div className="mt-2 text-center">
          <p className="text-xs font-semibold text-coral-dark">로그인이 끊겼어요.</p>
          <Link href="/my" className="text-xs font-bold text-coral-dark underline underline-offset-2">
            다시 로그인하기
          </Link>
        </div>
      )}

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
