// 지금은 결제 없이 모든 운세를 볼 수 있게 하는 임시 스위치.
// 나중에 실제(모의) 결제 흐름을 다시 걸고 싶으면 배포 환경에 NEXT_PUBLIC_FREE_PREVIEW=false를
// 설정하면 된다 — MockPayGate를 쓰는 모든 화면이 자동으로 다시 잠금 상태로 돌아간다.
// 값을 지정하지 않으면 지금까지와 동일하게 기본 true(전체 무료)로 동작한다.
// 클라이언트 번들에 그대로 박히는 값이라 NEXT_PUBLIC_ 접두사가 필요하다.
export const FORTUNE_FREE_PREVIEW = process.env.NEXT_PUBLIC_FREE_PREVIEW !== "false";
