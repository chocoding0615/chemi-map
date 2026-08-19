import { calculateElementProfile, pickVariant, type ElementKey } from "./elements";

// 오행별 오늘의 기운 문구 뱅크. 시드에 날짜가 들어가므로 자정마다 자연스럽게
// 다른 문구가 뽑힌다 — 별도 스케줄러/서버 상태 없이 순수 계산만으로 매일 갱신된다.
const DAILY_FORTUNE_BANK: Record<ElementKey, string[]> = {
  wood: [
    "오늘은 새로 시작한 일이 뜻밖에 잘 풀릴 기운이에요. 미뤄뒀던 걸 하나 꺼내보세요.",
    "주변 사람과의 대화에서 좋은 아이디어가 나올 수 있는 날이에요. 귀를 열어두세요.",
    "몸을 움직이면 기운이 더 좋아지는 날이에요. 짧게라도 산책해보는 건 어때요.",
  ],
  fire: [
    "표현하고 싶은 마음이 커지는 날이에요. 담아두지 말고 솔직하게 말해보세요.",
    "사람들 앞에서 유독 눈에 띄는 하루예요. 자신 있게 나서봐도 좋아요.",
    "열정이 붙는 일이 생길 수 있어요. 오늘 시작한 몰입은 오래갈 기운이에요.",
  ],
  earth: [
    "누군가 은근히 나에게 의지하게 되는 날이에요. 든든하게 옆을 지켜주세요.",
    "차분하게 정리하면 마음이 편해지는 하루예요. 미뤄둔 정리를 해보세요.",
    "안정적인 선택이 결국 좋은 결과로 이어지는 날이에요. 서두르지 마세요.",
  ],
  metal: [
    "결단이 필요한 순간에 좋은 판단력이 발휘되는 날이에요. 망설이던 걸 정해보세요.",
    "디테일을 챙기면 빛을 발하는 하루예요. 꼼꼼함이 무기가 돼요.",
    "원칙대로 밀고 나가면 신뢰를 얻는 날이에요. 흔들리지 마세요.",
  ],
  water: [
    "생각이 깊어지는 하루예요. 조용히 혼자만의 시간을 가져보는 것도 좋아요.",
    "상황을 유연하게 받아들이면 오히려 기회가 되는 날이에요.",
    "누군가의 마음을 잘 읽을 수 있는 기운이에요. 대화에 귀 기울여보세요.",
  ],
};

// 생일을 몰라도(로그인 없이) 볼 수 있는 공용 문구 — 날짜만으로 시드가 정해져
// 같은 날엔 모든 손님이 같은 문구를 본다(낮은 리스크의 무료 콘텐츠라 이 정도면 충분).
const GENERIC_DAILY_FORTUNE: string[] = [
  "오늘은 평소보다 마음이 가는 대로 움직여도 좋은 날이에요.",
  "작은 우연이 좋은 인연으로 이어질 수 있는 하루예요.",
  "무리하지 않고 나만의 속도로 가면 잘 풀리는 날이에요.",
  "누군가에게 먼저 연락해보면 반가운 일이 생길 수 있어요.",
];

export interface DailyFortune {
  element: ElementKey | null;
  text: string;
}

export function getDailyFortune(birthdate: string | null, dateISO: string): DailyFortune {
  if (birthdate) {
    const { dominant } = calculateElementProfile(birthdate);
    const bank = DAILY_FORTUNE_BANK[dominant];
    const text = bank[pickVariant(`${birthdate}-${dateISO}`, bank.length)];
    return { element: dominant, text };
  }
  const text = GENERIC_DAILY_FORTUNE[pickVariant(dateISO, GENERIC_DAILY_FORTUNE.length)];
  return { element: null, text };
}
