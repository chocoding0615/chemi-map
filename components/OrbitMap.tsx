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

function layoutPositions(entries: EntryDoc[], size: number) {
  const center = size / 2;
  const minDist = size * 0.2;
  const maxDist = size * 0.44;
  return entries.map((entry, i) => {
    const norm = Math.min(1, Math.max(0, (entry.affinityScore - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)));
    const distance = maxDist - norm * (maxDist - minDist);
    const angle = i * GOLDEN_ANGLE;
    return {
      entry,
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  });
}

function MapCanvas({
  ownerName,
  ownerElement,
  entries,
  size,
}: {
  ownerName: string;
  ownerElement: ElementKey;
  entries: EntryDoc[];
  size: number;
}) {
  const center = size / 2;
  const positions = layoutPositions(entries, size);
  const satelliteSize = Math.max(34, size * 0.13);

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 50% 40%, #1c2454 0%, #0b0f2e 70%, #060816 100%)",
        backgroundImage:
          "radial-gradient(circle at 50% 40%, #1c2454 0%, #0b0f2e 70%, #060816 100%), radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 22px 22px",
      }}
    >
      <svg width={size} height={size} className="absolute inset-0">
        {positions.map(({ entry, x, y }) => (
          <line
            key={entry.id}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1}
          />
        ))}
      </svg>

      <div
        className="absolute flex flex-col items-center"
        style={{ left: center, top: center, transform: "translate(-50%, -50%)" }}
      >
        <ElementIcon element={ownerElement} size={Math.max(48, size * 0.18)} variant="filled" />
        <span className="mt-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-amber-950">
          {ownerName} (나)
        </span>
      </div>

      {positions.map(({ entry, x, y }) => (
        <div
          key={entry.id}
          className="absolute flex flex-col items-center"
          style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
        >
          <ElementIcon element={entry.visitorElement} size={satelliteSize} variant="filled" />
          <span
            className="mt-0.5 max-w-[64px] truncate rounded-full bg-black/40 px-1.5 text-[10px] font-semibold text-white"
            style={{ fontSize: size < 250 ? 9 : 10 }}
          >
            {entry.visitorName}
          </span>
        </div>
      ))}

      {entries.length === 0 && (
        <p className="absolute inset-x-0 bottom-4 text-center text-xs text-white/50">
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
        <MapCanvas ownerName={ownerName} ownerElement={ownerElement} entries={entries} size={288} />
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
          <div onClick={(e) => e.stopPropagation()}>
            <MapCanvas ownerName={ownerName} ownerElement={ownerElement} entries={entries} size={340} />
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
