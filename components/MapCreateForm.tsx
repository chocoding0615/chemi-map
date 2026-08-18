"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MbtiSelect from "./MbtiSelect";

export default function MapCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [mbti, setMbti] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !gender || !mbti || !birthdate) {
      setError("이름, 성별, MBTI, 생년월일을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gender, mbti, birthdate, birthTime: birthTime || undefined }),
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
    <form onSubmit={handleSubmit} className="w-full space-y-5">
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
        <label className="mb-1.5 block text-sm font-semibold text-amber-950">성별</label>
        <div className="grid grid-cols-2 gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                gender === g
                  ? "bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/25"
                  : "bg-amber-50/60 text-amber-900/70 ring-1 ring-amber-900/10 hover:bg-amber-100"
              }`}
            >
              {g === "male" ? "남자" : "여자"}
            </button>
          ))}
        </div>
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
        {loading ? "만드는 중..." : "내 지도 만들기"}
      </button>
    </form>
  );
}
