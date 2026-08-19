export type VillageItemType = "house" | "tree" | "fox" | "shrine" | "lantern";

export interface VillageItem {
  id: string;
  type: VillageItemType;
  label: string;
  emoji: string;
  x: number; // 마을 뷰 안에서의 좌표(%), 0~100
  y: number;
}

// TODO: 지금은 배치 좌표만 정한 목업 배열이다. 실제로는 각 요소의 unlock 조건
// (꼬리 수·모은 부적 종류·놀러온 손님 여우 수 등)을 여기 같이 정의해서
// components/FoxVillage.tsx가 progress/charms 상태로 자동 판정하게 될 예정.
export const VILLAGE_ITEMS: VillageItem[] = [
  { id: "my-house", type: "house", label: "내 오두막", emoji: "🏠", x: 50, y: 55 },
  { id: "tree-1", type: "tree", label: "첫 나무", emoji: "🌳", x: 25, y: 40 },
  { id: "tree-2", type: "tree", label: "작은 나무", emoji: "🌲", x: 75, y: 35 },
  { id: "lantern-1", type: "lantern", label: "길잡이 등불", emoji: "🏮", x: 40, y: 70 },
  { id: "lantern-2", type: "lantern", label: "골목 등불", emoji: "🏮", x: 62, y: 72 },
  { id: "shrine-1", type: "shrine", label: "작은 사당", emoji: "⛩️", x: 15, y: 65 },
  { id: "fox-1", type: "fox", label: "손님 여우", emoji: "🦊", x: 30, y: 22 },
  { id: "fox-2", type: "fox", label: "손님 여우", emoji: "🦊", x: 68, y: 20 },
  { id: "fox-3", type: "fox", label: "손님 여우", emoji: "🦊", x: 82, y: 55 },
  { id: "tree-3", type: "tree", label: "울창한 나무", emoji: "🌳", x: 10, y: 30 },
  { id: "tree-4", type: "tree", label: "단풍나무", emoji: "🍁", x: 90, y: 42 },
  { id: "shrine-2", type: "shrine", label: "돌탑", emoji: "🗿", x: 55, y: 18 },
  { id: "lantern-3", type: "lantern", label: "다리 등불", emoji: "🏮", x: 20, y: 78 },
  { id: "fox-4", type: "fox", label: "손님 여우", emoji: "🦊", x: 45, y: 85 },
  { id: "fox-5", type: "fox", label: "손님 여우", emoji: "🦊", x: 8, y: 55 },
  { id: "tree-5", type: "tree", label: "꽃나무", emoji: "🌸", x: 60, y: 88 },
  { id: "shrine-3", type: "shrine", label: "복실이 동상", emoji: "🗽", x: 85, y: 78 },
  { id: "lantern-4", type: "lantern", label: "정원 등불", emoji: "🏮", x: 35, y: 15 },
  { id: "tree-6", type: "tree", label: "대나무", emoji: "🎋", x: 92, y: 68 },
  { id: "fox-6", type: "fox", label: "손님 여우", emoji: "🦊", x: 5, y: 82 },
];
