"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS, isTabActive } from "@/lib/nav";

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brown/10 bg-white shadow-[0_-2px_12px_rgba(255,159,90,0.12)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-16 max-w-[480px] md:max-w-2xl items-stretch justify-between px-1">
        {TABS.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="flex min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5"
            >
              <span
                className="text-xl transition-transform motion-reduce:transform-none"
                style={{ transform: active ? "scale(1.1)" : "scale(1)" }}
              >
                {tab.icon}
              </span>
              <span
                className={`text-[11px] ${active ? "font-semibold text-coral-dark" : "font-normal text-brown-soft"}`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
