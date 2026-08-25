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
      "당신은 어떤 상황에서도 쉽게 휩쓸리지 않는 편이에요. 남들이 술렁일 때도 한 발짝 떨어져서 지켜보는 쪽을 택하죠.",
      "감정적으로 깊이 들어가기보다는 적당한 거리를 유지하는 게 당신에게는 자연스러운 방식이에요. 덕분에 남들이 놓치는 부분까지 여유롭게 볼 수 있어요.",
      "가끔은 '나도 한번 제대로 빠져볼까' 싶다가도 결국 선을 넘지 않는 편이에요. 그 담담함이 당신의 강점이지만, 아주 가끔은 마음 가는 대로 푹 빠져보는 것도 괜찮아요.",
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
      "당신은 몰입과 절제를 오가는 균형 감각이 뛰어난 편이에요. 평소엔 담담하다가도, 마음에 드는 걸 만나면 순식간에 깊이 빠져들어요.",
      "겉으로는 잘 안 드러나지만, 한번 스위치가 켜지면 내면의 몰입도는 상당히 높아요. 다만 그 몰입을 스스로 끄고 켤 줄 아는 조절력을 갖고 있어요.",
      "이 조절력은 흔치 않은 재능이에요. 다만 너무 자주 스위치를 꺼두면 몰입이 주는 즐거움 자체를 놓칠 수 있으니, 가끔은 의도적으로 끝까지 빠져보는 것도 좋아요.",
    ],
    foxComment: "오~ 균형의 달인이네! 나도 신나게 뛰어놀다가도 때 되면 굴로 쏙 들어가는 편이야.",
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
      "당신은 한번 시작한 건 끝까지 봐야 직성이 풀리는 완결형 몰입러예요. 중간에 멈추는 걸 유독 견디기 힘들어해요.",
      "관심이 생기면 진입 속도도 빠르고, 몰입의 깊이도 금방 최고조에 이르러요. 어중간하게 즐기는 것보다 완결이나 최신화까지 따라잡아야 마음이 놓이는 타입이에요.",
      "그 추진력 덕분에 주변에서는 당신을 최신 정보통으로 여겨요. 다만 속도만큼 여유도 챙겨야 오래 즐길 수 있다는 것도 잊지 마세요.",
    ],
    foxComment: "나도 사냥감 냄새 한번 맡으면 하루 종일 쫓아! 우리 좀 잘 맞겠는데?",
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
      "당신의 몰입은 취미의 수준을 넘어서요. 좋아하는 대상이 생기면 그와 관련된 모든 정보를 파고들어 나만의 지식 체계를 만들어버려요.",
      "당신에게 관심사는 단순한 여가가 아니라 라이프스타일이자 정체성에 가까워요. 남들이 지나치는 디테일까지 놓치지 않고 기억하는 것도 그 때문이에요.",
      "그 깊이 덕분에 당신은 주변 사람들에게 사실상 백과사전 같은 존재예요. 다만 그 몰입이 일상의 다른 부분을 삼키지 않도록 가끔은 숨 고르기도 필요해요.",
    ],
    foxComment: "동감!!! 나도 복슬복슬 꼬리에 과몰입해서 매일 빗질한다고~ 동류다, 너!",
    keywords: ["국경넘는사랑", "48시간이필요해"],
    theme: "burst",
  },
];

