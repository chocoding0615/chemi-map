"use client";

import { useState } from "react";
import type { EntryDoc } from "@/lib/types";
import { ELEMENT_BANK, type ElementKey } from "@/lib/result-engine/elements";
import { AFFINITY_BANK, AFFINITY_ORDER, type AffinityCategory } from "@/lib/result-engine/affinity";
import FoxMascot from "./FoxMascot";

interface FoxMapScreenProps {
  ownerName: string;
  entries: EntryDoc[];
}

type Slot = "head" | "leftHand" | "rightHand" | "leftFoot" | "rightFoot";

const SLOT_ORDER: Slot[] = ["head", "leftHand", "rightHand", "leftFoot", "rightFoot"];

// 오행 → 몸 슬롯 고정 매핑(생일로 정해지는 값이라 절대 안 바뀐다).
const SLOT_ELEMENT: Record<Slot, ElementKey> = {
  head: "wood",
  rightHand: "water",
  rightFoot: "earth",
  leftFoot: "fire",
  leftHand: "metal",
};

const MIN_SCORE = 60;
const MAX_SCORE = 99;
const CENTER = 50;
const MIN_DIST = 20; // % — 캐릭터에 가장 가까이 붙는 거리
const MAX_DIST = 36; // % — 가장 멀리 떨어지는 거리
const ZONE_HALF_WIDTH = 22; // ° — 같은 슬롯 안에서 퍼질 수 있는 각도 범위

const SLOT_ANGLE: Record<Slot, number> = {
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
      return { entry, iconSize, ...compassToXY(angle, distance) };
    });
  });
}

function SelectedCard({ entry, onClose }: { entry: EntryDoc; onClose: () => void }) {
  const element = ELEMENT_BANK[entry.visitorElement];
  const affinity = AFFINITY_BANK[entry.affinityCategory];

  return (
    <div className="relative w-full max-w-sm rounded-2xl bg-white p-4 shadow-md ring-1 ring-brown/10">
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute right-3 top-3 text-brown/30 hover:text-brown/60"
      >
        ✕
      </button>
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl shadow-sm"
          style={{ backgroundColor: element.color }}
        >
          🦊
        </div>
        <div>
          <p className="font-bold text-brown">{entry.visitorName}</p>
          <p className="text-xs text-brown-soft/50">
            {element.label}({element.hanja}) 기운
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-coral-dark px-2.5 py-1 text-xs font-bold text-white">
          케미 {entry.affinityScore}
        </span>
      </div>
      <p className="mt-2 text-xs font-semibold text-coral-dark">
        복실이가 보기엔 {entry.visitorName}님은 너의 {affinity.label} {affinity.emoji}이에요.
      </p>
      <p className="mt-1 text-sm leading-relaxed text-brown-soft/70">{entry.resultAffinityBlurb}</p>
    </div>
  );
}

export default function FoxMapScreen({ ownerName, entries }: FoxMapScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const positions = layoutPositions(entries);
  const selected = positions.find((p) => p.entry.id === selectedId);

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
        className="relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-brown/10"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 45%, #fffaf3 0%, #fff1e0 60%, #ffe3c4 100%)",
        }}
      >
        <div
          className="absolute flex flex-col items-center"
          style={{ left: `${CENTER}%`, top: `${CENTER}%`, transform: "translate(-50%, -50%)" }}
        >
          <FoxMascot size={92} />
          <span className="mt-1 whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-brown shadow-sm">
            {ownerName}
          </span>
        </div>

        {positions.length === 0 && (
          <p className="absolute inset-x-0 bottom-4 text-center text-xs font-medium text-brown-soft/50">
            친구들이 등록하면 지도가 채워져요
          </p>
        )}

        {positions.map(({ entry, x, y, iconSize }) => {
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
                🦊
              </div>
              <span className="mt-0.5 max-w-[64px] truncate rounded-full bg-white/95 px-1.5 text-[10px] font-semibold text-brown shadow-sm">
                {entry.visitorName}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-3">
          <SelectedCard entry={selected.entry} onClose={() => setSelectedId(null)} />
        </div>
      )}

      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {AFFINITY_ORDER.map((key) => {
          const affinity = AFFINITY_BANK[key];
          const count = affinityCounts[key];
          return (
            <span
              key={key}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                count > 0 ? "bg-white text-brown shadow-sm" : "bg-brown/5 text-brown/30"
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
