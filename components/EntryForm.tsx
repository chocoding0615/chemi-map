"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MbtiSelect from "./MbtiSelect";
import ResultCard from "./ResultCard";
import type { ElementKey } from "@/lib/result-engine/elements";

interface EntryFormProps {
  slug: string;
  ownerName: string;
}

interface Result {
  title: string;
  visitorElement: ElementKey;
  elementBlurb: string;
  affinityLabel: string;
  affinityEmoji: string;
  affinityScore: number;
  affinityBlurb: string;
  seasonType: string;
  distribution: Record<ElementKey, number>;
  distributionBlurb: string;
  pillarText: string;
  hasTimeInput: boolean;
}

export default function EntryForm({ slug, ownerName }: EntryFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mbti, setMbti] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !mbti || !birthdate) {
      setError("이름, MBTI, 생년월일을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/maps/${slug}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mbti, birthdate, birthTime: birthTime || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "결과를 만들지 못했어요. 다시 시도해주세요.");
        return;
      }
      setResult(data.result);
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="w-full space-y-5">
        <ResultCard
          title={result.title}
          element={result.visitorElement}
          elementBlurb={result.elementBlurb}
          affinityLabel={result.affinityLabel}
          affinityEmoji={result.affinityEmoji}
          affinityScore={result.affinityScore}
          affinityBlurb={result.affinityBlurb}
          seasonType={result.seasonType}
          distribution={result.distribution}
          distributionBlurb={result.distributionBlurb}
          pillarText={result.pillarText}
          hasTimeInput={result.hasTimeInput}
        />
        <Link
          href="/"
          className="block w-full rounded-xl bg-gradient-to-b from-amber-400 to-orange-500 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-105 active:brightness-95"
        >
          나도 케미 지도 만들기
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <p className="text-center text-sm leading-relaxed text-amber-900/60">
        생일과 MBTI만 넣으면, 내가 {ownerName}님에게 어떤 사람인지 나와요
      </p>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-amber-950">이름</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="홍길동"
          className="w-full rounded-xl border border-amber-900/10 bg-amber-50/60 px-4 py-2.5 text-sm text-amber-950 placeholder:text-amber-900/30 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-amber-950">MBTI</label>
        <MbtiSelect value={mbti} onChange={setMbti} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-amber-950">생년월일</label>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full rounded-xl border border-amber-900/10 bg-amber-50/60 px-4 py-2.5 text-sm text-amber-950 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-amber-950">
          출생 시간 <span className="font-normal text-amber-900/40">(선택, 모르면 비워두세요)</span>
        </label>
        <input
          type="time"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
          className="w-full rounded-xl border border-amber-900/10 bg-amber-50/60 px-4 py-2.5 text-sm text-amber-950 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-b from-amber-400 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-105 active:brightness-95 disabled:opacity-50"
      >
        {loading ? "확인하는 중..." : "결과 보기"}
      </button>
    </form>
  );
}