const LOVE_QUESTIONS: TestQuestion[] = [
  {
    q: "호감 있는 사람에게 먼저 연락할 수 있나?",
    options: [
      { text: "절대 안 한다. 상대가 오게 둔다", score: 1 },
      { text: "가끔 용기를 내서 보낸다", score: 2 },
      { text: "자연스럽게 먼저 보낸다", score: 3 },
      { text: "아침 인사가 이미 루틴이다", score: 4 },
    ],
  },
  {
    q: "연인과 다투면 나는?",
    options: [
      { text: "혼자 정리하고 괜찮은 척한다", score: 1 },
      { text: "시간을 두고 차분히 얘기한다", score: 2 },
      { text: "바로 만나서 풀어야 잠이 온다", score: 3 },
      { text: "감정을 다 드러내고 끝까지 붙는다", score: 4 },
    ],
  },
  {
    q: "고백 스타일은?",
    options: [
      { text: "말 안 해도 알아주겠지", score: 1 },
      { text: "분위기와 타이밍을 본다", score: 2 },
      { text: "준비한 장문의 메시지로 한다", score: 3 },
      { text: "직접 찾아가서 말한다", score: 4 },
    ],
  },
  {
    q: "기념일에 대해 어떻게 생각해?",
    options: [
      { text: "날짜가 사랑을 증명하진 않지", score: 1 },
      { text: "큰 것 하나만 챙긴다", score: 2 },
      { text: "매달 작은 선물을 준비한다", score: 3 },
      { text: "100일, 1000일을 엑셀로 관리한다", score: 4 },
    ],
  },
  {
    q: "질투는?",
    options: [
      { text: "없다. 각자의 친구는 소중하다", score: 1 },
      { text: "살짝 있지만 참는다", score: 2 },
      { text: "티가 많이 난다", score: 3 },
      { text: "어디서, 누구랑, 몇 시까지였는지 궁금하다", score: 4 },
    ],
  },
  {
    q: "연애할 때 내 휴대폰 알림 설정은?",
    options: [
      { text: "무음. 나중에 확인한다", score: 1 },
      { text: "필요하면 바로 답장한다", score: 2 },
      { text: "5분 안에 답장이 원칙이다", score: 3 },
      { text: "그 사람 대화방을 화면 위에 고정해둔다", score: 4 },
    ],
  },
  {
    q: "이상적인 데이트는?",
    options: [
      { text: "각자 집에서 편하게 쉬기", score: 1 },
      { text: "산책하며 커피 한잔", score: 2 },
      { text: "계획해둔 데이트 코스 돌기", score: 3 },
      { text: "아침부터 밤까지 붙어있기", score: 4 },
    ],
  },
  {
    q: "상대가 혼자 취미 모임에 가자고 하면?",
    options: [
      { text: "\"잘 가~ 재밌게 놀다 와\"", score: 1 },
      { text: "좋다고 해두면 살짝 허전하다", score: 2 },
      { text: "무리해서라도 같이 가고 싶다", score: 3 },
      { text: "나도 그 취미를 시작해버린다", score: 4 },
    ],
  },
  {
    q: "사랑을 표현하는 방식은?",
    options: [
      { text: "행동보다는 마음으로", score: 1 },
      { text: "실질적으로 챙겨준다", score: 2 },
      { text: "애정 표현을 서슴지 않는다", score: 3 },
      { text: "SNS에도 자랑하고 다닌다", score: 4 },
    ],
  },
  {
    q: "헤어진 후 나는?",
    options: [
      { text: "빠르게 정리한다", score: 1 },
      { text: "몇 달은 애태운다", score: 2 },
      { text: "재회까지 시도해본다", score: 3 },
      { text: "아직도 그 사람 얘기를 한다", score: 4 },
    ],
  },
  {
    q: "연인의 SNS 활동은?",
    options: [
      { text: "관심 없다", score: 1 },
      { text: "가끔 들른다", score: 2 },
      { text: "좋아요는 기본이다", score: 3 },
      { text: "댓글창은 내 아파트입니다", score: 4 },
    ],
  },
  {
    q: "마지막 질문. \\'사랑\\'이라는 단어를 들으면?",
    options: [
      { text: "부담스럽다", score: 1 },
      { text: "언젠가는 하겠지", score: 2 },
      { text: "지금 하고 싶다", score: 3 },
      { text: "이미 노래방 애창곡 번호가 있다", score: 4 },
    ],
  },
];

