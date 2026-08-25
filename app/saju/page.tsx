"use client";

import FoxMascot from "@/components/FoxMascot";
import ProfileLoadModal from "@/components/ProfileLoadModal";
import SajuForm from "@/components/saju/SajuForm";
import SajuResultView from "@/components/saju/SajuResultView";
import { useSajuForm } from "@/hooks/useSajuForm";

export default function SajuPage() {
  const form = useSajuForm();

  return (
    <div className="mx-auto flex w-full max-w-[480px] md:max-w-2xl flex-1 flex-col items-center px-6 py-16">
      {!form.result && (
        <>
          <FoxMascot size={56} prop="scroll" />
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">내 사주 풀이</h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-brown-soft">
            생년월일·성별·태어난 시간을 넣으면 복실이가 사주를 풀어드려요
          </p>
        </>
      )}

      {!form.result ? (
        <SajuForm form={form} />
      ) : (
        <SajuResultView result={form.result} resultRef={form.resultRef} onReset={() => form.setResult(null)} />
      )}

      {form.loadModalOpen && (
        <ProfileLoadModal onSelect={form.applyProfile} onClose={() => form.setLoadModalOpen(false)} />
      )}
    </div>
  );
}
