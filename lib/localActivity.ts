// 로그인/계정 없이 이 브라우저에만 저장되는 마이페이지 활동 기록 + 질문권 잔액.
// 서버로 전송되지 않고, 다른 기기·브라우저에서는 보이지 않는다(의도된 단순화).

export interface ActivityEntry {
  id: string;
  category: string;
  title: string;
  priceKrw: number;
  unlockedAt: string;
}

const ACTIVITY_KEY = "yeojujeom.activity.v1";
const CASH_KEY = "yeojujeom.cash.v1";
const MAX_ACTIVITY = 50;

function isBrowser() {
  return typeof window !== "undefined";
}

export function getActivity(): ActivityEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(ACTIVITY_KEY);
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : [];
  } catch {
    return [];
  }
}

export function addActivity(entry: { category: string; title: string; priceKrw: number }): void {
  if (!isBrowser()) return;
  const list = getActivity();
  list.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    unlockedAt: new Date().toISOString(),
    ...entry,
  });
  window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(list.slice(0, MAX_ACTIVITY)));
}

export function getCashBalance(): number {
  if (!isBrowser()) return 0;
  const raw = window.localStorage.getItem(CASH_KEY);
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function addCash(amount: number): number {
  if (!isBrowser()) return 0;
  const next = getCashBalance() + amount;
  window.localStorage.setItem(CASH_KEY, String(next));
  return next;
}