const LOVE_RESULTS: TestResultType[] = [
  {
    id: "hedgehog",
    emoji: "🦔",
    name: "프로 개인주의자",
    tagline: "연애도 좋지만 나도 좋아",
    minScore: 12,
    maxScore: 19,
    description: [
      "당신은 연애 안에서도 자기만의 공간과 리듬을 지키는 걸 중요하게 여겨요. 상대와 붙어있는 것 못지않게 혼자만의 시간도 필요한 타입이에요.",
      "애정 표현이 없어서가 아니라, 적당한 거리가 오히려 편안함을 만든다고 믿어요. 그래서 상대가 서운해할 때 본인은 잘 눈치채지 못하는 경우가 많아요.",
      "그 독립성은 건강한 연애의 기반이 될 수 있어요. 다만 상대에게는 함께하는 시간이 곧 사랑의 증거일 수 있다는 것도 가끔 떠올려보세요.",
    ],
    foxComment: "혼자 낮잠 자는 것도 은근히 좋지! 나도 이해해~",
    keywords: ["나의시간은소중해", "거리두기장인"],
    theme: "ice",
  },
  {
    id: "steady",
    emoji: "🧸",
    name: "느긋한 장기자랑",
    tagline: "천리길도 한 걸음부터",
    minScore: 20,
    maxScore: 29,
    description: [
      "당신은 표현은 서툴지만 마음은 꾸준한 타입이에요. 화려한 이벤트보다 오래 쌓이는 신뢰와 익숙함을 더 소중하게 여겨요.",
      "상대의 사소한 습관이나 취향을 오래 기억해두는 것도 당신의 방식이에요. 티는 잘 안 나지만, 그만큼 마음이 깊고 안정적이에요.",
      "이런 은은한 다정함은 오래가는 연애의 힘이에요. 다만 마음을 쌓아두기만 하지 말고, 가끔은 소리 내어 표현해보는 연습도 필요해요.",
    ],
    foxComment: "굴을 조금씩 넓혀가듯 사랑도 차곡차곡 쌓는 타입이네!",
    keywords: ["어른의연애", "은은한다정"],
    theme: "wave",
  },
  {
    id: "thrill",
    emoji: "🎢",
    name: "설렘 중독자",
    tagline: "심장 뛰는 게 일상",
    minScore: 30,
    maxScore: 39,
    description: [
      "당신에게 연애는 설렘 그 자체예요. 답장 하나, 눈빛 하나에도 감정이 크게 요동치는 편이라 늘 연애를 생생하게 느껴요.",
      "그 감정 기복 덕분에 연애 초반의 두근거림을 남들보다 오래, 진하게 즐길 수 있어요. 대신 그 설렘이 잦아들면 상대적으로 허전함도 크게 느껴요.",
      "당신 덕분에 연애가 즐거운 사람이 많아요. 다만 장기적인 관계는 설렘보다 편안함에서 이긴다는 것도 함께 기억해두면 좋아요.",
    ],
    foxComment: "나도 좋은 냄새 나는 바람 불면 꼬리가 먼저 반응해! 공감된다~",
    keywords: ["설렘제조기", "심장운동선수"],
    theme: "fire",
  },
  {
    id: "volcano",
    emoji: "🌋",
    name: "사랑 광공",
    tagline: "내 사람은 세상에서 제일",
    minScore: 40,
    maxScore: 48,
    description: [
      "당신은 한번 마음을 주면 아낌없이 다 주는 타입이에요. 상대를 향한 관심과 애정 표현에 망설임이 없어요.",
      "연락 빈도부터 챙기는 디테일까지, 당신의 애정 표현은 늘 적극적이고 꾸준해요. 상대가 자고 있는 시간에도 당신의 마음은 늘 그 사람을 향해 있어요.",
      "그 헌신은 상대에게 확실한 안정감을 줘요. 다만 그 마음이 너무 커지면 상대가 부담을 느낄 수 있으니, 가끔은 한 발짝 떨어져서 숨 쉴 틈도 남겨주세요.",
    ],
    foxComment: "우와... 나도 애써 잡은 사냥감을 통째로 주고 싶은 사람이 생기면 저렇게 된다고!",
    keywords: ["광공맞음", "헌신의화신"],
    theme: "burst",
  },
];

