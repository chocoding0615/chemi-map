import { notifyProgressChanged } from "./notify";
import type { FoxProgress } from "./progress";

export type Rarity = "common" | "rare" | "epic";

export interface Charm {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  desc: string; // 복실이 말투 설명
  howTo: string; // 획득 조건 안내(미획득 상태에서 보여줌)
}

const STORAGE_KEY = "yeojujeom.charms.v1";

export const CHARMS: Charm[] = [
  {
    id: "sprout-charm",
    name: "새싹 부적",
    emoji: "🌱",
    rarity: "common",
    desc: "이제 막 여정을 시작한 너에게 주는 첫 부적이야. 작지만 쑥쑥 자랄 거예요.",
    howTo: "여우상 진단을 한 번 받으면 얻어요.",
  },
  {
    id: "first-tail",
    name: "첫 꼬리 술",
    emoji: "🦊",
    rarity: "common",
    desc: "복실이 첫 번째 꼬리에서 살짝 떼어준 털뭉치예요. 몰래 준 거니까 비밀이에요.",
    howTo: "사주 풀이를 처음 보면 얻어요.",
  },
  {
    id: "silver-bell",
    name: "은빛 방울",
    emoji: "🔔",
    rarity: "common",
    desc: "복실이 목걸이에 달린 방울과 똑같은 거예요. 흔들면 나쁜 기운이 도망간대요.",
    howTo: "오늘의 기운을 처음 확인하면 얻어요.",
  },
  {
    id: "pocket-pouch",
    name: "미니 부적 주머니",
    emoji: "👝",
    rarity: "common",
    desc: "자잘한 행운을 담아두는 주머니예요. 안에 뭐가 들었는지는 복실이도 몰라요.",
    howTo: "인연 지도를 처음 만들면 얻어요.",
  },
  {
    id: "dawn-dew",
    name: "새벽 이슬 부적",
    emoji: "💧",
    rarity: "rare",
    desc: "해 뜨기 전 잎사귀에 맺힌 이슬로 만든 부적이야. 꾸준한 사람만 받을 수 있어요.",
    howTo: "오늘의 기운을 3일 연속 확인하면 얻어요.",
  },
  {
    id: "twin-bell",
    name: "쌍둥이 방울",
    emoji: "🎐",
    rarity: "rare",
    desc: "두 방울이 같은 소리로 울리면 인연이래요. 궁합을 본 너에게만 주는 거예요.",
    howTo: "궁합을 한 번 조회하면 얻어요.",
  },
  {
    id: "lucky-clover",
    name: "네잎 여우풀",
    emoji: "🍀",
    rarity: "rare",
    desc: "복실이가 산책하다 우연히 찾은 행운의 풀이에요. 너한테 나눠줄게요.",
    howTo: "사주 조회 시 낮은 확률로 나타나요.",
  },
  {
    id: "red-string",
    name: "붉은 실타래",
    emoji: "🧵",
    rarity: "rare",
    desc: "이어질 사람과 새끼손가락을 몰래 묶어두는 실이에요. 살짝 당기면 인연이 다가와요.",
    howTo: "인연 지도를 3개 이상 만들면 얻어요.",
  },
  {
    id: "moon-mirror",
    name: "달빛 거울",
    emoji: "🪞",
    rarity: "epic",
    desc: "보름달을 비추면 진짜 마음이 보인대요. 복실이도 가끔 여기 대고 표정 연습해요.",
    howTo: "꼬리를 5개 모으면 얻어요.",
  },
  {
    id: "fox-fire",
    name: "여우불",
    emoji: "🔥",
    rarity: "epic",
    desc: "길 잃은 사람 앞을 밝혀주는 파란 불꽃이에요. 이제 너는 길을 잃지 않을 거예요.",
    howTo: "사주·애정운·직업운·궁합을 한 번씩 보면 얻어요.",
  },
  {
    id: "jade-seal",
    name: "옥빛 도장",
    emoji: "🟢",
    rarity: "epic",
    desc: "오래 산 여우만 새길 수 있는 도장이야. 여기 찍힌 운은 쉽게 바뀌지 않는대요.",
    howTo: "여우상 카드를 저장하거나 공유하면 얻어요.",
  },
  {
    id: "nine-tail-seal",
    name: "아홉 꼬리 인장",
    emoji: "✨",
    rarity: "epic",
    desc: "복실이가 진짜 구미호가 된 증표예요. 이걸 가진 사람은 손에 꼽는대요. 축하해요!",
    howTo: "꼬리를 9개 모두 모으면 얻어요.",
  },
];

