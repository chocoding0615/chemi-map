"use client";

import { useState } from "react";
import type { EntryDoc, Gender } from "@/lib/types";
import { ELEMENT_BANK } from "@/lib/result-engine/elements";
import { mbtiToTemperament } from "@/lib/result-engine/temperament";
import { AFFINITY_BANK, AFFINITY_ORDER, type AffinityCategory } from "@/lib/result-engine/affinity";
import {
  getEquipmentItem,
  SLOT_ORDER,
  SLOT_LABEL,
  SLOT_ELEMENT,
  type EquipmentSlot,
} from "@/lib/result-engine/equipment";
import ElementIcon from "./ElementIcon";

interface EquipmentScreenProps {
  ownerName: string;
  ownerGender: Gender;
  entries: EntryDoc[];
}

const MIN_SCORE = 60;
const MAX_SCORE = 99;
const CENTER = 50;
const MIN_DIST = 20; // % — closest a visitor can sit to the character
const MAX_DIST = 36; // % — farthest, leaves a gap before the zone label
const LABEL_DIST = 45; // % — zone icon/label radius
const ZONE_HALF_WIDTH = 22; // ° — how far a visitor can spread from its slot's anchor angle

// 몸에 자연스럽게 붙도록 정중앙 기준 비대칭 각도로 배치 (0=위, 시계방향).
const SLOT_ANGLE: Record<EquipmentSlot, number> = {
  head: 0,
  rightHand: 55,
  rightFoot: 130,
  leftFoot: 230,
  leftHand: 305,
};

function compassToXY(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + radius * Math.sin(rad), y: CENTER - radius * Math.cos(rad) };
}

function layoutPositions(entries: EntryDoc[]) {
  return SLOT_ORDER.flatMap((slot) => {
    const element = SLOT_ELEMENT[slot];
    // Firestore 쿼리가 최신순(createdAt desc)이라, 원래 배열 순서를 뒤집으면
    // "이 오행 그룹 안에서 몇 번째로 등록했는지"를 안정적으로 구할 수 있다 —
    // 나중에 온 사람이 추가돼도 먼저 온 사람의 인덱스(=각도)는 절대 안 바뀐다.
    const members = [...entries].reverse().filter((e) => e.visitorElement === element);

    return members.map((entry, i) => {
      const norm = Math.min(1, Math.max(0, (entry.affinityScore - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)));
      // 본인 점수만으로 거리를 정한다(다른 사람과의 상대 순위 아님) — 그래야 새
      // 방문자가 와도 이미 표시된 사람의 위치가 절대 흔들리지 않는다.
      const distance = MAX_DIST - norm * (MAX_DIST - MIN_DIST);
      const angleOffset = members.length > 1 ? ((i + 1) / (members.length + 1) - 0.5) * 2 * ZONE_HALF_WIDTH : 0;
      const angle = SLOT_ANGLE[slot] + angleOffset;
      const iconSize = members.length <= 1 ? 40 : members.length === 2 ? 36 : members.length <= 4 ? 30 : 24;
      return { entry, slot, iconSize, ...compassToXY(angle, distance) };
    });
  });
}

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
  const item = getEquipmentItem(slot, mbtiToTemperament(entry.visitorMbti));

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
            {SLOT_LABEL[slot]}에 {item.name} 장착 · {element.label}({element.hanja})
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const positions = layoutPositions(entries);
  const selected = positions.find((p) => p.entry.id === selectedId);
  const filledZones = new Set(entries.map((e) => e.visitorElement)).size;

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
        {SLOT_ORDER.map((slot) => {
          const element = SLOT_ELEMENT[slot];
          const { x, y } = compassToXY(SLOT_ANGLE[slot], LABEL_DIST);
          const bank = ELEMENT_BANK[element];
          return (
            <div
              key={slot}
              className="absolute flex flex-col items-center gap-0.5 text-center"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
            >
              <ElementIcon element={element} size={22} />
              <span className="whitespace-nowrap text-[9px] font-bold" style={{ color: bank.color }}>
                {bank.label}({SLOT_LABEL[slot]})
              </span>
            </div>
          );
        })}

        <div
          className="absolute flex flex-col items-center"
          style={{ left: `${CENTER}%`, top: `${CENTER}%`, transform: "translate(-50%, -50%)" }}
        >
          <span style={{ fontSize: 92, lineHeight: 1 }}>{characterEmoji}</span>
          <span className="mt-1 whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-amber-950 shadow-sm">
            {ownerName}
          </span>
        </div>

        {positions.length === 0 && (
          <p className="absolute inset-x-0 bottom-4 text-center text-xs font-medium text-amber-900/50">
            친구들이 등록하면 장비가 채워져요
          </p>
        )}

        {positions.map(({ entry, slot, x, y, iconSize }) => {
          const item = getEquipmentItem(slot, mbtiToTemperament(entry.visitorMbti));
          const isSelected = selectedId === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelectedId(isSelected ? null : entry.id)}
              className="absolute flex flex-col items-center"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) scale(${isSelected ? 1.15 : 1})`,
                transition: "transform 0.15s",
              }}
            >
              <div
                className="flex items-center justify-center rounded-full shadow-md ring-2 ring-white"
                style={{
                  width: iconSize,
                  height: iconSize,
                  fontSize: iconSize * 0.5,
                  backgroundColor: ELEMENT_BANK[entry.visitorElement].color,
                }}
              >
                {item.emoji}
              </div>
              <span className="mt-0.5 max-w-[64px] truncate rounded-full bg-white/95 px-1.5 text-[10px] font-semibold text-amber-950 shadow-sm">
                {entry.visitorName}
              </span>
              <span className="max-w-[64px] truncate text-[9px] text-amber-900/45">{item.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-1.5 flex items-center justify-center gap-1 text-center text-xs text-amber-900/40">
        <span>오행이 자리를, 점수가 가까운 정도를, MBTI가 아이템 종류를 정해요</span>
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
          목=머리 · 수=오른손 · 토=오른발 · 화=왼발 · 금=왼손 — 그 사람의 오행에 따라 자리가 정해져요(생일로 정해지는 값이라 안 바뀌어요).
          <br />
          같은 자리 안에서는 케미 점수가 높을수록 캐릭터에 더 가까이 붙어요.
          <br />
          아이템 종류(검·지팡이·투구 등)는 MBTI 기질로 정해져요.
        </div>
      )}

      {selected && (
        <div className="mt-3">
          <SelectedCard entry={selected.entry} slot={selected.slot} onClose={() => setSelectedId(null)} />
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-amber-900/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
            style={{ width: `${(filledZones / SLOT_ORDER.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-bold text-amber-900/50">
          오행 {filledZones}/{SLOT_ORDER.length}
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
