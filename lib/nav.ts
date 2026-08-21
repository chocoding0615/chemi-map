export interface TabDef {
  label: string;
  href: string;
  icon: string;
}

export const TABS: TabDef[] = [
  { label: "홈", href: "/", icon: "🏠" },
  { label: "내 사주", href: "/saju", icon: "📜" },
  { label: "비밀편지함", href: "/letter/inbox", icon: "🔒" },
  { label: "마이페이지", href: "/my", icon: "👤" },
];

export function isTabActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
