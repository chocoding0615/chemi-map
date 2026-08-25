"use client";

import AccessBadge from "@/components/common/AccessBadge";
import { notify } from "@/lib/notify";

interface DisabledFortuneCardProps {
  icon: string;
  label: string;
}

// 정적 div였던 "준비 중" 카드를 실제 클릭 가능한 button으로 바꿔서, 눌러도 아무 반응
// 없는 상태("고장인가?")를 없앤다 — 눌렀을 때 토스트로 "곧 열릴 예정"임을 알려준다.
export default function DisabledFortuneCard({ icon, label }: DisabledFortuneCardProps) {
  return (
    <button
      type="button"
      onClick={() => notify({ kind: "normal", text: "곧 열릴 예정이에요! 🦊" })}
      className="flex flex-col items-center justify-center rounded-2xl bg-brown/5 p-4 text-center transition active:scale-95"
    >
      <span className="text-2xl opacity-60">{icon}</span>
      <p className="mt-2 text-sm font-bold text-brown-soft/90">{label}</p>
      <div className="mt-2">
        <AccessBadge state={{ kind: "soon" }} />
      </div>
    </button>
  );
}
