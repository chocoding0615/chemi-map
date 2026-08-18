"use client";

import { useEffect, useState } from "react";
import type { EntryDoc } from "@/lib/types";
import { ELEMENT_BANK, type ElementKey } from "@/lib/result-engine/elements";
import { AFFINITY_BANK, AFFINITY_ORDER, type AffinityCategory } from "@/lib/result-engine/affinity";
import ElementIcon from "./ElementIcon";

interface NeighborhoodMapProps {
  ownerName: string;
  ownerElement: ElementKey;
  entries: EntryDoc[];
}

const MIN_SCORE = 60;
const MAX_SCORE = 99;
const CENTER = 50;
const MIN_DIST = 19; // % — closest a visitor can sit to the house (clears the house circle)
const MAX_DIST = 37; // % — farthest a visitor sits, leaves a clear gap before the zone label
const LABEL_DIST = 46; // % — zone icon/label radius, kept well past MAX_DIST so nothing overlaps
const ZONE_HALF_WIDTH = 34; // ° — how far a visitor can drift from its zone's center angle

// 5개 오행 구역을 집(나)을 중심으로 고정 배치. 점수 순 배치가 아니라 오행별로
// 방향이 정해져 있어서, "아래는 흙, 옆은 바다" 식으로 항상 같은 자리에 같은
// 지형이 있다 — 매번 다르게 재배열되는 궤도가 아니라 진짜 "우리 동네 지도".
const ZONES: { element: ElementKey; angle: number; label: string; icon: string }[] = [
  { element: "wood", angle: 0, label: "하늘숲", icon: "🌳" },
  { element: "water", angle: 72, label: "바다", icon: "🌊" },
  { element: "earth", angle: 144, label: "흙길", icon: "🌾" },
  { element: "fire", angle: 216, label: "불빛", icon: "🔥" },
  { element: "metal", angle: 288, label: "바위산", icon: "🪨" },
];

function compassToXY(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + radius * Math.sin(rad), y: CENTER - radius * Math.cos(rad) };
}

function layoutPositions(entries: EntryDoc[]) {
  return ZONES.flatMap((zone) => {
    const members = entries
      .filter((e) => e.visitorElement === zone.element)
      .sort((a, b) => b.affinityScore - a.affinityScore);

    return members.map((entry, i) => {
      const norm = Math.min(1, Math.max(0, (entry.affinityScore - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)));
      const rankNorm = members.length > 1 ? i / (members.length - 1) : 1 - norm;
      const distance = MIN_DIST + rankNorm * (MAX_DIST - MIN_DIST);
      // 같은 구역 안에서는 순위별로 각도를 고르게 펼쳐서 절대 겹치지 않게 한다
      // (해시 기반 무작위 오프셋은 우연히 비슷한 각도가 나올 수 있어서 교체함).
      const angleOffset = members.length > 1 ? ((i + 1) / (members.length + 1) - 0.5) * 2 * ZONE_HALF_WIDTH : 0;
      const angle = zone.angle + angleOffset;
      // 한 구역에 사람이 많을수록 아이콘을 살짝 줄여 겹침 여지를 줄인다.
      const iconSize = members.length <= 1 ? 38 : members.length === 2 ? 34 : members.length <= 4 ? 28 : 22;
      return { entry, zone, iconSize, ...compassToXY(angle, distance) };
    });
  });
}

const ZONE_GRADIENT = `conic-gradient(from -36deg, ${ZONES.map(
  (z) => `${ELEMENT_BANK[z.element].color}26 0deg 72deg`
).join(", ")})`;

function MapCanvas({
  ownerName,
  ownerElement,
  entries,
}: {
  ownerName: string;
  ownerElement: ElementKey;
  entries: EntryDoc[];
}) {
  const [settled, setSettled] = useState(false);
  const positions = layoutPositions(entries);

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-amber-900/10"
      style={{
        backgroundImage: `${ZONE_GRADIENT}, radial-gradient(circle at 50% 50%, #fffaf0 0%, #fff3dc 60%, #ffe8c2 100%)`,
      }}
    >
      {ZONES.map((zone) => {
        const { x, y } = compassToXY(zone.angle, LABEL_DIST);
        return (
          <div
            key={zone.element}
            className="absolute flex flex-col items-center gap-0.5 text-center"
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
          >
            <span className="text-base leading-none">{zone.icon}</span>
            <span className="whitespace-nowrap text-[9px] font-bold text-amber-900/45">{zone.label}</span>
          </div>
        );
      })}

      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {positions.map(({ entry, x, y }) => (
          <line
            key={entry.id}
            x1={CENTER}
            y1={CENTER}
            x2={settled ? x : CENTER}
            y2={settled ? y : CENTER}
            stroke="rgba(154,52,18,0.2)"
            strokeWidth={0.3}
            style={{ transition: "x2 0.7s cubic-bezier(0.22,1,0.36,1), y2 0.7s cubic-bezier(0.22,1,0.36,1)" }}
          />
        ))}
      </svg>

      <div
        className="absolute flex flex-col items-center"
        style={{ left: `${CENTER}%`, top: `${CENTER}%`, transform: "translate(-50%, -50%)" }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-md"
          style={{ boxShadow: `0 0 0 3px ${ELEMENT_BANK[ownerElement].color}55` }}
        >
          🏠
        </div>
        <span className="mt-1 whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-amber-950 shadow-sm">
          {ownerName} (나)
        </span>
      </div>

      {positions.map(({ entry, x, y, iconSize }) => (
        <div
          key={entry.id}
          className="absolute flex flex-col items-center"
          style={{
            left: `${settled ? x : CENTER}%`,
            top: `${settled ? y : CENTER}%`,
            transform: "translate(-50%, -50%)",
            opacity: settled ? 1 : 0,
            transition: "left 0.7s cubic-bezier(0.22,1,0.36,1), top 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.4s",
          }}
        >
          <ElementIcon element={entry.visitorElement} size={iconSize} variant="filled" />
          <span className="mt-0.5 max-w-[72px] truncate rounded-full bg-white/95 px-1.5 text-[10px] font-semibold text-amber-950 shadow-sm">
            {entry.visitorName}
          </span>
        </div>
      ))}

      {entries.length === 0 && (
        <p className="absolute inset-x-0 bottom-4 text-center text-xs text-amber-900/50">
          친구들이 생일을 넣으면 여기 나타나요
        </p>
      )}
    </div>
  );
}

export default function NeighborhoodMap({ ownerName, ownerElement, entries }: NeighborhoodMapProps) {
  const [expanded, setExpanded] = useState(false);

  const counts: Record<AffinityCategory, number> = {
    guin: 0,
    danjjak: 0,
    naesaram: 0,
    oreunpal: 0,
    horangi: 0,
  };
  for (const entry of entries) counts[entry.affinityCategory]++;

  return (
    <div className="w-full max-w-sm">
      <button type="button" onClick={() => setExpanded(true)} className="block w-full" aria-label="지도 크게 보기">
        <MapCanvas ownerName={ownerName} ownerElement={ownerElement} entries={entries} />
      </button>
      <p className="mt-1.5 text-center text-xs text-amber-900/40">지도를 누르면 크게 볼 수 있어요</p>

      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {AFFINITY_ORDER.map((key) => {
          const affinity = AFFINITY_BANK[key];
          const count = counts[key];
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

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 p-6"
          onClick={() => setExpanded(false)}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <MapCanvas ownerName={ownerName} ownerElement={ownerElement} entries={entries} />
          </div>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-amber-950"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}