const CHARM_BY_ID = new Map(CHARMS.map((c) => [c.id, c]));

export function getCharmById(id: string): Charm | undefined {
  return CHARM_BY_ID.get(id);
}

function isBrowser() {
  return typeof window !== "undefined";
}

interface CharmInventory {
  version: 1;
  ownedIds: string[];
  acquiredAt: Record<string, string>;
  updatedAt: string;
}

function readInventory(): CharmInventory {
  const empty: CharmInventory = { version: 1, ownedIds: [], acquiredAt: {}, updatedAt: new Date().toISOString() };
  if (!isBrowser()) return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !Array.isArray(parsed.ownedIds)) return empty;
    return { ...empty, ...parsed, acquiredAt: parsed.acquiredAt ?? {} };
  } catch {
    console.warn("[여우점] 부적함 데이터가 손상돼 초기화합니다.");
    return empty;
  }
}

export function getOwnedCharmIds(): string[] {
  return readInventory().ownedIds;
}

export function getCharmAcquiredAt(id: string): string | undefined {
  return readInventory().acquiredAt[id];
}

export function addCharms(ids: string[]): void {
  if (!isBrowser() || ids.length === 0) return;
  const inventory = readInventory();
  const owned = new Set(inventory.ownedIds);
  const now = new Date().toISOString();
  for (const id of ids) {
    owned.add(id);
    if (!inventory.acquiredAt[id]) inventory.acquiredAt[id] = now;
  }
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 1, ownedIds: [...owned], acquiredAt: inventory.acquiredAt, updatedAt: now })
  );
  notifyProgressChanged();
}

export interface EvaluateCharmContext {
  action: string;
  progress: FoxProgress;
  ownedIds: string[];
  stats: {
    dailyStreak: number;
    connectionsCount: number;
    seenFortunes: string[];
  };
}

// 각 액션 발생 시 조건을 검사해 새로 얻을 부적 id 배열을 반환한다.
// action으로 게이팅되는 것도 있고(예: sprout-charm), progress/stats 값만으로
// 게이팅되는 것도 있어서(예: moon-mirror), 매 액션 후 전체를 재평가한다.
export function evaluateCharmDrops(ctx: EvaluateCharmContext): string[] {
  const drops: string[] = [];
  const has = (id: string) => ctx.ownedIds.includes(id) || drops.includes(id);

  if (ctx.action === "foxtype" && !has("sprout-charm")) drops.push("sprout-charm");
  if (ctx.action === "saju" && !has("first-tail")) drops.push("first-tail");
  if (ctx.action === "daily" && !has("silver-bell")) drops.push("silver-bell");
  if (ctx.action === "connections" && !has("pocket-pouch")) drops.push("pocket-pouch");
  if (ctx.stats.dailyStreak >= 3 && !has("dawn-dew")) drops.push("dawn-dew");
  if (ctx.action === "compat" && !has("twin-bell")) drops.push("twin-bell");
  if (ctx.stats.connectionsCount >= 3 && !has("red-string")) drops.push("red-string");
  if (ctx.progress.tails >= 5 && !has("moon-mirror")) drops.push("moon-mirror");
  if (
    ["saju", "love", "career", "compat"].every((f) => ctx.stats.seenFortunes.includes(f)) &&
    !has("fox-fire")
  ) {
    drops.push("fox-fire");
  }
  if (ctx.action === "share" && !has("jade-seal")) drops.push("jade-seal");
  if (ctx.progress.tails >= 9 && !has("nine-tail-seal")) drops.push("nine-tail-seal");
  if (ctx.action === "saju" && !has("lucky-clover") && Math.random() < 0.2) drops.push("lucky-clover");

  return drops;
}
