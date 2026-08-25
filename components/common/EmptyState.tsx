import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}

// 빈 화면은 사용자가 "이거 망한 건가?" 싶게 만드는 최악의 UX다 — 항상 다음 행동을 제안한다.
export default function EmptyState({ icon = "🦊", message, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="w-full rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-brown/5">
      <span className="text-3xl">{icon}</span>
      <p className="mt-2 text-sm text-brown-soft/90">{message}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-3 inline-block rounded-xl bg-gradient-to-b from-coral to-coral-dark px-4 py-2 text-xs font-bold text-white transition active:scale-95"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
