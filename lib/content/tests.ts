// 바이럴 심리테스트 프레임워크 - K-test 스타일.
// 새 테스트를 추가할 때는 TESTS에 데이터만 넣으면 된다(퀴즈 UI·결과 페이지·공유 카드·통계 공용).
// 채점 방식: 각 문항 선택지가 1~4점, 합산 점수를 결과 유형의 점수 구간(minScore~maxScore)에 대응시킨다.

export type TestTheme = "ice" | "wave" | "fire" | "burst";

export interface TestOption {
  text: string;
  score: number;
}

export interface TestQuestion {
  q: string;
  options: TestOption[];
}

export interface TestResultType {
  id: string;
  emoji: string;
  name: string;
  /** 공유 카드에 크게 들어가는 한 줄 후크 */
  tagline: string;
  minScore: number;
  maxScore: number;
  description: string[];
  foxComment: string;
  keywords: string[];
  theme: TestTheme;
}

export interface TestDef {
  slug: string;
  emoji: string;
  title: string;
  subtitle: string;
  questions: TestQuestion[];
  /** minScore 오름차순으로 정렬해 둘 것 */
  results: TestResultType[];
}

const GWAMOIP_QUESTIONS: TestQuestion[] = [
  {
    q: "새로 좋아하는 게 생겼다. 사람이든 콘텐츠든.",
    options: [
      { text: "검색은 최소한으로. 자연스럽게 흘러가게 둔다", score: 1 },
      { text: "정보를 좀 찾아보지만 금방 멈춘다", score: 2 },
      { text: "관련된 걸 다 파고들어 밤새 정리한다", score: 3 },
      { text: "이미 팬카페 가입 완료. 굿즈까지 알아본다", score: 4 },
    ],
  },
  {
    q: "노래 한 곡이 좋으면 나는?",
    options: [
      { text: "플레이리스트에 넣고 가끔 듣는다", score: 1 },
      { text: "일주일 정도 반복재생한다", score: 2 },
      { text: "그 가수 디스코그래피를 전부 듣는다", score: 3 },
      { text: "벨소리, 알람, 운동화까지 그 노래로 맞춘다", score: 4 },
    ],
  },
  {
    q: "드라마나 웹툰 정주행 중인 내 휴대폰 스크린타임은?",
    options: [
      { text: "하루 30분이면 충분하다", score: 1 },
      { text: "출퇴근길에만 조금 본다", score: 2 },
      { text: "\"이거 하나만 더...\"가 새벽 2시다", score: 3 },
      { text: "다음 회차 예측 분석글을 쓰고 있다", score: 4 },
    ],
  },
  {
    q: "친구가 \"요즘 빠진 거 있어?\"라고 물으면?",
    options: [
      { text: "\"딱히? 그냥 평범하게 살아\"", score: 1 },
      { text: "\"아 이거 좀 재밌어\" 하고 가볍게 소개한다", score: 2 },
      { text: "설명이 길어진다. 매우 길어진다", score: 3 },
      { text: "본격 입문 전에 \"오래 걸릴 수 있는데 괜찮아?\"부터 묻는다", score: 4 },
    ],
  },
  {
    q: "취미를 시작할 때 나는?",
    options: [
      { text: "집에 있는 도구로 일단 시작한다", score: 1 },
      { text: "입문용 장비 하나쯤은 산다", score: 2 },
      { text: "유튜브 강의를 시리즈로 정주행한다", score: 3 },
      { text: "초보인데 프로 장비부터 갖춘다", score: 4 },
    ],
  },
  {
    q: "관심 있는 사람과 채팅 중 답장이 안 오면?",
    options: [
      { text: "내 할 일 한다", score: 1 },
      { text: "가끔 확인하지만 기다려준다", score: 2 },
      { text: "알림음에 반응속도 0.1초", score: 3 },
      { text: "답장 패턴을 데이터처럼 분석 중이다", score: 4 },
    ],
  },
  {
    q: "내 취향에 대한 주변 사람들의 반응은?",
    options: [
      { text: "\"너 그런 거 좋아했어?\"", score: 1 },
      { text: "\"언제 또 바꿀지 궁금하다\"", score: 2 },
      { text: "\"너는 말하면 끝이 없더라\"", score: 3 },
      { text: "\"그 얘기는 이제 그만하자...\"", score: 4 },
    ],
  },
  {
    q: "관심사가 생활비에 미치는 영향은?",
    options: [
      { text: "추가 지출 없음", score: 1 },
      { text: "월 몇 만 원 정도", score: 2 },
      { text: "후회는 하지만 결제는 한다", score: 3 },
      { text: "모르던 저축통장이 관심사 통장이 됐다", score: 4 },
    ],
  },
  {
    q: "새벽 감성에 취했을 때 나는?",
    options: [
      { text: "그냥 잔다", score: 1 },
      { text: "감성 플레이리스트 튼다", score: 2 },
      { text: "추억을 주제별로 정리하며 새벽을 새운다", score: 3 },
      { text: "그 감성을 담아 장문의 글을 SNS에 올린다", score: 4 },
    ],
  },
  {
    q: "관심사와 헤어지게 되면(탈덕, 취미 접기) 나는?",
    options: [
      { text: "쿨하게 넘어간다. 다음 관심사!", score: 1 },
      { text: "한동안 허전하지만 괜찮다", score: 2 },
      { text: "비워지는 느낌이 한참 간다", score: 3 },
      { text: "아직도 그 시절 얘기를 한다", score: 4 },
    ],
  },
  {
    q: "사람들이 나를 한마디로 표현한다면?",
    options: [
      { text: "\"적당한 게 최고야\"", score: 1 },
      { text: "\"취향은 뚜렷한데 유연해\"", score: 2 },
      { text: "\"빠지면 진짜 빠지는 스타일\"", score: 3 },
      { text: "\"그거 때문에 또 잠 못 잤어?\"", score: 4 },
    ],
  },
  {
    q: "마지막 질문. \'과몰입\'이라는 단어를 들으면?",
    options: [
      { text: "부정적인 단어 같은데?", score: 1 },
      { text: "나랑은 좀 먼 얘기다", score: 2 },
      { text: "...왜 나 얘기를 해?", score: 3 },
      { text: "그건 제 별명입니다", score: 4 },
    ],
  },
];

