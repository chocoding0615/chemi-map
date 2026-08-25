import { notifyProgressChanged } from "./notify";

// 꼬리 성장(경험치) 시스템 — 로그인 없이 이 브라우저에만 저장된다.
// localStorage뿐이라 손상되거나 스키마가 바뀌어도 깨지지 않도록 항상
// version 체크 후 파싱 실패 시 빈 진행도로 안전하게 초기화한다.

export type ActionId = "saju" | "foxtype" | "connections" | "daily" | "share" | "letter" | "celebmatch";
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
  letter: 20,
  celebmatch: 20,
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

export interface TailState {
  tails: number;
  pct: number; // 현재 꼬리 구간 안에서 진행된 비율(0~100), 게이지바 width에 그대로 쓴다
  remain: number; // 다음 꼬리까지 남은 exp
  isMax: boolean;
}

// 꼬리 수·게이지 채움 비율·"남은 exp" 텍스트가 서로 어긋나지 않도록 이 함수
// 하나에서만 파생시킨다 — 위젯이든 다른 화면이든 exp 값을 직접 재계산하지 말 것.
export function deriveTailState(exp: number): TailState {
  let tails = 0;
  for (let i = 0; i < TAIL_THRESHOLDS.length; i++) {
    if (exp >= TAIL_THRESHOLDS[i]) tails = i;
    else break;
  }
  tails = Math.min(tails, 9);

  if (tails >= 9) {
    return { tails: 9, pct: 100, remain: 0, isMax: true };
  }
  const cur = TAIL_THRESHOLDS[tails];
  const next = TAIL_THRESHOLDS[tails + 1];
  const gained = exp - cur;
  const need = next - cur;
  const pct = Math.max(0, Math.min(100, Math.round((gained / need) * 100)));
  const remain = Math.max(0, next - exp);
  return { tails, pct, remain, isMax: false };
}

function tailsFromExp(exp: number): number {
  return deriveTailState(exp).tails;
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
