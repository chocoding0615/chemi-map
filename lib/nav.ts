export interface TabDef {
  label: string;
  href: string;
  icon: string;
}

export const TABS: TabDef[] = [
  { label: "내 사주", href: "/saju", icon: "📜" },
  { label: "여우 마을", href: "/connections", icon: "🏘️" },
  { label: "오늘", href: "/today", icon: "☀️" },
  { label: "부적 주머니", href: "/collection", icon: "👝" },
  { label: "여우상", href: "/fox-type", icon: "🦊" },
];

export function isTabActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
