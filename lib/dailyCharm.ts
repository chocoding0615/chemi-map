import { pickVariant } from "./result-engine/elements";
import { CHARMS, getOwnedCharmIds, addCharms, type Rarity } from "./charms";
import { getDailySeedBase } from "./dailyPersonalization";
import { awardForAction } from "./foxRewards";

const STORAGE_KEY = "yeojujeom.dailyCharm.v1";

// 복실이 말투, 단정 예언 금지, 위로/재미 중심 — 최소 20개.
export const DAILY_MESSAGES: string[] = [
  "오늘은 작은 친절이 큰 인연으로 돌아올 것 같아요.",
  "서두르지 않아도 돼요. 오늘의 너는 이미 충분히 잘하고 있어요.",
  "마음에 걸리던 일, 오늘 용기 내서 한 걸음만 떼어봐요.",
  "예상 못 한 곳에서 반가운 소식이 올 수 있어요. 기대해도 좋아요.",
  "오늘은 지갑을 조금 단단히 잠가두는 게 좋겠어요.",
  "누군가의 말에 흔들리지 말아요. 네 판단을 믿어도 되는 날이에요.",
  "따뜻한 차 한 잔이 오늘의 너를 지켜줄 거예요.",
  "미뤄둔 연락, 오늘 하면 마음이 한결 가벼워질 거예요.",
  "오늘은 듣는 게 이득이에요. 말은 아껴두면 복이 돼요.",
  "작은 정리정돈이 뜻밖의 운을 불러올 수 있어요.",
  "오늘 만나는 사람 중에 귀인이 숨어 있을지 몰라요.",
  "조급함은 잠시 내려두고, 오늘은 흐름에 몸을 맡겨봐요.",
  "네가 웃으면 오늘 하루가 통째로 밝아질 거예요.",
  "복실이가 보기엔, 오늘 네 직감이 유난히 잘 맞을 것 같아요.",
  "오늘은 새로운 걸 시작하기 좋은 기운이 흘러요.",
  "지친 마음엔 휴식도 훌륭한 선택이에요. 무리하지 말아요.",
  "오늘 받은 작은 호의, 잊지 말고 기억해두면 좋겠어요.",
  "잠깐의 산책이 막힌 생각을 풀어줄 거예요.",
  "오늘은 고집을 조금 접으면 일이 훨씬 수월해져요.",
  "복실이가 꼬리로 살짝 행운을 밀어줄게요. 좋은 하루 보내요!",
  "돈보다 사람을 챙기면 더 큰 게 돌아오는 날이에요.",
  "오늘의 실수는 크게 걱정 말아요. 금방 만회할 수 있어요.",
];

const RARITY_WEIGHT: { rarity: Rarity; upTo: number }[] = [
  { rarity: "common", upTo: 70 },
  { rarity: "rare", upTo: 95 },
  { rarity: "epic", upTo: 100 },
];

interface DailyCharmState {
  version: 1;
  lastDrawDate: string | null;
  lastResult: { charmId: string; message: string; drawnAt: string } | null;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function readState(): DailyCharmState {
  const empty: DailyCharmState = { version: 1, lastDrawDate: null, lastResult: null };
  if (!isBrowser()) return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return empty;
    return { ...empty, ...parsed };
  } catch {
    console.warn("[여우점] 오늘의 부적 기록이 손상돼 초기화합니다.");
    return empty;
  }
}

function saveState(state: DailyCharmState): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getTodayDrawResult(): { charmId: string; message: string } | null {
  const state = readState();
  if (state.lastDrawDate !== todayISO() || !state.lastResult) return null;
  return { charmId: state.lastResult.charmId, message: state.lastResult.message };
}

// seed 하나로 희귀도 → 그 희귀도 안에서의 부적 → 오늘의 메시지까지 전부 결정된다.
// 같은 사람(생일 또는 익명 id)이 같은 날 다시 계산해도 항상 같은 결과가 나온다.
function computeDraw(seedBase: string, dateISO: string): { charmId: string; message: string } {
  const seed = `${seedBase}-${dateISO}`;
  const roll = pickVariant(`${seed}-rarity`, 100);
  const rarity = RARITY_WEIGHT.find((r) => roll < r.upTo)?.rarity ?? "common";
  const pool = CHARMS.filter((c) => c.rarity === rarity);
  const charm = pool[pickVariant(`${seed}-charm`, pool.length)];
  const message = DAILY_MESSAGES[pickVariant(`${seed}-message`, DAILY_MESSAGES.length)];
  return { charmId: charm.id, message };
}

export interface DrawTodayCharmResult {
  charmId: string;
  message: string;
  isNewCharm: boolean;
}

// 오늘 이미 뽑았으면 저장된 결과를 그대로 돌려준다(연출 안정 + 재계산으로 인한
// exp/부적 중복 적립 방지). 하루 중 처음 뽑는 거라면 새로 계산해서 저장한다.
export function drawTodayCharm(): DrawTodayCharmResult {
  const dateISO = todayISO();
  const existing = readState();

  if (existing.lastDrawDate === dateISO && existing.lastResult) {
    const owned = getOwnedCharmIds();
    return { ...existing.lastResult, isNewCharm: !owned.includes(existing.lastResult.charmId) };
  }

  const { charmId, message } = computeDraw(getDailySeedBase(), dateISO);
  const ownedBefore = getOwnedCharmIds();
  const isNewCharm = !ownedBefore.includes(charmId);

  addCharms([charmId]);
  saveState({ version: 1, lastDrawDate: dateISO, lastResult: { charmId, message, drawnAt: new Date().toISOString() } });
  awardForAction("daily"); // 오늘의 기운과 같은 "출석" 하나로 통합 — 먼저 한 쪽이 이미 적립했으면 자동으로 무시된다.

  return { charmId, message, isNewCharm };
}
