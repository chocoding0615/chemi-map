// 화면마다 제각각이던 무료/유료/준비중 표기("무료 · 공유해보기" / "요약 무료" /
// "지금은 무료" / 가격 미표기 등)를 이 컴포넌트 하나로 통일한다.
export type AccessState = { kind: "free" } | { kind: "price"; priceKrw: number } | { kind: "soon" };

interface AccessBadgeProps {
  state: AccessState;
  size?: "sm" | "md";
}

const STYLE: Record<AccessState["kind"], string> = {
  free: "bg-mint/20 text-mint-dark",
  price: "bg-coral/10 text-coral-dark",
  soon: "bg-brown/10 text-brown-soft/60",
};

function labelFor(state: AccessState): string {
  if (state.kind === "free") return "무료";
  if (state.kind === "soon") return "준비 중";
  return `잔디 ${state.priceKrw.toLocaleString()}개`;
}

export default function AccessBadge({ state, size = "sm" }: AccessBadgeProps) {
  const sizeClass = size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[11px]";
  return (
    <span className={`inline-flex items-center rounded-full font-bold ${STYLE[state.kind]} ${sizeClass}`}>
      {labelFor(state)}
    </span>
  );
}
