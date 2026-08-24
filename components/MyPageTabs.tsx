"use client";

import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import CollectionSection from "./CollectionSection";
import ProfileManager from "./ProfileManager";

type TabId = "account" | "collection" | "profiles" | "history";

const TABS: { id: TabId; label: string }[] = [
  { id: "account", label: "내 정보" },
  { id: "collection", label: "부적 주머니" },
  { id: "profiles", label: "기본정보" },
  { id: "history", label: "결제·사용 내역" },
];
const TAB_IDS: TabId[] = TABS.map((t) => t.id);

export default function MyPageTabs({ accountTab, historyTab }: { accountTab: ReactNode; historyTab: ReactNode }) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [active, setActive] = useState<TabId>(
    initialTab && TAB_IDS.includes(initialTab as TabId) ? (initialTab as TabId) : "account"
  );

  return (
    <div className="mt-6 w-full">
      <div className="flex w-full gap-0.5 overflow-x-auto rounded-2xl bg-white p-1 shadow-sm ring-1 ring-brown/5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`flex-1 shrink-0 whitespace-nowrap rounded-xl px-2 py-2 text-xs font-bold transition sm:text-sm ${
              active === tab.id ? "bg-coral text-white shadow-sm" : "text-brown-soft/90"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex w-full flex-col items-center">
        {active === "account" && accountTab}
        {active === "collection" && <CollectionSection />}
        {active === "profiles" && <ProfileManager />}
        {active === "history" && historyTab}
      </div>
    </div>
  );
}
