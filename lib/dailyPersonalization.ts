// "오늘의 기운"과 "오늘의 부적 뽑기"가 개인화에 같은 생일 값을 공유하도록 한 곳에 모아둔다.
const BIRTHDATE_KEY = "yeojujeom.today.birthdate";
const ANON_ID_KEY = "yeojujeom.anonId";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredBirthdate(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(BIRTHDATE_KEY);
}

export function setStoredBirthdate(value: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(BIRTHDATE_KEY, value);
}

export function clearStoredBirthdate(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(BIRTHDATE_KEY);
}

// 생일을 저장 안 한 손님도 매일 결정론적인 결과를 볼 수 있도록, 최초 방문 시
// 이 브라우저만의 익명 id를 하나 만들어 둔다(서버로 전송되지 않음).
export function getOrCreateAnonId(): string {
  if (!isBrowser()) return "anon";
  let id = window.localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

export function getDailySeedBase(): string {
  return getStoredBirthdate() ?? getOrCreateAnonId();
}
