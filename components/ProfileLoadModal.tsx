"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProfileDoc } from "@/lib/profileTypes";

interface ProfileLoadModalProps {
  onSelect: (profile: ProfileDoc) => void;
  onClose: () => void;
}

export default function ProfileLoadModal({ onSelect, onClose }: ProfileLoadModalProps) {
  const [profiles, setProfiles] = useState<ProfileDoc[] | null>(null);

  useEffect(() => {
    fetch("/api/profiles")
      .then((res) => (res.ok ? res.json() : { profiles: [] }))
      .then((data: { profiles: ProfileDoc[] }) => setProfiles(data.profiles))
      .catch(() => setProfiles([]));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brown/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="max-h-[70vh] w-full max-w-[400px] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-brown">기본정보 불러오기</p>
          <button type="button" onClick={onClose} className="text-lg text-brown-soft/40">
            ✕
          </button>
        </div>

        {profiles === null && <div className="mt-4 h-16 w-full animate-pulse rounded-2xl bg-brown/5" />}

        {profiles?.length === 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-brown-soft/60">저장된 기본정보가 없어요.</p>
            <Link href="/my?tab=profiles" className="mt-2 inline-block text-xs font-bold text-coral-dark underline underline-offset-2">
              마이페이지에서 추가하기
            </Link>
          </div>
        )}

        {profiles && profiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  onSelect(profile);
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl bg-cream/60 p-3 text-left transition active:scale-[0.98] hover:bg-cream"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-brown">
                    {profile.name} <span className="font-normal text-brown-soft/50">· {profile.relation}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-brown-soft/50">
                    {profile.birthdate} {profile.birthTime && `· ${profile.birthTime}`} ·{" "}
                    {profile.gender === "male" ? "남" : "여"}
                    {profile.mbti && ` · ${profile.mbti}`}
                  </p>
                </div>
                <span className="shrink-0 text-lg text-brown-soft/30">→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
