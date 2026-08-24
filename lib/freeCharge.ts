// 클라이언트 컴포넌트에서 쓰는 무료 충전 호출. 실제 결제 연동 전까지 잔디 부족
// 화면들이 페이지 이동 없이 그 자리에서 충전을 시도할 수 있게 공통으로 뺐다.
export async function chargeFreeWallet(tierId?: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("/api/user/charge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tierId ? { tierId } : {}),
  });
  if (res.status === 429) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error || "무료 충전은 24시간에 한 번만 가능해요." };
  }
  if (!res.ok) return { ok: false, error: "충전에 실패했어요. 다시 시도해주세요." };
  return { ok: true };
}
