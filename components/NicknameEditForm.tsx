"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NicknameEditForm({ nickname }: { nickname: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(nickname);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed }),
      });
      if (!res.ok) throw new Error();
      setEditing(false);
      router.refresh();
    } catch {
      setError("수정에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-2 flex items-center gap-1 text-sm font-bold text-coral-dark underline underline-offset-2"
      >
        {nickname}님
        <span className="text-xs text-brown-soft/40">✏️</span>
      </button>
    );
  }

  return (
    <div className="mt-2 flex w-full max-w-[280px] flex-col items-center gap-1.5">
      <div className="flex w-full items-center gap-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={20}
          autoFocus
          className="min-w-0 flex-1 rounded-lg bg-white px-3 py-1.5 text-center text-sm text-brown shadow-sm ring-1 ring-brown/10"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="shrink-0 rounded-lg bg-coral px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
        >
          {saving ? "..." : "저장"}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setValue(nickname);
            setError(null);
          }}
          className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-brown-soft/90 ring-1 ring-brown/10"
        >
          취소
        </button>
      </div>
      {error && <p className="text-[11px] font-semibold text-coral-dark">{error}</p>}
    </div>
  );
}
