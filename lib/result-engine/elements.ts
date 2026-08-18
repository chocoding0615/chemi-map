import { calculateFourPillars } from "manseryeok";

export type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";

export interface ElementEntry {
  label: string;
  hanja: string;
  color: string;
  blurb: string;
}

// 천간 오행(한글) -> 내부 키. manseryeok의 FIVE_ELEMENTS = ['목','화','토','금','수'].
const STEM_ELEMENT_TO_KEY: Record<string, ElementKey> = {
  목: "wood",
  화: "fire",
  토: "earth",
  금: "metal",
  수: "water",
};

// 생년월일(yyyy-mm-dd)의 일주(日柱) 천간을 계산해 오행을 배정한다.
// 시간을 입력받지 않으므로 hour/minute은 정오(자정 경계 영향 없음)로 고정 —
// dayBoundary 기본값(midnight)에서는 일주가 시각과 무관하게 날짜만으로 결정된다.
export function elementFromBirthdate(birthdate: string): ElementKey {
  const [year, month, day] = birthdate.split("-").map(Number);
  const { dayElement } = calculateFourPillars({ year, month, day, hour: 12, minute: 0 });
  return STEM_ELEMENT_TO_KEY[dayElement.stem];
}

export const ELEMENT_BANK: Record<ElementKey, ElementEntry> = {
  wood: {
    label: "목",
    hanja: "木",
    color: "#65a30d",
    blurb:
      "나무처럼 위로, 옆으로 뻗어나가는 성장의 기운이에요. 새로운 걸 배우고 시도하는 데 거침이 없고, 주변 사람을 잘 챙기는 인자함도 있어요. 계획을 세우면 끝까지 밀고 나가는 뚝심 있는 리더 타입이에요.",
  },
  fire: {
    label: "화",
    hanja: "火",
    color: "#dc2626",
    blurb:
      "타오르는 불꽃처럼 에너지와 표현력이 넘치는 사람이에요. 감정에 솔직하고 분위기를 밝게 만드는 재주가 있어서, 있는 곳마다 활기가 돌아요. 열정이 붙으면 물불 안 가리고 몰입하는 스타일이에요.",
  },
  earth: {
    label: "토",
    hanja: "土",
    color: "#ca8a04",
    blurb:
      "모든 걸 품어주는 땅처럼 신뢰감과 포용력이 큰 사람이에요. 급하게 서두르기보다 묵묵히 중심을 잡아주는 역할을 잘하고, 주변 사람들이 은근히 많이 의지해요. 갈등이 생기면 자연스럽게 중재자가 되는 타입이에요.",
  },
  metal: {
    label: "금",
    hanja: "金",
    color: "#78716c",
    blurb:
      "잘 벼려진 쇠처럼 원칙과 결단력이 뚜렷한 사람이에요. 맺고 끊는 게 분명하고, 옳다고 생각하는 일에는 소신 있게 밀고 나가는 힘이 있어요. 디테일을 놓치지 않는 완벽주의 기질도 함께 갖고 있어요.",
  },
  water: {
    label: "수",
    hanja: "水",
    color: "#0369a1",
    blurb:
      "흐르는 물처럼 유연한 사고와 깊은 통찰력을 가진 사람이에요. 상황에 맞춰 부드럽게 적응하면서도, 속으로는 누구보다 신중하게 계산하고 있어요. 겉으로 드러내지 않는 지혜로움이 매력 포인트예요.",
  },
};
