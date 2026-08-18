"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MbtiSelect from "./MbtiSelect";

export default function MapCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mbti, setMbti] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !mbti || !birthdate) {
      setError("이름, MBTI, 생년월일을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mbti, birthdate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "지도를 만들지 못했어요. 다시 시도해주세요.");
        return;
      }
      router.push(`/m/${data.slug}?created=1`);
    } catch {
      setError("네트워크 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">이름</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="홍길동"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">MBTI</label>
        <MbtiSelect value={mbti} onChange={setMbti} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">생년월일</label>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-amber-500 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
      >
        {loading ? "만드는 중..." : "내 지도 만들기"}
      </button>
    </form>
  );
}