const GWAMOIP_RESULTS: TestResultType[] = [
  {
    id: "chill",
    emoji: "🧊",
    name: "냉철한 관망가",
    tagline: "과몰입? 그게 먼데요",
    minScore: 12,
    maxScore: 19,
    description: [
      "적당함의 신. 모든 걸 여유롭게 즐기되, 빠져드는 건 따뜻한 목욕물 정도다. 유행이 지나가길 기다렸다가 입문하는 미학도 있다.",
      "이런 태도 덕에 돈도 멘탈도 잘 지키는 편. 다만 진짜 좋아하는 게 생기면 살짝 더 파보는 용기, 그건 있어도 된다.",
    ],
    foxComment: "누굴까... 세상에서 제일 평온한 여우는 누구게! 바로 너란 말이야~",
    keywords: ["멘탈부동의신", "여유의아이콘"],
    theme: "ice",
  },
  {
    id: "balanced",
    emoji: "🌊",
    name: "흐름타는 밸런서",
    tagline: "필요하면 빠지고, 때 되면 나온다",
    minScore: 20,
    maxScore: 29,
    description: [
      "취향은 확실하지만 인생이 흔들리진 않는다. 몰입의 스위치를 스스로 끄고 켤 줄 아는, 어른의 과몰입력을 지녔다.",
      "주변에서 제일 부러워하는 타입. 다만 가끔은 스위치를 고의로 안 끄고 밤새워볼 것. 그 기억이 인생 재미 포인트가 된다.",
    ],
    foxComment: "오~ 균형의 달인이네! 나도 도토리 저장고는 적당히 채우는 편이야.",
    keywords: ["어른의몰입력", "스위치마스터"],
    theme: "wave",
  },
  {
    id: "pro",
    emoji: "🔥",
    name: "프로 몰입러",
    tagline: "시작하면 끝을 봐야 직성",
    minScore: 30,
    maxScore: 39,
    description: [
      "관심사가 곧 비타민. 일단 빠지면 자료부터 수집하고 커뮤니티까지 정주행하는 속도전형 인간이다.",
      "주변 사람들은 너 덕분에 새로운 세계를 알게 된다. 네가 최신 트렌드 알려주는 사람이니까. 단, 알림은 좀 꺼두자.",
    ],
    foxComment: "나도 도토리 발견하면 하루 종일 캐! 우리 좀 잘 맞겠는데?",
    keywords: ["입문속도전", "트렌드알림기계"],
    theme: "fire",
  },
  {
    id: "legend",
    emoji: "💥",
    name: "인생 과몰입러",
    tagline: "사랑하면 국경을 넘는다",
    minScore: 40,
    maxScore: 48,
    description: [
      "좋아하면 새벽을 넘고, 빠지면 계절을 넘는다. 너의 하루에는 48시간이 필요하며, 관심사 사전에는 \'중간\'이라는 단어가 없다.",
      "그 순수함과 에너지가 최대 무기다. 세상의 절반은 너 같은 사람 덕에 돌아간다. 남은 절반은 너를 이해하느라 돌아간다.",
    ],
    foxComment: "동감!!! 나도 복슬복슬 꼬리에 과몰입해서 매일 빗질한다고~ 동류다, 너!",
    keywords: ["국경넘는사랑", "48시간이필요해"],
    theme: "burst",
  },
];

export const TESTS: Record<string, TestDef> = {
  gwamoip: {
    slug: "gwamoip",
    emoji: "💥",
    title: "과몰입 테스트",
    subtitle: "나는 사랑에, 덕에, 일에 얼마나 과몰입하는 인간일까?",
    questions: GWAMOIP_QUESTIONS,
    results: GWAMOIP_RESULTS,
  },
};

export function getTestDef(slug: string): TestDef | null {
  return TESTS[slug] ?? null;
}

/** 합산 점수를 결과 유형으로 변환한다. 정의 실수로 구간이 비면 마지막 유형이라도 반환한다. */
export function resolveTestResult(def: TestDef, score: number): TestResultType {
  const hit = def.results.find((r) => score >= r.minScore && score <= r.maxScore);
  return hit ?? def.results[def.results.length - 1];
}
