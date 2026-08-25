"use client";

import BirthDatePicker from "@/components/BirthDatePicker";
import BirthTimePicker from "@/components/BirthTimePicker";
import MbtiSelect from "@/components/MbtiSelect";
import AdvancedSettings from "@/components/AdvancedSettings";
import type { UseSajuFormReturn } from "@/hooks/useSajuForm";

export default function SajuForm({ form }: { form: UseSajuFormReturn }) {
  return (
    <form
      onSubmit={form.handleSubmit}
      className="mt-8 w-full space-y-5 rounded-3xl bg-white p-6 shadow-xl shadow-brown/5 ring-1 ring-brown/5"
    >
      <button
        type="button"
        onClick={() => form.setLoadModalOpen(true)}
        className="w-full rounded-xl bg-cream py-2 text-xs font-bold text-brown-soft transition active:scale-95 hover:bg-apricot"
      >
        📋 저장해둔 기본정보 불러오기
      </button>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brown">
          이름 <span className="font-normal text-brown/40">(선택)</span>
        </label>
        <input
          value={form.name}
          onChange={(e) => form.setName(e.target.value)}
          maxLength={20}
          placeholder="홍길동"
          className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown/30 focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brown">
          생년월일 <span className="text-red-500">*</span>
        </label>
        <BirthDatePicker
          value={form.birthdate}
          onChange={form.setBirthdate}
          isLunar={form.isLunar}
          onLunarChange={form.setIsLunar}
          isLeapMonth={form.isLeapMonth}
          onLeapMonthChange={form.setIsLeapMonth}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brown">
          성별 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => form.setGender(g)}
              aria-pressed={form.gender === g}
              className={`rounded-xl py-2.5 text-sm font-semibold transition active:scale-95 ${
                form.gender === g
                  ? "bg-gradient-to-b from-coral to-coral-dark text-white shadow-md shadow-coral-dark/25 ring-2 ring-coral-dark"
                  : "bg-cream text-brown-soft ring-1 ring-brown/10 hover:bg-apricot"
              }`}
            >
              {g === "male" ? "남자" : "여자"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brown">
          태어난 시간 <span className="font-normal text-brown/40">(선택, 모르면 비워두세요)</span>
        </label>
        <BirthTimePicker value={form.birthTime} onChange={form.setBirthTime} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brown">
          MBTI <span className="font-normal text-brown/40">(선택, 입력하면 성격 기반 행동 조언도 나와요)</span>
        </label>
        <MbtiSelect value={form.mbti} onChange={form.setMbti} />
      </div>
      <AdvancedSettings value={form.advancedSettings} onChange={form.setAdvancedSettings} />
      {form.error && <p className="text-sm font-medium text-red-500">{form.error}</p>}
      <button
        type="submit"
        disabled={form.submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-coral to-coral-dark py-3.5 text-sm font-bold text-white shadow-lg shadow-coral-dark/25 transition active:scale-95 hover:brightness-105 disabled:opacity-70"
      >
        {form.submitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            복실이가 사주를 보는 중...
          </>
        ) : (
          "풀이 보기"
        )}
      </button>
    </form>
  );
}
