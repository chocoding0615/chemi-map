// /saju, /fox-type, /fortune/[category] 같은 페이지는 "입력→결과"가 라우트 이동이
// 아니라 로컬 state 전환이라 router.back()이 먹히지 않는다. 결과가 떠 있는 동안
// 페이지가 이 핸들러를 등록해두면, 헤더의 뒤로 버튼이 실제 브라우저 이동 대신
// 이걸 먼저 소비해서 "결과 → 입력 화면"으로 자연스럽게 돌아가게 한다.
type BackHandler = () => void;

let handler: BackHandler | null = null;

export function registerBackHandler(fn: BackHandler): () => void {
  handler = fn;
  return () => {
    if (handler === fn) handler = null;
  };
}

export function tryConsumeBackHandler(): boolean {
  if (handler) {
    handler();
    return true;
  }
  return false;
}
