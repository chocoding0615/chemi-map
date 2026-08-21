// 로그인된 경우에만 서버(Firestore)에 활동 기록을 남긴다. 비로그인이면 서버가
// 조용히 204로 무시하므로, 여기서도 실패를 신경 쓰지 않고 그냥 fire-and-forget.
export function recordActivity(entry: { category: string; title: string; priceKrw: number }): void {
  fetch("/api/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  }).catch(() => {});
}
