"use client";

import { useState } from "react";
import type { EntryDoc } from "@/lib/types";
import type { ElementKey } from "@/lib/result-engine/elements";
import { AFFINITY_BANK, AFFINITY_ORDER, type AffinityCategory } from "@/lib/result-engine/affinity";
import ElementIcon from "./ElementIcon";

interface OrbitMapProps {
  ownerName: string;
  ownerElement: ElementKey;
  entries: EntryDoc[];
}

const MIN_SCORE = 60;
const MAX_SCORE = 99;
const GOLDEN_ANGLE = 2.399963; // radians (~137.5°) — even organic spread, no library needed
const CENTER = 50;
const MIN_DIST = 16; // % of container — closest orbit, just outside the center circle
const MAX_DIST = 36; // % of container — leaves margin so labels never clip the edge
const RINGS = [16, 26, 36]; // radar-style distance guides, same units as MIN_DIST/MAX_DIST

// 0-100 coordinate space so the whole canvas scales with its container via the
// SVG viewBox — no JS size measurement needed, and it always matches the width
// of the cards around it (which was the "안 맞다" sizing bug: the old version
// used a hardcoded pixel size instead of filling its parent).
//
// Angle is assigned by score RANK, not array order: two people with close
// scores end up close in distance too, so giving them adjacent ranks
// guarantees a full golden-angle (~137.5°) gap between them and avoids the
// circles overlapping. Entries far apart in score (and therefore in distance)
// can share a similar angle safely since a different ring keeps them apart.
function layoutPositions(entries: EntryDoc[]) {
  const rankOrder = [...entries].sort((a, b) => b.affinityScore - a.affinityScore);
  const rankById = new Map(rankOrder.map((entry, i) => [entry.id, i]));

  return entries.map((entry) => {
    const norm = Math.min(1, Math.max(0, (entry.affinityScore - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)));
    const distance = MAX_DIST - norm * (MAX_DIST - MIN_DIST);
    const angle = rankById.get(entry.id)! * GOLDEN_ANGLE;
    return {
      entry,
      x: CENTER + distance * Math.cos(angle),
      y: CENTER + distance * Math.sin(angle),
    };
  });
}

function MapCanvas({
  ownerName,
  ownerElement,
  entries,
}: {
  ownerName: string;
  ownerElement: ElementKey;
  entries: EntryDoc[];
}) {
  const positions = layoutPositions(entries);

  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-amber-900/10"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 45%, #fffaf0 0%, #ffe8c2 45%, #fdba74 100%)",
      }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {RINGS.map((r) => (
          <circle key={r} cx={CENTER} cy={CENTER} r={r} fill="none" stroke="rgba(154,52,18,0.14)" strokeWidth={0.3} />
        ))}
        {positions.map(({ entry, x, y }) => (
          <line key={entry.id} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="rgba(154,52,18,0.22)" strokeWidth={0.3} />
        ))}
      </svg>

      <div
        className="absolute flex flex-col items-center"
        style={{ left: `${CENTER}%`, top: `${CENTER}%`, transform: "translate(-50%, -50%)" }}
      >
        <ElementIcon element={ownerElement} size={56} variant="filled" />
        <span className="mt-1 whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-amber-950 shadow-sm">
          {ownerName} (나)
        </span>
      </div>

      {positions.map(({ entry, x, y }) => (
        <div
          key={entry.id}
          className="absolute flex flex-col items-center"
          style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
        >
          <ElementIcon element={entry.visitorElement} size={40} variant="filled" />
          <span className="mt-0.5 max-w-[64px] truncate rounded-full bg-white/95 px-1.5 text-[10px] font-semibold text-amber-950 shadow-sm">
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

export default function OrbitMap({ ownerName, ownerElement, entries }: OrbitMapProps) {
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
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="block w-full"
        aria-label="지도 크게 보기"
      >
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
