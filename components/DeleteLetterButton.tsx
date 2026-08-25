"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

export default function DeleteLetterButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/letters/${id}`, { method: "DELETE" });
    setConfirming(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={deleting}
        className="rounded px-2 py-2 text-[11px] text-brown-soft/60 underline decoration-dotted disabled:opacity-60"
      >
        삭제
      </button>
      {confirming && (
        <ConfirmModal
          title="이 편지를 삭제할까요?"
          description="한 번 삭제하면 다시 볼 수 없어요."
          confirmLabel="삭제"
          pending={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
