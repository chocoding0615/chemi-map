import type { ElementKey } from "./elements";
import type { Temperament } from "./temperament";

export type EquipmentSlot = "head" | "leftHand" | "rightHand" | "leftFoot" | "rightFoot";

export const SLOT_ORDER: EquipmentSlot[] = ["head", "leftHand", "rightHand", "leftFoot", "rightFoot"];

export const SLOT_LABEL: Record<EquipmentSlot, string> = {
  head: "머리",
  leftHand: "왼손",
  rightHand: "오른손",
  leftFoot: "왼발",
  rightFoot: "오른발",
};

// 동네 지도 때와 같은 원칙: 오행이 자리(슬롯)를 고정으로 나눈다. 방문자의 오행은
// 생일로 정해지는 값이라 바뀔 일이 없으므로, 이 매핑만으로 슬롯이 영구 고정된다
// — 나중에 누가 오든 이미 있는 사람 자리가 바뀌지 않는다(따로 저장할 필요도 없다).
export const SLOT_ELEMENT: Record<EquipmentSlot, ElementKey> = {
  head: "wood",
  rightHand: "water",
  rightFoot: "earth",
  leftFoot: "fire",
  leftHand: "metal",
};

// MBTI 기질(NT/NF/SJ/SP)이 그 슬롯 안에서의 아이템 종류를 정한다. 슬롯마다 오행이
// 이미 고정이라 소재를 또 넣으면 같은 슬롯 안에서는 항상 같은 소재라 의미가
// 없어서, 슬롯별로 서로 다른 아이템 이름 세트를 4개씩 마련해 다양성을 준다.
const ITEM_NAME: Record<EquipmentSlot, Record<Temperament, string>> = {
  head: { NT: "투구", NF: "화관", SJ: "왕관", SP: "두건" },
  rightHand: { NT: "작살", NF: "산호 지팡이", SJ: "방패", SP: "삼지창" },
  leftHand: { NT: "쇠검", NF: "종", SJ: "도끼", SP: "쇠사슬" },
  leftFoot: { NT: "전투화", NF: "발레 슈즈", SJ: "부츠", SP: "러닝화" },
  rightFoot: { NT: "등산화", NF: "버선", SJ: "워커", SP: "샌들" },
};

const SLOT_EMOJI: Record<EquipmentSlot, Record<Temperament, string>> = {
  head: { NT: "⛑️", NF: "🌸", SJ: "👑", SP: "🧢" },
  rightHand: { NT: "🔱", NF: "🪸", SJ: "🛡️", SP: "🔱" },
  leftHand: { NT: "🗡️", NF: "🔔", SJ: "🪓", SP: "⛓️" },
  leftFoot: { NT: "👢", NF: "🩰", SJ: "🥾", SP: "👟" },
  rightFoot: { NT: "🥾", NF: "🧦", SJ: "🥾", SP: "👡" },
};

export interface EquipmentItem {
  name: string;
  emoji: string;
}

export function getEquipmentItem(slot: EquipmentSlot, temperament: Temperament): EquipmentItem {
  return { name: ITEM_NAME[slot][temperament], emoji: SLOT_EMOJI[slot][temperament] };
}
