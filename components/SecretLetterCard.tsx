"use client";

import { useState } from "react";
import { awardForAction } from "@/lib/foxRewards";
import DeleteLetterButton from "./DeleteLetterButton";

interface SecretLetterCardProps {
  id: string;
  senderName: string;
  preview: string;
  priceKrw: number;
}

export default function SecretLetterCard({ id, senderName, preview, priceKrw }: SecretLetterCardProps) {
  const [content, setContent] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    setUnlocking(true);
    setError(null);
    try {
      const unlockRes = await fetch(`/api/letters/${id}/unlock`, { method: "POST" });
      if (!unlockRes.ok) throw new Error();
      const contentRes = await fetch(`/api/letters/${id}`);
      if (!contentRes.ok) throw new Error();
      const data = (await contentRes.json()) as { content: string };
      setContent(data.content);
      awardForAction("letter");
    } catch {
      setError("열람에 실패했어요. 다시 시도해주세요.");
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brown/5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-coral-dark">{senderName}</p>
        <DeleteLetterButton id={id} />
      </div>

      {content ? (
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-brown">{content}</p>
      ) : (
        <>
          <p className="mt-1.5 text-sm text-brown-soft/60">
            {preview}
            <span className="text-brown-soft/30">…</span>
          </p>
          {error && <p className="mt-2 text-xs font-semibold text-coral-dark">{error}</p>}
          <button
            type="button"
            onClick={handleUnlock}
            disabled={unlocking}
            className="mt-3 w-full rounded-xl border border-dashed border-coral bg-white/50 py-2.5 text-xs font-bold text-coral-dark transition active:scale-95 hover:bg-white disabled:opacity-60"
          >
            {unlocking
              ? "열람 처리 중..."
              : `🔒 테스트 결제로 전체보기 (${priceKrw.toLocaleString()}원 · 실제 결제 아님)`}
          </button>
        </>
      )}
    </div>
  );
}
