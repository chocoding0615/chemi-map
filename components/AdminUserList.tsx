"use client";

import { useState } from "react";
import type { AdminUserRow } from "@/lib/adminStats";
import ConfirmModal from "./ConfirmModal";

const PROVIDER_LABEL: Record<string, string> = { kakao: "카카오", naver: "네이버" };
type Role = "user" | "tester" | "admin";
const ROLE_LABEL: Record<Role, string> = { user: "유저", tester: "테스터", admin: "관리자" };

type Row = AdminUserRow & { isEnvAdmin: boolean };

function roleOf(user: Row): Role {
  if (user.isAdmin) return "admin";
  if (user.isTester) return "tester";
  return "user";
}

export default function AdminUserList({ users, myUid }: { users: Row[]; myUid: string }) {
  const [rows, setRows] = useState(users);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hideTarget, setHideTarget] = useState<Row | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [grantTarget, setGrantTarget] = useState<Row | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addUid, setAddUid] = useState("");
  const [addRole, setAddRole] = useState<Role>("admin");

  async function setRole(uid: string, role: Role) {
    setPendingUid(uid);
    setError(null);
    try {
      const res = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUid: uid, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "변경에 실패했어요.");
        return;
      }
      setRows((prev) => {
        const exists = prev.some((r) => r.uid === uid);
        if (exists) {
          return prev.map((r) =>
            r.uid === uid ? { ...r, isAdmin: role === "admin", isTester: role === "tester" } : r
          );
        }
        // 목록에 없던 uid를 "추가" 폼으로 지정한 경우 - 성공하면 새 행으로 넣어준다.
        return [
          {
            uid,
            nickname: "(직접 추가함)",
            provider: "",
            ticketBalance: 0,
            isAdmin: role === "admin",
            isTester: role === "tester",
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

  async function deleteUser(uid: string) {
    setPendingUid(uid);
    setError(null);
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUid: uid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "삭제에 실패했어요.");
        return;
      }
      setRows((prev) => prev.filter((r) => r.uid !== uid));
    } finally {
      setPendingUid(null);
      setDeleteTarget(null);
    }
  }

  async function grantJandi(uid: string, amount: number) {
    setPendingUid(uid);
    setError(null);
    try {
      const res = await fetch("/api/admin/grant-jandi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUid: uid, amount }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "지급에 실패했어요.");
        return;
      }
      setRows((prev) => prev.map((r) => (r.uid === uid ? { ...r, ticketBalance: r.ticketBalance + amount } : r)));
      setGrantTarget(null);
    } finally {
      setPendingUid(null);
    }
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    const uid = addUid.trim();
    if (!uid) return;
    setRole(uid, addRole);
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
            {(["user", "tester", "admin"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setAddRole(role)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  addRole === role ? "bg-coral text-white" : "bg-cream text-brown-soft"
                }`}
              >
                {ROLE_LABEL[role]}
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
            onSetRole={setRole}
            onHide={() => setHideTarget(user)}
            onOpenGrant={() => setGrantTarget(user)}
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
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHidden(user.uid, false)}
                      disabled={pendingUid === user.uid}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brown-soft shadow-sm ring-1 ring-brown/10 transition active:scale-95 disabled:opacity-50"
                    >
                      복원
                    </button>
                    {!user.isEnvAdmin && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(user)}
                        disabled={pendingUid === user.uid}
                        className="rounded-full bg-coral-dark/10 px-3 py-1.5 text-xs font-bold text-coral-dark transition active:scale-95 disabled:opacity-50 hover:bg-coral-dark/20"
                      >
                        영구삭제
                      </button>
                    )}
                  </div>
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

      {deleteTarget && (
        <ConfirmModal
          title={`${deleteTarget.nickname}님을 영구삭제할까요?`}
          description="계정, 잔디, 활동기록, AI 리포트가 전부 삭제되고 절대 되돌릴 수 없어요."
          confirmLabel="영구삭제"
          pending={pendingUid === deleteTarget.uid}
          onConfirm={() => deleteUser(deleteTarget.uid)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {grantTarget && (
        <GrantJandiModal
          target={grantTarget}
          pending={pendingUid === grantTarget.uid}
          onConfirm={(amount) => grantJandi(grantTarget.uid, amount)}
          onCancel={() => setGrantTarget(null)}
        />
      )}
    </div>
  );
}

function UserRow({
  user,
  myUid,
  pending,
  onSetRole,
  onHide,
  onOpenGrant,
}: {
  user: Row;
  myUid: string;
  pending: boolean;
  onSetRole: (uid: string, role: Role) => void;
  onHide: () => void;
  onOpenGrant: () => void;
}) {
  const locked = user.isEnvAdmin;
  const role = roleOf(user);
  const clickableForGrant = role === "admin" || role === "tester";

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-brown/5">
      <button
        type="button"
        onClick={clickableForGrant ? onOpenGrant : undefined}
        disabled={!clickableForGrant}
        className={`min-w-0 flex-1 text-left ${clickableForGrant ? "cursor-pointer" : "cursor-default"}`}
        title={clickableForGrant ? "눌러서 잔디 지급하기" : undefined}
      >
        <p className="truncate text-sm font-bold text-brown">
          {user.nickname} {user.uid === myUid && <span className="text-[10px] text-coral-dark">(나)</span>}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-brown-soft/50">
          {PROVIDER_LABEL[user.provider] ?? user.provider} · 🌱{user.ticketBalance.toLocaleString()} ·{" "}
          {new Date(user.createdAt).toLocaleDateString("ko-KR")}
        </p>
      </button>

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
            {(["user", "tester", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onSetRole(user.uid, r)}
                disabled={pending}
                className={`px-2 py-1.5 text-[11px] font-bold transition disabled:opacity-50 ${
                  role === r ? "bg-coral text-white" : "bg-white text-brown-soft"
                }`}
              >
                {ROLE_LABEL[r]}
              </button>
            ))}
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

function GrantJandiModal({
  target,
  pending,
  onConfirm,
  onCancel,
}: {
  target: Row;
  pending: boolean;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown/40 px-6 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-[320px] rounded-2xl bg-white p-5 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-bold text-brown">{target.nickname}님에게 잔디 지급</p>
        <p className="mt-1 text-xs text-brown-soft/60">현재 보유 🌱{target.ticketBalance.toLocaleString()}</p>
        <input
          type="number"
          min={1}
          max={100000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-4 w-full rounded-xl border border-brown/10 bg-cream px-3 py-2.5 text-center text-lg font-extrabold text-brown focus:border-coral focus:outline-none"
        />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="flex-1 rounded-xl bg-cream py-2.5 text-sm font-bold text-brown-soft transition active:scale-95 disabled:opacity-60"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => amount > 0 && onConfirm(amount)}
            disabled={pending || !(amount > 0)}
            className="flex-1 rounded-xl bg-gradient-to-b from-coral to-coral-dark py-2.5 text-sm font-bold text-white transition active:scale-95 disabled:opacity-60"
          >
            {pending ? "지급 중..." : `🌱${amount || 0} 지급`}
          </button>
        </div>
      </div>
    </div>
  );
}
