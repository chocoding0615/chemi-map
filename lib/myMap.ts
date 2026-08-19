// 내가 만든 인연 매칭 지도의 slug를 이 브라우저에만 기억해둔다(로그인 없이 "내 지도 보기"
// 진입점을 만들기 위한 최소한의 편의 저장 — 서버에는 아무것도 추가로 저장하지 않는다).
const STORAGE_KEY = "yeojujeom.myMapSlug";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getMyMapSlug(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setMyMapSlug(slug: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, slug);
}
