"use client";

import { useState } from "react";

export interface AdvancedSettingsValue {
  longitudeCorrection: boolean;
  longitude: string;
}

export const DEFAULT_ADVANCED_SETTINGS: AdvancedSettingsValue = {
  longitudeCorrection: true,
  longitude: "",
};

interface AdvancedSettingsProps {
  value: AdvancedSettingsValue;
  onChange: (value: AdvancedSettingsValue) => void;
}

// /saju 입력 폼의 L4(접이식) 고급 설정 — 기본 접힘 상태로, 초심자 시야를 어지럽히지 않는다(여우.md v2).
// 양력/음력 선택은 BirthDatePicker 쪽으로 옮겨서(전역 적용), 여기는 경도보정 + 자시 안내만 남는다.
export default function AdvancedSettings({ value, onChange }: AdvancedSettingsProps) {
  const [open, setOpen] = useState(false);

  function patch(next: Partial<AdvancedSettingsValue>) {
    onChange({ ...value, ...next });
  }

  return (
    <div className="rounded-xl bg-cream/60 ring-1 ring-brown/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold text-brown-soft/90"
      >
        <span>⚙️ 고급 설정 (경도보정)</span>
        <span className="text-brown-soft/40">{open ? "접기 ▲" : "펼치기 ▼"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-brown/10 px-4 py-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1 text-xs font-semibold text-brown">
                한국시 경도보정
                <span
                  title="한국 표준시(동경 135도)와 실제 태어난 지역의 태양 위치는 시차가 있어요. 이 보정을 켜면 그 시차를 반영해서 사주를 더 정확하게 계산해요."
                  className="cursor-help text-brown/40"
                >
                  ⓘ
                </span>
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={value.longitudeCorrection}
                onClick={() => patch({ longitudeCorrection: !value.longitudeCorrection })}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  value.longitudeCorrection ? "bg-coral" : "bg-brown/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    value.longitudeCorrection ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            {value.longitudeCorrection && (
              <div className="mt-2">
                <input
                  type="number"
                  inputMode="decimal"
                  value={value.longitude}
                  onChange={(e) => patch({ longitude: e.target.value })}
                  placeholder="출생지 경도(모르면 비워두세요, 기본 127.5°)"
                  className="w-full rounded-lg border border-brown/10 bg-white px-3 py-2 text-xs text-brown placeholder:text-brown/30 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
                />
                <p className="mt-1 text-[10px] text-brown-soft/40">
                  예: 서울 126.98 · 부산 129.08 · 모르면 비워두면 한반도 평균(127.5°)으로 계산해요.
                </p>
              </div>
            )}
          </div>

          <p className="rounded-lg bg-white/70 p-2.5 text-[10px] leading-relaxed text-brown-soft/60">
            🕛 밤 11시~새벽 1시(자시) 사이에 태어났다면, 일주 기준을 어떻게 보느냐에 따라 결과가 살짝 달라질 수
            있어요. 이 앱은 자정을 기준으로 날짜를 나눠 계산해요.
          </p>
        </div>
      )}
    </div>
  );
}
