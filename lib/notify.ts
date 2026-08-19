// 페이지 간 전역 상태 없이(별도 context/provider 없이) 진행도 변경과 토스트 메시지를
// 알리는 초경량 이벤트 버스. window CustomEvent만 쓰므로 서버에서는 전부 no-op.

export type ToastKind = "normal" | "milestone";
export interface ToastPayload {
  kind: ToastKind;
  text: string;
}

const TOAST_EVENT = "yeojujeom:toast";
const PROGRESS_EVENT = "yeojujeom:progress-changed";
const NINE_TAIL_EVENT = "yeojujeom:nine-tail";

function isBrowser() {
  return typeof window !== "undefined";
}

export function notify(payload: ToastPayload): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }));
}

export function onToast(handler: (payload: ToastPayload) => void): () => void {
  if (!isBrowser()) return () => {};
  const listener = (e: Event) => handler((e as CustomEvent<ToastPayload>).detail);
  window.addEventListener(TOAST_EVENT, listener);
  return () => window.removeEventListener(TOAST_EVENT, listener);
}

export function notifyProgressChanged(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

export function onProgressChanged(handler: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(PROGRESS_EVENT, handler);
  return () => window.removeEventListener(PROGRESS_EVENT, handler);
}

export function notifyNineTail(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(NINE_TAIL_EVENT));
}

export function onNineTail(handler: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(NINE_TAIL_EVENT, handler);
  return () => window.removeEventListener(NINE_TAIL_EVENT, handler);
}
