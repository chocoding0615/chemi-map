import { notifyProgressChanged } from "./notify";

// 꼬리 성장(경험치) 시스템 — 로그인 없이 이 브라우저에만 저장된다.
// localStorage뿐이라 손상되거나 스키마가 바뀌어도 깨지지 않도록 항상
// version 체크 후 파싱 실패 시 빈 진행도로 안전하게 초기화한다.

export type ActionId = "saju" | "foxtype" | "connections" | "daily" | "share";
export type FortuneSeenId = "saju" | "love" | "career" | "compat";

export interface FoxProgress {
  version: 1;
  tails: number;
  exp: number;
  lastDailyDate: string | null;
  dailyStreak: number;
  unlockedActions: ActionId[];
  connectionsCount: number;
  seenFortunes: FortuneSeenId[];
  updatedAt: string;
}

const STORAGE_KEY = "yeojujeom.progress.v1";

// index = 꼬리 수. TAIL_THRESHOLDS[n] = n번째 꼬리를 얻는 데 필요한 누적 exp.
export const TAIL_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250];

const ONE_TIME_EXP: Partial<Record<ActionId, number>> = {
  saju: 30,
  foxtype: 20,
  connections: 20,
  share: 15,
};
const DAILY_EXP = 10;

function isBrowser() {
  return typeof window !== "undefined";
}

function emptyProgress(): FoxProgress {
  return {
    version: 1,
    tails: 0,
    exp: 0,
    lastDailyDate: null,
    dailyStreak: 0,
    unlockedActions: [],
    connectionsCount: 0,
    seenFortunes: [],
    updatedAt: new Date().toISOString(),
  };
}

export function getProgress(): FoxProgress {
  if (!isBrowser()) return emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return emptyProgress();
    return { ...emptyProgress(), ...parsed };
  } catch {
    console.warn("[여우점] 진행도 데이터가 손상돼 초기화합니다.");
    return emptyProgress();
  }
}

function saveProgress(progress: FoxProgress): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  notifyProgressChanged();
}

function tailsFromExp(exp: number): number {
  let tails = 0;
  for (let i = TAIL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (exp >= TAIL_THRESHOLDS[i]) {
      tails = i;
      break;
    }
  }
  return Math.min(9, tails);
}

export interface AddExpResult {
  progress: FoxProgress;
  expGained: number;
  tailsBefore: number;
  tailsAfter: number;
}

export function addExp(action: ActionId): AddExpResult {
  const progress = getProgress();
  const tailsBefore = progress.tails;
  let gained = 0;

  if (action === "daily") {
    const today = new Date().toISOString().slice(0, 10);
    if (progress.lastDailyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      progress.dailyStreak = progress.lastDailyDate === yesterday ? progress.dailyStreak + 1 : 1;
      progress.lastDailyDate = today;
      gained = DAILY_EXP;
    }
  } else {
    const expForAction = ONE_TIME_EXP[action] ?? 0;
    if (expForAction > 0 && !progress.unlockedActions.includes(action)) {
      progress.unlockedActions = [...progress.unlockedActions, action];
      gained = expForAction;
    }
  }

  if (action === "connections") progress.connectionsCount += 1;

  progress.exp += gained;
  progress.tails = tailsFromExp(progress.exp);
  progress.updatedAt = new Date().toISOString();
  saveProgress(progress);

  return { progress, expGained: gained, tailsBefore, tailsAfter: progress.tails };
}

export function recordFortuneSeen(id: FortuneSeenId): FoxProgress {
  const progress = getProgress();
  if (!progress.seenFortunes.includes(id)) {
    progress.seenFortunes = [...progress.seenFortunes, id];
    progress.updatedAt = new Date().toISOString();
    saveProgress(progress);
  }
  return progress;
}
