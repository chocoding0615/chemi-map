"use client";

import { useState } from "react";
import type { AdminUserRow } from "@/lib/adminStats";
import ConfirmModal from "./ConfirmModal";

const PROVIDER_LABEL: Record<string, string> = { kakao: "카카오", naver: "네이버" };

type Row = AdminUserRow & { isEnvAdmin: boolean };

export default function AdminUserList({ users, myUid }: { users: Row[]; myUid: string }) {
  const [rows, setRows] = useState(users);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hideTarget, setHideTarget] = useState<Row | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addUid, setAddUid] = useState("");
  const [addRole, setAddRole] = useState<"user" | "admin">("admin");

  async function setAdmin(uid: string, nextIsAdmin: boolean) {
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
      setRows((prev) => {
        const exists = prev.some((r) => r.uid === uid);
        if (exists) return prev.map((r) => (r.uid === uid ? { ...r, isAdmin: nextIsAdmin } : r));
        // 목록에 없던 uid를 "추가" 폼으로 지정한 경우 - 성공하면 새 행으로 넣어준다.
        return [
          {
            uid,
            nickname: "(직접 추가함)",
            provider: "",
            ticketBalance: 0,
            isAdmin: nextIsAdmin,
            hidden: false,
            isEnvAdmin: false,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ];
      });
    } finally {
      setPendingUid(null);
    }
  }

  async function setHidden(uid: string, hidden: boolean) {
    setPendingUid(uid);
    setError(null);
    try {
      const res = await fetch("/api/admin/set-user-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUid: uid, hidden }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "변경에 실패했어요.");
        return;
      }
      setRows((prev) => prev.map((r) => (r.uid === uid ? { ...r, hidden } : r)));
    } finally {
      setPendingUid(null);
      setHideTarget(null);
    }
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    const uid = addUid.trim();
    if (!uid) return;
    setAdmin(uid, addRole === "admin");
    setAddUid("");
    setShowAddForm(false);
  }

  const visibleRows = rows.filter((r) => !r.hidden);
  const hiddenRows = rows.filter((r) => r.hidden);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-brown-soft/60">등록된 계정 {visibleRows.length}명</p>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-full bg-coral px-3 py-1.5 text-xs font-bold text-white transition active:scale-95"
        >
          + 추가
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="mb-3 space-y-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-brown/5">
          <label className="block text-[11px] font-semibold text-brown-soft/70">
            계정 ID (예: kakao_1234567890) <span className="font-normal">- /my 하단 &quot;계정 ID&quot;에서 확인</span>
          </label>
          <input
            value={addUid}
            onChange={(e) => setAddUid(e.target.value)}
            placeholder="kakao_1234567890"
            className="w-full rounded-lg border border-brown/10 bg-cream px-3 py-2 text-sm text-brown focus:border-coral focus:outline-none"
          />
          <div className="flex gap-2">
            {(["user", "admin"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setAddRole(role)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  addRole === role ? "bg-coral text-white" : "bg-cream text-brown-soft"
                }`}
              >
                {role === "user" ? "유저" : "관리자"}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={!addUid.trim()}
            className="w-full rounded-lg bg-brown py-2 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50"
          >
            지정하기
          </button>
        </form>
      )}

      {error && <p className="mb-3 text-center text-xs font-semibold text-coral-dark">{error}</p>}

      <div className="space-y-2">
        {visibleRows.map((user) => (
          <UserRow
            key={user.uid}
            user={user}
            myUid={myUid}
            pending={pendingUid === user.uid}
            onSetAdmin={setAdmin}
            onHide={() => setHideTarget(user)}
          />
        ))}
      </div>

      {hiddenRows.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowHidden((v) => !v)}
            className="text-[11px] font-semibold text-brown-soft/50 underline underline-offset-2"
          >
            숨긴 유저 {hiddenRows.length}명 {showHidden ? "숨기기" : "보기"}
          </button>
          {showHidden && (
            <div className="mt-2 space-y-2">
              {hiddenRows.map((user) => (
                <div key={user.uid} className="flex items-center justify-between gap-2 rounded-xl bg-cream/60 p-3">
                  <p className="min-w-0 truncate text-sm text-brown-soft/70">{user.nickname}</p>
                  <button
                    type="button"
                    onClick={() => setHidden(user.uid, false)}
                    disabled={pendingUid === user.uid}
                    className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brown-soft shadow-sm ring-1 ring-brown/10 transition active:scale-95 disabled:opacity-50"
                  >
                    복원
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {hideTarget && (
        <ConfirmModal
          title={`${hideTarget.nickname}님을 목록에서 숨길까요?`}
          description="계정과 데이터(잔디, 활동기록)는 그대로 남고, 관리자 목록 화면에서만 안 보이게 돼요. 나중에 다시 복원할 수 있어요."
          confirmLabel="숨기기"
          pending={pendingUid === hideTarget.uid}
          onConfirm={() => setHidden(hideTarget.uid, true)}
          onCancel={() => setHideTarget(null)}
        />
      )}
    </div>
  );
}

function UserRow({
  user,
  myUid,
  pending,
  onSetAdmin,
  onHide,
}: {
  user: Row;
  myUid: string;
  pending: boolean;
  onSetAdmin: (uid: string, next: boolean) => void;
  onHide: () => void;
}) {
  const locked = user.isEnvAdmin;

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-brown/5">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-brown">
          {user.nickname} {user.uid === myUid && <span className="text-[10px] text-coral-dark">(나)</span>}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-brown-soft/50">
          {PROVIDER_LABEL[user.provider] ?? user.provider} · 🌱{user.ticketBalance.toLocaleString()} ·{" "}
          {new Date(user.createdAt).toLocaleDateString("ko-KR")}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {locked ? (
          <span
            title="서버 설정(ADMIN_UIDS)으로 지정된 계정이라 여기서 바꿀 수 없어요."
            className="rounded-full bg-brown/10 px-2.5 py-1.5 text-[11px] font-bold text-brown-soft/70"
          >
            🔒 서버 지정
          </span>
        ) : (
          <div className="flex overflow-hidden rounded-full ring-1 ring-brown/10">
            {(["user", "admin"] as const).map((role) => {
              const active = (role === "admin") === user.isAdmin;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => onSetAdmin(user.uid, role === "admin")}
                  disabled={pending}
                  className={`px-2.5 py-1.5 text-[11px] font-bold transition disabled:opacity-50 ${
                    active ? "bg-coral text-white" : "bg-white text-brown-soft"
                  }`}
                >
                  {role === "user" ? "유저" : "관리자"}
                </button>
              );
            })}
          </div>
        )}
        {!locked && (
          <button
            type="button"
            onClick={onHide}
            disabled={pending}
            className="rounded-full bg-cream px-2.5 py-1.5 text-[11px] font-bold text-brown-soft/70 transition active:scale-95 disabled:opacity-50 hover:bg-brown/10"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
