"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { awardForAction } from "@/lib/foxRewards";
import DeleteLetterButton from "./DeleteLetterButton";
import WalletPayButton from "./WalletPayButton";

interface SecretLetterCardProps {
  id: string;
  senderName: string;
  preview: string;
  createdAtLabel: string;
  priceKrw: number;
}

export default function SecretLetterCard({ id, senderName, preview, createdAtLabel, priceKrw }: SecretLetterCardProps) {
  const router = useRouter();
  const [revealed, setRevealed] = useState<{ content: string; senderName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlocked() {
    try {
      const contentRes = await fetch(`/api/letters/${id}`);
      if (!contentRes.ok) throw new Error();
      const data = (await contentRes.json()) as { content: string; senderName: string };
      setRevealed({ content: data.content, senderName: data.senderName });
      awardForAction("letter");
      router.refresh();
    } catch {
      setError("열람에 실패했어요. 다시 시도해주세요.");
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brown/5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-coral-dark">{revealed ? revealed.senderName : senderName}</p>
        <DeleteLetterButton id={id} />
      </div>

      {revealed ? (
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-brown">{revealed.content}</p>
      ) : (
        <>
          <p className="mt-1.5 text-sm text-brown-soft">
            {preview}
            <span className="text-brown-soft/30">…</span>
          </p>
          {error && <p className="mt-2 text-xs font-semibold text-coral-dark">{error}</p>}
          <WalletPayButton
            priceKrw={priceKrw}
            category="비밀 편지"
            title="이거 누가 보냈는지 열어보기"
            purchaseUrl={`/api/letters/${id}/unlock`}
            onSuccess={handleUnlocked}
          />
        </>
      )}
      <p className="mt-1.5 text-[10px] text-brown-soft/30">{createdAtLabel}</p>
    </div>
  );
}
