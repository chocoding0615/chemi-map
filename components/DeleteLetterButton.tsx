"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteLetterButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/letters/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-[11px] text-brown-soft/30 underline decoration-dotted disabled:opacity-60"
    >
      삭제
    </button>
  );
}
