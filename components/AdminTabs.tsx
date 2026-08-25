"use client";

import { useState, type ReactNode } from "react";

type TabId = "overview" | "analytics" | "users";

export default function AdminTabs({
  overviewTab,
  analyticsTab,
  usersTab,
}: {
  overviewTab: ReactNode;
  analyticsTab: ReactNode;
  usersTab: ReactNode;
}) {
  const [active, setActive] = useState<TabId>("overview");

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "현황" },
    { id: "analytics", label: "분석" },
    { id: "users", label: "관리자 지정" },
  ];

  const content = { overview: overviewTab, analytics: analyticsTab, users: usersTab }[active];

  return (
    <div className="mt-6 w-full">
      <div className="flex w-full rounded-2xl bg-white p-1 shadow-sm ring-1 ring-brown/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
              active === tab.id ? "bg-coral text-white shadow-sm" : "text-brown-soft/90"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex w-full flex-col items-center">{content}</div>
    </div>
  );
}
