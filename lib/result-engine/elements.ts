import { calculateFourPillars } from "manseryeok";

export type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";

export const ELEMENT_ORDER: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];

export interface ElementEntry {
  label: string;
  hanja: string;
  color: string;
  blurbs: string[];
}

export interface ElementProfile {
  /** 가장 빈도가 높은 오행 (동률이면 일간 기준). 카드 대표 아이콘/제목에 사용. */
  dominant: ElementKey;
  /** 사주 기둥 전체(출생시간 없으면 연/월/일 6글자, 있으면 시주 포함 8글자)의 오행 개수 */
  distribution: Record<ElementKey, number>;
  /** 출생시간을 입력했는지 여부 — false면 distribution은 6글자 기준(참고용) */
  hasTimeInput: boolean;
  /** "병자연주 · 계사월주 · 신해일주" 형태의 사주 기둥 표기 */
  pillarText: string;
}

// manseryeok의 ElementPair.stem/branch는 이미 오행 한글 라벨('목'/'화'/'토'/'금'/'수')이다.
const ELEMENT_LABEL_TO_KEY: Record<string, ElementKey> = {
  목: "wood",
  화: "fire",
  토: "earth",
  금: "metal",
  수: "water",
};

const EMPTY_DISTRIBUTION = (): Record<ElementKey, number> => ({
  wood: 0,
  fire: 0,
  earth: 0,
  metal: 0,
  water: 0,
});

// 생년월일(+선택적 출생시간)의 사주팔자를 계산해 오행 분포를 낸다.
// 출생시간이 없으면 시주는 계산에서 제외(hour/minute은 자정 경계에 영향 없는 정오로
// 고정 — dayBoundary 기본값 'midnight'에서는 일주가 시각과 무관하게 날짜로만 결정된다).
export function calculateElementProfile(birthdate: string, birthTime?: string): ElementProfile {
  const [year, month, day] = birthdate.split("-").map(Number);
  const hasTimeInput = Boolean(birthTime);
  const [hour, minute] = hasTimeInput ? birthTime!.split(":").map(Number) : [12, 0];

  const pillars = calculateFourPillars({ year, month, day, hour, minute });

  const distribution = EMPTY_DISTRIBUTION();
  const count = (pair: { stem: string; branch: string }) => {
    distribution[ELEMENT_LABEL_TO_KEY[pair.stem]]++;
    distribution[ELEMENT_LABEL_TO_KEY[pair.branch]]++;
  };
  count(pillars.yearElement);
  count(pillars.monthElement);
  count(pillars.dayElement);
  if (hasTimeInput) count(pillars.hourElement);

  const dayStemKey = ELEMENT_LABEL_TO_KEY[pillars.dayElement.stem];
  let dominant: ElementKey = dayStemKey;
  let max = distribution[dayStemKey];
  for (const key of ELEMENT_ORDER) {
    if (distribution[key] > max) {
      max = distribution[key];
      dominant = key;
    }
  }

  const pillarParts = [`${pillars.yearString}연주`, `${pillars.monthString}월주`, `${pillars.dayString}일주`];
  if (hasTimeInput) pillarParts.push(`${pillars.hourString}시주`);

  return { dominant, distribution, hasTimeInput, pillarText: pillarParts.join(" · ") };
}