const PHONE_QUESTIONS: TestQuestion[] = [
  {
    q: "아침에 눈 뜨면 제일 먼저 하는 일은?",
    options: [
      { text: "일어나서 물 한잔", score: 1 },
      { text: "알람 끄고 세수", score: 2 },
      { text: "눈 감은 상태로 알림 확인", score: 3 },
      { text: "이미 유튜브를 켜고 있다", score: 4 },
    ],
  },
  {
    q: "배터리 20% 경고가 뜨면?",
    options: [
      { text: "그냥 둔다", score: 1 },
      { text: "충전기 있으면 연결한다", score: 2 },
      { text: "절전모드 + 밝기 최소", score: 3 },
      { text: "심장이 철렁한다", score: 4 },
    ],
  },
  {
    q: "화장실 갈 때 휴대폰은?",
    options: [
      { text: "안 가져간다", score: 1 },
      { text: "가끔 가져간다", score: 2 },
      { text: "필수템이다", score: 3 },
      { text: "들어가기 전 배터리부터 확인한다", score: 4 },
    ],
  },
  {
    q: "하루 스크린타임은 대략?",
    options: [
      { text: "2시간 미만", score: 1 },
      { text: "3~4시간", score: 2 },
      { text: "6시간쯤", score: 3 },
      { text: "확인하기가 무섭다", score: 4 },
    ],
  },
  {
    q: "밥 먹을 때 나는?",
    options: [
      { text: "휴대폰 없이 식사", score: 1 },
      { text: "가끔 영상을 튼다", score: 2 },
      { text: "식탁 위 전용 폰이 있다", score: 3 },
      { text: "볼 콘텐츠 골라놓고 밥을 먹는다", score: 4 },
    ],
  },
  {
    q: "재미없는 콘텐츠를 보며 스크롤하는 나는?",
    options: [
      { text: "바로 종료한다", score: 1 },
      { text: "조금 더 보다 끈다", score: 2 },
      { text: "손가락이 멈추질 않는다", score: 3 },
      { text: "정신 차려보니 3시간이 사라졌다", score: 4 },
    ],
  },
  {
    q: "잠들기 전 마지막 행동은?",
    options: [
      { text: "독서나 명상", score: 1 },
      { text: "스트레칭", score: 2 },
      { text: "\"마지막 영상\" 시전", score: 3 },
      { text: "새벽 3시, 알고리즘이 나를 데려간다", score: 4 },
    ],
  },
  {
    q: "친구와 만났을 때 나는?",
    options: [
      { text: "폰을 집어넣고 집중한다", score: 1 },
      { text: "사진 몇 장 찍고 넣는다", score: 2 },
      { text: "올려야 모임이 완성된다", score: 3 },
      { text: "둘이서 각자 폰을 보고 있다", score: 4 },
    ],
  },
  {
    q: "새 앱이 유행하면?",
    options: [
      { text: "관심 없다", score: 1 },
      { text: "리뷰를 보고 결정한다", score: 2 },
      { text: "바로 깔아본다", score: 3 },
      { text: "이미 친구 초대 링크를 받아뒀다", score: 4 },
    ],
  },
  {
    q: "길을 걸을 때 나는?",
    options: [
      { text: "주변 풍경을 본다", score: 1 },
      { text: "음악만 듣는다", score: 2 },
      { text: "보면서 걷는다", score: 3 },
      { text: "기둥에 부딪힐 뻔한 횟수를 센다", score: 4 },
    ],
  },
  {
    q: "휴대폰 없이 하루를 보낸다면?",
    options: [
      { text: "오히려 시원하겠다", score: 1 },
      { text: "불편하지만 가능하다", score: 2 },
      { text: "상상만으로 아찔하다", score: 3 },
      { text: "그건 축복이 아니라 재난이다", score: 4 },
    ],
  },
  {
    q: "마지막 질문. \\'디지털 디톡스\\'에 대해 어떻게 생각해?",
    options: [
      { text: "매달 해야지", score: 1 },
      { text: "해본 적 있다", score: 2 },
      { text: "실패한 경험이 있다", score: 3 },
      { text: "디톡스 방법을 폰으로 검색 중이다", score: 4 },
    ],
  },
];

