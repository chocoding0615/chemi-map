import type { ElementKey } from "./elements";
import type { Temperament } from "./temperament";

export type EquipmentSlot = "head" | "leftHand" | "rightHand" | "leftFoot" | "rightFoot";

// 케미 순위 1등이 머리, 2~3등이 양손(무기), 4~5등이 양발(신발)을 차지한다.
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

// 케미 점수순으로 정렬된 목록을 5개 슬롯에 순서대로 배정한다. 6등부터는 슬롯을
// 못 받고 랭킹 리스트에만 남는다 — "장비창"은 상위 5명만 보여주는 전시대다.
export function assignSlots<T>(rankedEntries: T[]): Partial<Record<EquipmentSlot, T>> {
  const result: Partial<Record<EquipmentSlot, T>> = {};
  SLOT_ORDER.forEach((slot, i) => {
    if (rankedEntries[i]) result[slot] = rankedEntries[i];
  });
  return result;
}
