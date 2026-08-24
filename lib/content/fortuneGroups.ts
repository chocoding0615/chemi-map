import { FORTUNE_CATEGORIES, type CategorySlug } from "./fortuneCategories";
import { FORTUNE_FREE_PREVIEW } from "@/lib/config";

export interface FortuneGroupItem {
  icon: string;
  label: string;
  desc: string;
  href: string;
  disabled?: boolean;
  /** L3 카드들 사이에서 살짝만 강조할 항목(오늘의 기운 등). 여우.md v2 규칙: "카드 그리드
   * 내부는 모두 동일 스타일. 오늘의 기운만 살짝 강조 허용(L2 하한)." */
  emphasize?: boolean;
}

export interface FortuneGroup {
  title: string;
  items: FortuneGroupItem[];
}

function fromCategory(slug: CategorySlug): FortuneGroupItem {
  const category = FORTUNE_CATEGORIES[slug];
  return {
    icon: category.icon,
    label: category.nameKo,
    desc: FORTUNE_FREE_PREVIEW ? "지금은 무료" : `🌱${category.priceKrw.toLocaleString()}`,
    href: `/fortune/${slug}`,
  };
}

// 그룹 → 항목 구조로 정의해서 map으로 렌더링 — 항목 추가/순서변경은 이 배열만 고치면 된다.
// 순서는 여우.md v2 정보위계 규칙(① 대표 ② 인연·관계 ③ 시간의 흐름 ④ 그 밖)을 따른다 —
// "① 대표(내 사주 풀이)"는 홈 화면의 별도 L1 카드라 이 배열엔 없음.
export const FORTUNE_GROUPS: FortuneGroup[] = [
  {
    title: "인연과 관계",
    items: [fromCategory("love"), fromCategory("marriage"), fromCategory("gunghap"), fromCategory("sogaeting")],
  },
  {
    title: "시간의 흐름",
    items: [
      { icon: "☀️", label: "오늘의 기운", desc: "무료 · 매일 갱신", href: "/today", emphasize: true },
      { icon: "🌙", label: "이달의 기운", desc: "무료 · 매달 갱신", href: "/fortune/monthly" },
      fromCategory("yearly"),
      fromCategory("daeun"),
    ],
  },
  {
    title: "그 밖의 운세",
    items: [
      fromCategory("career"),
      fromCategory("wealth"),
      fromCategory("taekil"),
      { icon: "💬", label: "고민 상담", desc: "준비 중", href: "#", disabled: true },
    ],
  },
];