const PHONE_RESULTS: TestResultType[] = [
  {
    id: "monk",
    emoji: "🧘",
    name: "디지털 수행자",
    tagline: "핸드폰은 도구일 뿐",
    minScore: 12,
    maxScore: 19,
    description: [
      "당신은 휴대폰에 쉽게 끌려다니지 않는 자기 통제력을 갖고 있어요. 알림이 와도 필요할 때만 확인하고, 아니면 미련 없이 넘겨요.",
      "휴대폰을 도구로만 다루는 태도 덕분에 눈앞의 일에 오래, 깊이 집중할 수 있어요. 이런 균형 감각은 이 시대에 흔치 않은 능력이에요.",
      "이 절제력은 분명한 강점이에요. 다만 가끔은 그 절제를 남에게 은근히 자랑하고 싶어지는 마음도 조금은 인정해줘도 괜찮아요.",
    ],
    foxComment: "산속 여우도 폰보다 햇볕 쬐는 걸 좋아해. 너랑 통한다!",
    keywords: ["디지털노마드", "집중력요정"],
    theme: "ice",
  },
  {
    id: "casual",
    emoji: "☕",
    name: "적당한 스크롤러",
    tagline: "봐야 할 때만 본다",
    minScore: 20,
    maxScore: 29,
    description: [
      "당신은 휴대폰과 적당히 거리를 두는 균형 감각을 갖고 있어요. 필요할 때 보고, 볼 만큼 보면 미련 없이 내려놓아요.",
      "가끔 무한 스크롤에 빠지는 날도 있지만, 오래가진 않아요. 스스로 그 패턴을 알고 있다는 것 자체가 이미 절제력의 증거예요.",
      "디지털과 현실 사이 균형을 오래 유지해온 베테랑이에요. 이대로도 좋지만, 한 달에 하루 정도는 아예 충전기에서 떼어놓고 자보는 것도 추천해요.",
    ],
    foxComment: "적당히 자는 낮잠이 제일 개운한 법이지!",
    keywords: ["균형의달인", "건강한관계"],
    theme: "wave",
  },
  {
    id: "resident",
    emoji: "📱",
    name: "SNS 주민",
    tagline: "손가락이 먼저 움직인다",
    minScore: 30,
    maxScore: 39,
    description: [
      "당신은 정보에 대한 반응 속도가 남들보다 훨씬 빨라요. 새 소식이나 트렌드를 누구보다 먼저 접하고 공유하는 편이에요.",
      "그만 봐야지 생각해도 손가락이 먼저 화면을 스크롤하고 있는 경우가 많아요. 그만큼 즉각적인 반응과 몰입이 습관처럼 자리잡혀 있어요.",
      "당신 덕분에 주변 사람들은 트렌드를 놓치지 않아요. 다만 그 속도만큼 목과 눈의 피로도 쌓이기 쉬우니 틈틈이 쉬어주는 것도 챙기세요.",
    ],
    foxComment: "나도 여우 마을 소식은 제일 먼저 알아야 직성이 풀린다!",
    keywords: ["속보전달자", "스크롤마스터"],
    theme: "fire",
  },
  {
    id: "alien",
    emoji: "👽",
    name: "화면 속 이주민",
    tagline: "현실은 버그투성이 서비스",
    minScore: 40,
    maxScore: 48,
    description: [
      "당신의 일상 대부분은 화면 속에서 이뤄져요. 현실보다 온라인 공간에서 더 많은 시간을 보내고, 더 편안함을 느껴요.",
      "직접 나가서 보고 듣는 것보다 화면으로 접하는 정보와 자극이 더 익숙하고 강렬하게 느껴지는 편이에요. 그만큼 온라인 세계에 대한 몰입도가 매우 높아요.",
      "이 몰입은 당신만의 세계를 풍부하게 만들어줘요. 다만 가끔은 화면을 내려놓고 직접 눈으로 담아보는 시간도 그 못지않게 소중하다는 것, 잊지 마세요.",
    ],
    foxComment: "폰 버려라는 아님! 다만 나랑 10분만 산책하자. 숲은 진짜 고화질이야.",
    keywords: ["스크린타임경보", "알고리즘친구"],
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
  love: {
    slug: "love",
    emoji: "💘",
    title: "연애 스타일 테스트",
    subtitle: "나는 어떤 식으로 사랑에 빠지는 인간일까?",
    questions: LOVE_QUESTIONS,
    results: LOVE_RESULTS,
  },
  phone: {
    slug: "phone",
    emoji: "📱",
    title: "휴대폰 중독 테스트",
    subtitle: "나는 유리 조각과 얼마나 친할까?",
    questions: PHONE_QUESTIONS,
    results: PHONE_RESULTS,
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

/** 점수가 결과 유형 구간(minScore~maxScore) 밖이면(직접 주소 조작 등) 안으로 밀어넣는다. */
export function clampTestScore(def: TestDef, score: number): number {
  const first = def.results[0];
  const last = def.results[def.results.length - 1];
  return Math.min(Math.max(score, first.minScore), last.maxScore);
}

// 합산 점수(예: 12~48)를 0~100으로 그대로 환산하면 최저 구간이 20~30점대로 나와 "낮은
// 점수"처럼 보인다. 바이럴 테스트는 누구나 공유하고 싶은 점수가 나와야 하니, 문항
// 최저~최고 구간을 [DISPLAY_SCORE_MIN, DISPLAY_SCORE_MAX] 구간으로 환산해 아무리
// 낮아도 최소 점수 밑으로는 안 내려가게 한다.
const DISPLAY_SCORE_MIN = 65;
const DISPLAY_SCORE_MAX = 99;

export function scoreToDisplayScore(def: TestDef, score: number): number {
  const min = def.results[0].minScore;
  const max = def.results[def.results.length - 1].maxScore;
  if (max <= min) return DISPLAY_SCORE_MAX;
  const ratio = (score - min) / (max - min);
  return Math.round(DISPLAY_SCORE_MIN + ratio * (DISPLAY_SCORE_MAX - DISPLAY_SCORE_MIN));
}
