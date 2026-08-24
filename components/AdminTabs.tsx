"use client";

import { useState, type ReactNode } from "react";

type TabId = "overview" | "users";

export default function AdminTabs({ overviewTab, usersTab }: { overviewTab: ReactNode; usersTab: ReactNode }) {
  const [active, setActive] = useState<TabId>("overview");

  return (
    <div className="mt-6 w-full">
      <div className="flex w-full rounded-2xl bg-white p-1 shadow-sm ring-1 ring-brown/5">
        <button
          type="button"
          onClick={() => setActive("overview")}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
            active === "overview" ? "bg-coral text-white shadow-sm" : "text-brown-soft/90"
          }`}
        >
          현황
        </button>
        <button
          type="button"
          onClick={() => setActive("users")}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
            active === "users" ? "bg-coral text-white shadow-sm" : "text-brown-soft/90"
          }`}
        >
          관리자 지정
        </button>
      </div>

      <div className="mt-6 flex w-full flex-col items-center">{active === "overview" ? overviewTab : usersTab}</div>
    </div>
  );
}
