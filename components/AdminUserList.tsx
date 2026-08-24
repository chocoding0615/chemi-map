"use client";

import { useState } from "react";
import type { AdminUserRow } from "@/lib/adminStats";

const PROVIDER_LABEL: Record<string, string> = { kakao: "카카오", naver: "네이버" };

export default function AdminUserList({ users, myUid }: { users: AdminUserRow[]; myUid: string }) {
  const [rows, setRows] = useState(users);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleAdmin(uid: string, nextIsAdmin: boolean) {
    setPendingUid(uid);
    setError(null);
    try {
      const res = await fetch("/api/admin/set-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUid: uid, isAdmin: nextIsAdmin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "변경에 실패했어요.");
        return;
      }
      setRows((prev) => prev.map((r) => (r.uid === uid ? { ...r, isAdmin: nextIsAdmin } : r)));
    } finally {
      setPendingUid(null);
    }
  }

  return (
    <div className="w-full">
      {error && <p className="mb-3 text-center text-xs font-semibold text-coral-dark">{error}</p>}
      <div className="space-y-2">
        {rows.map((user) => (
          <div
            key={user.uid}
            className="flex items-center justify-between gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-brown/5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-brown">
                {user.nickname} {user.uid === myUid && <span className="text-[10px] text-coral-dark">(나)</span>}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-brown-soft/50">
                {PROVIDER_LABEL[user.provider] ?? user.provider} · 🌱{user.ticketBalance.toLocaleString()} ·{" "}
                {new Date(user.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleAdmin(user.uid, !user.isAdmin)}
              disabled={pendingUid === user.uid}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-95 disabled:opacity-50 ${
                user.isAdmin ? "bg-coral text-white" : "bg-cream text-brown-soft"
              }`}
            >
              {pendingUid === user.uid ? "처리 중" : user.isAdmin ? "관리자" : "관리자로 지정"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
