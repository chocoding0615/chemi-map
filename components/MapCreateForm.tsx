"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MbtiSelect from "./MbtiSelect";
import { awardForAction } from "@/lib/foxRewards";
import { setMyMapSlug } from "@/lib/myMap";

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
      awardForAction("connections");
      setMyMapSlug(data.slug);
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
        <label className="mb-1.5 block text-sm font-semibold text-brown">이름</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="홍길동"
          className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown/30 focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brown">성별</label>
        <div className="grid grid-cols-2 gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`rounded-xl py-2.5 text-sm font-semibold transition active:scale-95 ${
                gender === g
                  ? "bg-gradient-to-b from-coral to-coral-dark text-white shadow-md shadow-coral-dark/25"
                  : "bg-cream text-brown-soft/70 ring-1 ring-brown/10 hover:bg-apricot"
              }`}
            >
              {g === "male" ? "남자" : "여자"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brown">MBTI</label>
        <MbtiSelect value={mbti} onChange={setMbti} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brown">생년월일</label>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brown">
          출생 시간 <span className="font-normal text-brown/40">(선택, 모르면 비워두세요)</span>
        </label>
        <input
          type="time"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
          className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
        />
      </div>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-b from-coral to-coral-dark py-3.5 text-sm font-bold text-white shadow-lg shadow-coral-dark/25 transition active:scale-95 hover:brightness-105 disabled:opacity-50"
      >
        {loading ? "만드는 중..." : "내 지도 만들기"}
      </button>
    </form>
  );
}
