// firebase-admin을 끌어오지 않는 순수 타입 전용 파일 — 클라이언트 컴포넌트에서
// lib/profiles.ts(서버 전용, firebase-admin 의존)를 직접 import하면 번들이 깨지므로
// 타입은 여기서 따로 빼서 공유한다.
export interface ProfileInput {
  label: string;
  birthdate: string;
  birthTime: string;
  gender: "male" | "female";
  mbti: string;
}

export interface ProfileDoc extends ProfileInput {
  id: string;
}
