export interface TabDef {
  label: string;
  href: string;
  icon: string;
  /** href 자체는 아니지만 이 탭 "소속"으로 간주할 경로들(홈 그리드에서 진입하는
   * 운세 콘텐츠 등) — 유저가 "나 지금 어디 있지?"를 항상 알 수 있게 한다. */
  matchPrefixes?: string[];
}

export const TABS: TabDef[] = [
  {
    label: "홈",
    href: "/",
    icon: "🏠",
    matchPrefixes: ["/today", "/fortune", "/connections", "/fox-type", "/diary", "/daily-charm", "/celeb-match"],
  },
  { label: "내 사주", href: "/saju", icon: "📜" },
  { label: "비밀편지함", href: "/letter/inbox", icon: "🔒" },
  { label: "심테", href: "/test", icon: "🎯" },
  {
    label: "마이페이지",
    href: "/my",
    icon: "👤",
    matchPrefixes: ["/policy", "/subscribe", "/terms", "/privacy", "/admin"],
  },
];

function matchesPath(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function isTabActive(pathname: string, tab: TabDef): boolean {
  if (matchesPath(pathname, tab.href)) return true;
  return (tab.matchPrefixes ?? []).some((prefix) => matchesPath(pathname, prefix));
}
