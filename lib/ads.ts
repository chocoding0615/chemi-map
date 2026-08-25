// 실제 광고 SDK 연동 전 자리표시자. 나중에 리워드 광고 SDK를 붙일 때 이 함수
// 내부만 실제 SDK 호출로 바꾸면 된다(시청 완료 콜백에서 resolve, 중도 이탈/실패는 reject).
export async function watchRewardedAd(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
}
