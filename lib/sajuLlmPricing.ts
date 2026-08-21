// 클라이언트 컴포넌트에서도 안전하게 import할 수 있는 순수 상수 전용 파일.
// firebase-admin을 쓰는 lib/sajuLlmReport.ts와 분리해둔 이유: 클라이언트 컴포넌트가
// 가격 상수 하나만 쓰려고 import해도, 같은 파일에 있으면 firebase-admin(grpc 등)까지
// 브라우저 번들에 끌려 들어가 빌드가 깨진다.
export const SAJU_LLM_REPORT_PRICE_KRW = 20;
export const SAJU_LLM_CHAT_FREE_QUESTIONS = 5;
export const SAJU_LLM_CHAT_PRICE_KRW = 2;
