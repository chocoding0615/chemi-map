interface FoxMascotProps {
  size?: number;
  prop?: "brush" | "scroll" | "heart" | "star" | null;
  className?: string;
}

const PROP_EMOJI: Record<NonNullable<FoxMascotProps["prop"]>, string> = {
  brush: "🖌️",
  scroll: "📜",
  heart: "💛",
  star: "⭐",
};

// 복실이(아기 구미호) 마스코트의 유일한 렌더 지점 — 지금은 이모지 플레이스홀더지만,
// 나중에 실제 일러스트가 생기면 이 컴포넌트 내부만 <Image>로 바꾸면 모든 화면에 반영된다.
export default function FoxMascot({ size = 64, prop = null, className }: FoxMascotProps) {
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className ?? ""}`}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      🦊
      {prop && (
        <span className="absolute -bottom-1 -right-1" style={{ fontSize: size * 0.42 }}>
          {PROP_EMOJI[prop]}
        </span>
      )}
    </span>
  );
}
