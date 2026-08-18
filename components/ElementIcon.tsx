import { ELEMENT_BANK, type ElementKey } from "@/lib/result-engine/elements";

interface ElementIconProps {
  element: ElementKey;
  size?: number;
  /** "badge" = 옅은 색 배경 + 진한 아이콘(기본). "filled" = 꽉 찬 색 배경 + 흰 아이콘(스탬프 느낌). */
  variant?: "badge" | "filled";
}

// 오행별 손그림 느낌의 심볼. 아이콘 라이브러리 대신 직접 그린 SVG로,
// 별도 이미지 파일 없이 색상만 elements.ts의 데이터를 그대로 사용한다.
const GLYPHS: Record<ElementKey, React.ReactNode> = {
  wood: (
    <path
      d="M12 3c2.2 2 3.5 4.2 3.5 6.5A3.5 3.5 0 0 1 12 13a3.5 3.5 0 0 1-3.5-3.5C8.5 7.2 9.8 5 12 3Z M12 13v8M9 21h6M9.5 16c-1.5 0-2.8-.9-3.3-2.2M14.5 16c1.5 0 2.8-.9 3.3-2.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  fire: (
    <path
      d="M12 2.5c.6 2.4-1.8 3.6-1.8 6 0 1.1.9 2 2 2s2-.9 1.9-2.1c1.7 1.4 2.9 3.5 2.9 5.8a5 5 0 1 1-10 0c0-3.6 2.6-5.7 5-11.7Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  earth: (
    <path
      d="M3 18.5 9 7l3 5.5L14.5 9 21 18.5Z M3 18.5h18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  metal: (
    <path
      d="m12 3 7 4v6l-7 4-7-4V7Z M12 3v14M5 7l7 4 7-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  water: (
    <path
      d="M12 3.5c3 4 5.5 7.7 5.5 10.8a5.5 5.5 0 1 1-11 0c0-3.1 2.5-6.8 5.5-10.8Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export default function ElementIcon({ element, size = 48, variant = "badge" }: ElementIconProps) {
  const { color } = ELEMENT_BANK[element];
  const filled = variant === "filled";
  return (
    <div
      className="inline-flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: filled ? color : `${color}1a`,
        color: filled ? "#fff" : color,
        boxShadow: filled ? "0 2px 6px rgba(0,0,0,0.15)" : undefined,
      }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55}>
        {GLYPHS[element]}
      </svg>
    </div>
  );
}
