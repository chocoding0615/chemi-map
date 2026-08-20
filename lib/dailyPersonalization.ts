// "오늘의 기운"·"오늘의 부적 뽑기"·"오늘의 운세 점수"가 전부 이 하나의 저장된
// 생일을 공유한다 — 화면마다 따로 값을 들고 있으면 결과가 어긋나기 쉬우니
// 항상 이 모듈을 통해서만 읽고 쓴다.
import { notifyBirthdateChanged } from "./notify";

const BIRTHDATE_KEY = "yeojujeom.today.birthdate";
const NAME_KEY = "yeojujeom.today.name";
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
  notifyBirthdateChanged();
}

export function clearStoredBirthdate(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(BIRTHDATE_KEY);
  notifyBirthdateChanged();
}

export function getStoredName(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(NAME_KEY);
}

export function setStoredName(value: string): void {
  if (!isBrowser()) return;
  if (value) window.localStorage.setItem(NAME_KEY, value);
  else window.localStorage.removeItem(NAME_KEY);
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
