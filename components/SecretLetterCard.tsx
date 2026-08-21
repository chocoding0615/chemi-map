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
  priceKrw: number;
}

export default function SecretLetterCard({ id, senderName, preview, priceKrw }: SecretLetterCardProps) {
  const router = useRouter();
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlocked() {
    try {
      const contentRes = await fetch(`/api/letters/${id}`);
      if (!contentRes.ok) throw new Error();
      const data = (await contentRes.json()) as { content: string };
      setContent(data.content);
      awardForAction("letter");
      router.refresh();
    } catch {
      setError("열람에 실패했어요. 다시 시도해주세요.");
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
          <WalletPayButton
            priceKrw={priceKrw}
            category="비밀 편지"
            title={`${senderName}님이 보낸 편지`}
            purchaseUrl={`/api/letters/${id}/unlock`}
            onSuccess={handleUnlocked}
          />
        </>
      )}
    </div>
  );
}
