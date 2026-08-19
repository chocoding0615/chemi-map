import { FORTUNE_CATEGORIES, type CategorySlug } from "./fortuneCategories";
import { FORTUNE_FREE_PREVIEW } from "@/lib/config";

export interface FortuneGroupItem {
  icon: string;
  label: string;
  desc: string;
  href: string;
  disabled?: boolean;
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
    desc: FORTUNE_FREE_PREVIEW ? "지금은 무료" : `${category.priceKrw.toLocaleString()}원`,
    href: `/fortune/${slug}`,
  };
}

// 그룹 → 항목 구조로 정의해서 map으로 렌더링 — 항목 추가/순서변경은 이 배열만 고치면 된다.
export const FORTUNE_GROUPS: FortuneGroup[] = [
  {
    title: "시간의 흐름",
    items: [
      { icon: "☀️", label: "오늘의 기운", desc: "무료 · 매일 갱신", href: "/today" },
      { icon: "🌙", label: "이달의 기운", desc: "무료 · 매달 갱신", href: "/fortune/monthly" },
      fromCategory("yearly"),
      fromCategory("daeun"),
    ],
  },
  {
    title: "인연과 관계",
    items: [fromCategory("love"), fromCategory("gunghap"), fromCategory("sogaeting")],
  },
  {
    title: "그 밖의 운세",
    items: [
      fromCategory("career"),
      fromCategory("taekil"),
      { icon: "💬", label: "고민 상담", desc: "준비 중", href: "#", disabled: true },
    ],
  },
];
