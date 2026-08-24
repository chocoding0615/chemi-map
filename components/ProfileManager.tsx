"use client";

import { useEffect, useState } from "react";
import BirthDatePicker from "./BirthDatePicker";
import BirthTimePicker from "./BirthTimePicker";
import MbtiSelect from "./MbtiSelect";
import ConfirmModal from "./ConfirmModal";
import type { ProfileDoc, ProfileInput } from "@/lib/profileTypes";

const EMPTY_FORM: ProfileInput = {
  name: "",
  relation: "",
  birthdate: "",
  isLunar: false,
  birthTime: "",
  gender: "male",
  mbti: "",
};

export default function ProfileManager() {
  const [profiles, setProfiles] = useState<ProfileDoc[] | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<ProfileInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProfileDoc | null>(null);

  useEffect(() => {
    fetch("/api/profiles")
      .then((res) => res.json())
      .then((data: { profiles: ProfileDoc[] }) => setProfiles(data.profiles))
      .catch(() => setProfiles([]));
  }, []);

  function startAdd() {
    setForm(EMPTY_FORM);
    setEditingId("new");
    setError(null);
  }

  function startEdit(profile: ProfileDoc) {
    setForm({
      name: profile.name,
      relation: profile.relation,
      birthdate: profile.birthdate,
      isLunar: profile.isLunar ?? false,
      birthTime: profile.birthTime,
      gender: profile.gender,
      mbti: profile.mbti,
    });
    setEditingId(profile.id);
    setError(null);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.relation.trim() || !form.birthdate || !form.gender) {
      setError("이름·관계·생년월일·성별은 꼭 입력해주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId === "new") {
        const res = await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { id: string };
        setProfiles((prev) => [...(prev ?? []), { ...form, id: data.id }]);
      } else if (editingId) {
        const res = await fetch(`/api/profiles/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        setProfiles((prev) => (prev ?? []).map((p) => (p.id === editingId ? { ...form, id: editingId } : p)));
      }
      setEditingId(null);
    } catch {
      setError("저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await fetch(`/api/profiles/${deleteTarget.id}`, { method: "DELETE" });
      setProfiles((prev) => (prev ?? []).filter((p) => p.id !== deleteTarget.id));
    } finally {
      setSaving(false);
      setDeleteTarget(null);
    }
  }

  if (profiles === null) {
    return <div className="mt-4 h-24 w-full animate-pulse rounded-2xl bg-brown/5" />;
  }

  return (
    <div className="w-full">
      <p className="text-xs text-brown-soft/60">
        자주 보는 사람의 생년월일 등을 저장해두면, 사주·운세 볼 때 불러오기로 바로 채울 수 있어요.
      </p>

      <div className="mt-3 space-y-2">
        {profiles.map((profile) => (
          <div key={profile.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brown/5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-brown">
                  {profile.name} <span className="font-normal text-brown-soft/50">· {profile.relation}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-brown-soft/50">
                  {profile.birthdate}
                  {profile.isLunar && " (음력)"} {profile.birthTime && `· ${profile.birthTime}`} ·{" "}
                  {profile.gender === "male" ? "남" : "여"}
                  {profile.mbti && ` · ${profile.mbti}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => startEdit(profile)}
                  className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-bold text-brown-soft"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(profile)}
                  className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-bold text-coral-dark"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingId ? (
        <div className="mt-3 space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brown/5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brown-soft">이름</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={20}
                placeholder="홍길동"
                className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown/30 focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brown-soft">관계</label>
              <input
                value={form.relation}
                onChange={(e) => setForm({ ...form, relation: e.target.value })}
                maxLength={10}
                placeholder="나, 엄마, 친구"
                className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown/30 focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brown-soft">생년월일</label>
            <BirthDatePicker
              value={form.birthdate}
              onChange={(birthdate) => setForm({ ...form, birthdate })}
              isLunar={form.isLunar}
              onLunarChange={(isLunar) => setForm({ ...form, isLunar })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brown-soft">성별</label>
            <div className="grid grid-cols-2 gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm({ ...form, gender: g })}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition active:scale-95 ${
                    form.gender === g
                      ? "bg-gradient-to-b from-coral to-coral-dark text-white shadow-md shadow-coral-dark/25"
                      : "bg-cream text-brown-soft ring-1 ring-brown/10"
                  }`}
                >
                  {g === "male" ? "남자" : "여자"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brown-soft">
              태어난 시간 <span className="font-normal text-brown-soft/40">(선택)</span>
            </label>
            <BirthTimePicker value={form.birthTime} onChange={(birthTime) => setForm({ ...form, birthTime })} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brown-soft">
              MBTI <span className="font-normal text-brown-soft/40">(선택)</span>
            </label>
            <MbtiSelect value={form.mbti} onChange={(mbti) => setForm({ ...form, mbti })} />
          </div>

          {error && <p className="text-xs font-semibold text-coral-dark">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditingId(null)}
              disabled={saving}
              className="flex-1 rounded-xl bg-cream py-2.5 text-sm font-bold text-brown-soft disabled:opacity-60"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-b from-coral to-coral-dark py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={startAdd}
          className="mt-3 w-full rounded-2xl border border-dashed border-coral bg-white/50 py-3 text-sm font-bold text-coral-dark transition active:scale-95 hover:bg-white"
        >
          + 새 기본정보 추가
        </button>
      )}

      {deleteTarget && (
        <ConfirmModal
          title={`"${deleteTarget.name}(${deleteTarget.relation})" 정보를 삭제할까요?`}
          confirmLabel="삭제"
          pending={saving}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
