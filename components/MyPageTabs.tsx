"use client";

import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import CollectionSection from "./CollectionSection";
import ProfileManager from "./ProfileManager";

type TabId = "account" | "collection" | "profiles";

export default function MyPageTabs({ accountTab }: { accountTab: ReactNode }) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [active, setActive] = useState<TabId>(
    initialTab === "collection" ? "collection" : initialTab === "profiles" ? "profiles" : "account"
  );

  return (
    <div className="mt-6 w-full">
      <div className="flex w-full rounded-2xl bg-white p-1 shadow-sm ring-1 ring-brown/5">
        <button
          type="button"
          onClick={() => setActive("account")}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
            active === "account" ? "bg-coral text-white shadow-sm" : "text-brown-soft/90"
          }`}
        >
          내 정보
        </button>
        <button
          type="button"
          onClick={() => setActive("collection")}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
            active === "collection" ? "bg-coral text-white shadow-sm" : "text-brown-soft/90"
          }`}
        >
          부적 주머니
        </button>
        <button
          type="button"
          onClick={() => setActive("profiles")}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
            active === "profiles" ? "bg-coral text-white shadow-sm" : "text-brown-soft/90"
          }`}
        >
          기본정보
        </button>
      </div>

      <div className="mt-6 flex w-full flex-col items-center">
        {active === "account" ? accountTab : active === "collection" ? <CollectionSection /> : <ProfileManager />}
      </div>
    </div>
  );
}
