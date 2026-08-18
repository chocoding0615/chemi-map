"use client";

import { useState } from "react";
import type { EntryDoc, Gender } from "@/lib/types";
import { ELEMENT_BANK } from "@/lib/result-engine/elements";
import { mbtiToTemperament } from "@/lib/result-engine/temperament";
import { AFFINITY_BANK, AFFINITY_ORDER, type AffinityCategory } from "@/lib/result-engine/affinity";
import { getEquipmentItem, SLOT_ORDER, SLOT_LABEL, type EquipmentSlot } from "@/lib/result-engine/equipment";

interface EquipmentScreenProps {
  ownerName: string;
  ownerGender: Gender;
  entries: EntryDoc[];
}

// 캐릭터를 키운 만큼 슬롯도 몸에 더 붙게 당겨서 "장착한" 느낌을 낸다.
const SLOT_POSITION: Record<EquipmentSlot, { x: number; y: number }> = {
  head: { x: 50, y: 21 },
  leftHand: { x: 23, y: 53 },
  rightHand: { x: 77, y: 53 },
  leftFoot: { x: 36, y: 84 },
  rightFoot: { x: 64, y: 84 },
};

const ORDER_LABEL: Record<EquipmentSlot, string> = {
  head: "가장 먼저 등록",
  leftHand: "두세 번째로 등록",
  rightHand: "두세 번째로 등록",
  leftFoot: "네다섯 번째로 등록",
  rightFoot: "네다섯 번째로 등록",
};

function SelectedCard({
  entry,
  slot,
  onClose,
}: {
  entry: EntryDoc;
  slot: EquipmentSlot;
  onClose: () => void;
}) {
  const element = ELEMENT_BANK[entry.visitorElement];
  const affinity = AFFINITY_BANK[entry.affinityCategory];
  const item = getEquipmentItem(slot, entry.visitorElement, mbtiToTemperament(entry.visitorMbti));

  return (
    <div className="relative w-full max-w-sm rounded-2xl bg-white p-4 shadow-md ring-1 ring-amber-900/10">
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute right-3 top-3 text-amber-900/30 hover:text-amber-900/60"
      >
        ✕
      </button>
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl shadow-sm"
          style={{ backgroundColor: element.color }}
        >
          {item.emoji}
        </div>
        <div>
          <p className="font-bold text-amber-950">{entry.visitorName}</p>
          <p className="text-xs text-amber-900/45">
            {SLOT_LABEL[slot]}에 {item.name} 장착 · {ORDER_LABEL[slot]}
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-amber-900 px-2.5 py-1 text-xs font-bold text-white">
          케미 {entry.affinityScore}
        </span>
      </div>
      <p className="mt-2 text-xs font-semibold text-amber-700">
        {affinity.emoji} {affinity.label} · {entry.seasonType}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-amber-900/70">{entry.resultAffinityBlurb}</p>
    </div>
  );
}

export default function EquipmentScreen({ ownerName, ownerGender, entries }: EquipmentScreenProps) {
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const slots: Partial<Record<EquipmentSlot, EntryDoc>> = {};
  for (const entry of entries) {
    if (entry.equipmentSlot && !slots[entry.equipmentSlot]) slots[entry.equipmentSlot] = entry;
  }
  const filledCount = Object.keys(slots).length;
  const selectedEntry = selectedSlot ? slots[selectedSlot] : undefined;

  const characterEmoji = ownerGender === "female" ? "🧍‍♀️" : "🧍‍♂️";

  const affinityCounts: Record<AffinityCategory, number> = {
    guin: 0,
    danjjak: 0,
    naesaram: 0,
    oreunpal: 0,
    horangi: 0,
  };
  for (const entry of entries) affinityCounts[entry.affinityCategory]++;

  return (
    <div className="w-full max-w-sm">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-amber-900/10"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 45%, #fffaf0 0%, #fff3dc 60%, #ffe8c2 100%)",
        }}
      >
        <div
          className="absolute flex flex-col items-center"
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
        >
          <span style={{ fontSize: 92, lineHeight: 1 }}>{characterEmoji}</span>
          <span className="mt-1 whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-amber-950 shadow-sm">
            {ownerName}
          </span>
        </div>

        {SLOT_ORDER.map((slot) => {
          const pos = SLOT_POSITION[slot];
          const entry = slots[slot];

          if (!entry) {
            return (
              <div
                key={slot}
                className="absolute flex flex-col items-center opacity-30"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-amber-900/30 text-xs text-amber-900/40">
                  ?
                </div>
                <span className="mt-0.5 text-[9px] font-bold text-amber-900/40">{SLOT_LABEL[slot]}</span>
              </div>
            );
          }

          const item = getEquipmentItem(slot, entry.visitorElement, mbtiToTemperament(entry.visitorMbti));

          return (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedSlot(slot === selectedSlot ? null : slot)}
              className="absolute flex flex-col items-center"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%) scale(${selectedSlot === slot ? 1.15 : 1})`,
                transition: "transform 0.15s",
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-md ring-2 ring-white"
                style={{ backgroundColor: ELEMENT_BANK[entry.visitorElement].color }}
              >
                {item.emoji}
              </div>
              <span className="mt-0.5 max-w-[64px] truncate rounded-full bg-white/95 px-1.5 text-[10px] font-semibold text-amber-950 shadow-sm">
                {entry.visitorName}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-1.5 flex items-center justify-center gap-1 text-center text-xs text-amber-900/40">
        <span>
          {entries.length === 0
            ? "친구들이 등록하면 장비가 채워져요"
            : "먼저 등록한 5명이 순서대로 머리·무기·신발을 차지해요"}
        </span>
        <button
          type="button"
          onClick={() => setShowInfo((v) => !v)}
          aria-label="설명 보기"
          className="rounded-full bg-amber-900/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-900/50"
        >
          ?
        </button>
      </div>

      {showInfo && (
        <div className="mt-2 rounded-xl bg-white/70 p-3 text-xs leading-relaxed text-amber-900/60">
          한 번 자리를 차지하면 나중에 케미 점수가 더 높은 사람이 와도 안 바뀌어요.
          <br />
          장비 색(소재)은 그 사람의 오행, 종류(검·지팡이·방패·활 등)는 MBTI 기질로 정해져요.
          <br />
          케미 점수는 배지 숫자와 아래 랭킹 리스트 순서에만 쓰여요.
        </div>
      )}

      {selectedEntry && selectedSlot && (
        <div className="mt-3">
          <SelectedCard entry={selectedEntry} slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-amber-900/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
            style={{ width: `${(filledCount / SLOT_ORDER.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-bold text-amber-900/50">
          장비 {filledCount}/{SLOT_ORDER.length}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {AFFINITY_ORDER.map((key) => {
          const affinity = AFFINITY_BANK[key];
          const count = affinityCounts[key];
          return (
            <span
              key={key}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                count > 0 ? "bg-white text-amber-900 shadow-sm" : "bg-amber-900/5 text-amber-900/30"
              }`}
            >
              {affinity.emoji} {affinity.label} {count}
            </span>
          );
        })}
      </div>
    </div>
  );
}
