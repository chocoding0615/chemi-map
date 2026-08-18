import type { ElementKey } from "./elements";
import type { Temperament } from "./temperament";

export type EquipmentSlot = "head" | "leftHand" | "rightHand" | "leftFoot" | "rightFoot";

// 먼저 등록한 5명이 순서대로 머리 -> 양손(무기) -> 양발(신발)을 차지한다. 제출
// 시점에 딱 한 번 배정하고 Firestore에 영구 저장 — 나중에 케미 점수가 더 높은
// 사람이 와도 이미 배정된 사람의 슬롯은 절대 바뀌지 않는다(점수는 랭킹 리스트와
// 배지 숫자에만 쓰인다). 점수 기준으로 매번 다시 정렬해서 배정했더니 새 방문자가
// 등록될 때마다 기존 사람 슬롯이 흔들리는 문제가 있어서 이렇게 고정함.
export const SLOT_ORDER: EquipmentSlot[] = ["head", "leftHand", "rightHand", "leftFoot", "rightFoot"];

export const SLOT_LABEL: Record<EquipmentSlot, string> = {
  head: "머리",
  leftHand: "왼손",
  rightHand: "오른손",
  leftFoot: "왼발",
  rightFoot: "오른발",
};

// 오행 = 장비 소재, MBTI 기질 = 무기/방어구 종류. 신발은 등수 안에서도 재미 요소로
// 오행별로 다르게(짚신/고무신/운동화 등) — 아이디어 그대로 반영.
const MATERIAL: Record<ElementKey, string> = {
  wood: "나무",
  fire: "불꽃",
  earth: "흙빛",
  metal: "강철",
  water: "물결",
};

const HAND_TYPE: Record<Temperament, { name: string; emoji: string }> = {
  NT: { name: "검", emoji: "⚔️" },
  NF: { name: "지팡이", emoji: "🪄" },
  SJ: { name: "방패", emoji: "🛡️" },
  SP: { name: "활", emoji: "🏹" },
};

const HEAD_TYPE: Record<Temperament, { name: string; emoji: string }> = {
  NT: { name: "투구", emoji: "⛑️" },
  NF: { name: "화관", emoji: "🌸" },
  SJ: { name: "왕관", emoji: "👑" },
  SP: { name: "두건", emoji: "🧢" },
};

const SHOES: Record<ElementKey, { name: string; emoji: string }> = {
  wood: { name: "짚신", emoji: "🥿" },
  fire: { name: "불꽃 운동화", emoji: "👟" },
  earth: { name: "흙투성이 고무신", emoji: "🩴" },
  metal: { name: "쇠징 워커", emoji: "🥾" },
  water: { name: "파도 샌들", emoji: "👡" },
};

export interface EquipmentItem {
  name: string;
  emoji: string;
}

export function getEquipmentItem(slot: EquipmentSlot, element: ElementKey, temperament: Temperament): EquipmentItem {
  if (slot === "head") {
    const type = HEAD_TYPE[temperament];
    return { name: `${MATERIAL[element]} ${type.name}`, emoji: type.emoji };
  }
  if (slot === "leftHand" || slot === "rightHand") {
    const type = HAND_TYPE[temperament];
    return { name: `${MATERIAL[element]} ${type.name}`, emoji: type.emoji };
  }
  const shoe = SHOES[element];
  return { name: shoe.name, emoji: shoe.emoji };
}

// 이미 영구 배정된 슬롯 집합을 보고 다음으로 비어있는 슬롯을 알려준다.
// 5자리가 다 찼으면 null — 6번째부터는 슬롯 없이 랭킹 리스트에만 남는다.
export function getNextOpenSlot(takenSlots: Iterable<EquipmentSlot>): EquipmentSlot | null {
  const taken = new Set(takenSlots);
  return SLOT_ORDER.find((slot) => !taken.has(slot)) ?? null;
}