// seed 문자열로부터 결정론적으로 [0, length) 범위의 인덱스를 고른다 — 같은 사람은
// 새로고침해도 항상 같은 블러브 변형을 보게 되고, AI 호출 없이 다양성만 준다.
export function pickVariant(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

// 오행 분포를 짧은 해설 문장으로 풀어준다 (유료 상세보기 콘텐츠).
export function describeDistribution(distribution: Record<ElementKey, number>): string {
  const ranked = ELEMENT_ORDER.map((key) => [key, distribution[key]] as const)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  if (ranked.length === 0) return "";

  const [topKey] = ranked[0];
  const top = ELEMENT_BANK[topKey];
  if (ranked.length === 1) {
    return `사주 전체가 ${top.label}(${top.hanja}) 기운 하나로 가득해요. 그만큼 색깔이 뚜렷한 사주예요.`;
  }

  const [secondKey] = ranked[1];
  const second = ELEMENT_BANK[secondKey];
  return `${top.label}(${top.hanja}) 기운이 가장 강하고, ${second.label}(${second.hanja}) 기운도 함께 자리 잡고 있어요. 이 두 기운이 어우러져 지금의 성향을 만들어요.`;
}

export const ELEMENT_BANK: Record<ElementKey, ElementEntry> = {
  wood: {
    label: "목",
    hanja: "木",
    color: "#65a30d",
    blurbs: [
      "나무처럼 위로, 옆으로 뻗어나가는 성장의 기운이에요. 새로운 걸 배우고 시도하는 데 거침이 없고, 주변 사람을 잘 챙기는 인자함도 있어요. 계획을 세우면 끝까지 밀고 나가는 뚝심 있는 리더 타입이에요.",
      "봄날의 새싹처럼 계속 자라나는 기운을 가진 사람이에요. 호기심이 많아서 새로운 도전을 두려워하지 않고, 한번 뿌리내린 관계는 오래 지켜가는 편이에요. 주변에서 계속 성장한다는 말을 자주 들을 타입이에요.",
      "곧게 뻗은 나무처럼 자기 소신이 뚜렷한 사람이에요. 남 눈치보다 스스로 옳다고 믿는 방향으로 나아가는 편이고, 그 과정에서 주변 사람들까지 함께 이끌어가는 힘이 있어요. 은근히 다정한 리더십의 소유자예요.",
    ],
  },
  fire: {
    label: "화",
    hanja: "火",
    color: "#dc2626",
    blurbs: [
      "타오르는 불꽃처럼 에너지와 표현력이 넘치는 사람이에요. 감정에 솔직하고 분위기를 밝게 만드는 재주가 있어서, 있는 곳마다 활기가 돌아요. 열정이 붙으면 물불 안 가리고 몰입하는 스타일이에요.",
      "한여름의 태양처럼 존재감이 확실한 사람이에요. 하고 싶은 말은 참지 않고 시원하게 표현하는 편이라, 옆에 있으면 답답할 틈이 없어요. 좋아하는 일 앞에서는 누구보다 뜨거워지는 타입이에요.",
      "불씨 하나로 분위기를 확 살리는 사람이에요. 사람 만나는 걸 좋아하고 리액션도 커서, 함께 있으면 텐션이 자연스럽게 올라가요. 마음먹은 일은 속도감 있게 밀어붙이는 추진력도 있어요.",
    ],
  },
  earth: {
    label: "토",
    hanja: "土",
    color: "#ca8a04",
    blurbs: [
      "모든 걸 품어주는 땅처럼 신뢰감과 포용력이 큰 사람이에요. 급하게 서두르기보다 묵묵히 중심을 잡아주는 역할을 잘하고, 주변 사람들이 은근히 많이 의지해요. 갈등이 생기면 자연스럽게 중재자가 되는 타입이에요.",
      "든든한 대지처럼 흔들림 없는 사람이에요. 화려하게 나서기보다 묵묵히 자기 자리를 지키는 편인데, 그게 오히려 신뢰를 만들어요. 힘든 일이 생기면 가장 먼저 찾게 되는 사람일 거예요.",
      "사계절을 다 품는 땅처럼 포용력이 넓은 사람이에요. 사람에 대한 호불호가 크지 않고, 누구든 편하게 받아주는 여유가 있어요. 겉으론 무던해 보여도 속으론 은근히 세심하게 챙기는 타입이에요.",
    ],
  },
  metal: {
    label: "금",
    hanja: "金",
    color: "#78716c",
    blurbs: [
      "잘 벼려진 쇠처럼 원칙과 결단력이 뚜렷한 사람이에요. 맺고 끊는 게 분명하고, 옳다고 생각하는 일에는 소신 있게 밀고 나가는 힘이 있어요. 디테일을 놓치지 않는 완벽주의 기질도 함께 갖고 있어요.",
      "날카롭게 벼려진 칼날처럼 판단이 명확한 사람이에요. 애매한 상황을 정리하는 데 능하고, 한번 결정하면 흔들리지 않고 밀고 나가요. 겉으로는 냉철해 보여도 원칙 안에서는 확실히 챙기는 스타일이에요.",
      "정제된 금속처럼 군더더기 없는 사람이에요. 말과 행동에 낭비가 없고, 목표를 향해 효율적으로 움직이는 편이에요. 신뢰를 중요하게 여겨서, 한번 믿은 사람은 끝까지 챙기는 의리파이기도 해요.",
    ],
  },
  water: {
    label: "수",
    hanja: "水",
    color: "#0369a1",
    blurbs: [
      "흐르는 물처럼 유연한 사고와 깊은 통찰력을 가진 사람이에요. 상황에 맞춰 부드럽게 적응하면서도, 속으로는 누구보다 신중하게 계산하고 있어요. 겉으로 드러내지 않는 지혜로움이 매력 포인트예요.",
      "깊은 물처럼 속을 쉽게 드러내지 않는 사람이에요. 겉으로는 조용해 보여도 속에는 생각이 참 많고, 상황 파악이 빨라서 한 발 앞서 움직이는 편이에요. 알아갈수록 매력이 깊어지는 타입이에요.",
      "어디로든 흘러드는 물처럼 적응력이 뛰어난 사람이에요. 새로운 환경이나 사람 앞에서도 크게 긴장하지 않고 자연스럽게 스며드는 편이에요. 부드러운 인상 뒤에 의외로 단단한 심지를 갖고 있어요.",
    ],
  },
};

export type Season = "spring" | "summer" | "fall" | "winter";

function seasonFromMonth(month: number): Season {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}

const SEASON_LABEL: Record<Season, string> = { spring: "봄", summer: "여름", fall: "가을", winter: "겨울" };

// 오행 x 계절 조합 유형명(20가지). "여름 밤비형"처럼 계절 라벨과 합쳐서 쓴다.
const SEASON_NOUN: Record<ElementKey, Record<Season, string>> = {
  wood: { spring: "들풀", summer: "신록", fall: "단풍", winter: "큰나무" },
  fire: { spring: "봄볕", summer: "태양", fall: "화롯불", winter: "난로" },
  earth: { spring: "새순밭", summer: "황토", fall: "곡창", winter: "언덕" },
  metal: { spring: "무쇠", summer: "보석", fall: "서리", winter: "칼날" },
  water: { spring: "이슬", summer: "밤비", fall: "가을비", winter: "바다" },
};

// "여름 밤비형" 형태의 유형명. 생년월일의 월(月)만으로 계절을 정하는 단순화된 규칙
// (정확한 절기 기준 아님 — 유형명은 재미 요소라 이 정도면 충분하다).
export function getSeasonType(element: ElementKey, birthdate: string): string {
  const month = Number(birthdate.split("-")[1]);
  const season = seasonFromMonth(month);
  return `${SEASON_LABEL[season]} ${SEASON_NOUN[element][season]}형`;
}
