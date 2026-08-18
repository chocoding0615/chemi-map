"use client";

import { useState } from "react";
import type { EntryDoc, Gender } from "@/lib/types";
import { ELEMENT_BANK } from "@/lib/result-engine/elements";
import { mbtiToTemperament } from "@/lib/result-engine/temperament";
import { AFFINITY_BANK, AFFINITY_ORDER, type AffinityCategory } from "@/lib/result-engine/affinity";
import { getEquipmentItem, SLOT_ORDER, SLOT_LABEL, assignSlots, type EquipmentSlot } from "@/lib/result-engine/equipment";

interface EquipmentScreenProps {
  ownerName: string;
  ownerGender: Gender;
  entries: EntryDoc[];
}

const SLOT_POSITION: Record<EquipmentSlot, { x: number; y: number }> = {
  head: { x: 50, y: 15 },
  leftHand: { x: 15, y: 47 },
  rightHand: { x: 85, y: 47 },
  leftFoot: { x: 32, y: 85 },
  rightFoot: { x: 68, y: 85 },
};

const TIER_LABEL: Record<EquipmentSlot, string> = {
  head: "케미 1등",
  leftHand: "케미 2~3등",
  rightHand: "케미 2~3등",
  leftFoot: "케미 4~5등",
  rightFoot: "케미 4~5등",
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
            {SLOT_LABEL[slot]}에 {item.name} 장착 · {TIER_LABEL[slot]}
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

  const ranked = [...entries].sort((a, b) => b.affinityScore - a.affinityScore);
  const slots = assignSlots(ranked);
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
          <span style={{ fontSize: 60 }}>{characterEmoji}</span>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-amber-900/30 text-xs text-amber-900/40">
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
                className="flex h-11 w-11 items-center justify-center rounded-full text-lg shadow-md"
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

      <p className="mt-1.5 text-center text-xs text-amber-900/40">
        {entries.length === 0
          ? "친구들이 등록하면 장비가 채워져요"
          : "케미 1등은 머리, 2~3등은 무기, 4~5등은 신발을 차지해요"}
      </p>

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
