import { calculateElementProfile, pickVariant, type ElementKey } from "./elements";

// 오행별 이달의 기운 문구 뱅크. 시드에 "연-월"까지만 들어가서 한 달 내내 같은 문구를
// 보여주다가 달이 바뀌면 자연스럽게 새 문구로 바뀐다 — 오늘의 기운과 같은 원리, 다른 시간 단위.
const MONTHLY_FORTUNE_BANK: Record<ElementKey, string[]> = {
  wood: [
    "이번 달은 새로 심은 것들이 자리를 잡아가는 달이에요. 조급해하지 않아도 서서히 자라나요.",
    "배움이나 새 시도가 잘 맞아떨어지는 달이에요. 관심 가던 걸 이번 달에 시작해보세요.",
    "관계가 한 뼘 더 자라나는 달이에요. 소원해졌던 인연에 먼저 연락해봐도 좋아요.",
  ],
  fire: [
    "이번 달은 존재감이 확실히 드러나는 시기예요. 나서야 할 자리라면 미루지 마세요.",
    "에너지가 넘치는 한 달이에요. 다만 페이스 조절을 잊지 마세요.",
    "마음먹은 일에 몰입하기 좋은 달이에요. 시작한 열정이 꽤 오래갈 거예요.",
  ],
  earth: [
    "이번 달은 기반을 다지는 데 집중하면 좋은 시기예요. 화려함보다 안정이 어울려요.",
    "주변 사람들과의 신뢰가 쌓이는 달이에요. 묵묵히 하던 대로 하면 인정받아요.",
    "무리한 결정보다 익숙한 흐름을 지키는 게 유리한 한 달이에요.",
  ],
  metal: [
    "이번 달은 미뤄둔 결정을 내리기 좋은 시기예요. 판단력이 유독 또렷해요.",
    "정리와 마무리가 잘 되는 달이에요. 늘어져 있던 일을 깔끔히 끝내보세요.",
    "원칙대로 밀고 나가면 이번 달엔 확실한 신뢰를 얻어요.",
  ],
  water: [
    "이번 달은 생각을 깊게 하기 좋은 시기예요. 조용히 준비한 것들이 다음 달에 빛을 봐요.",
    "유연하게 흐름을 타는 게 중요한 달이에요. 변화가 오히려 기회가 될 수 있어요.",
    "사람 마음을 잘 읽을 수 있는 달이에요. 대화에서 뜻밖의 힌트를 얻을 수 있어요.",
  ],
};

// 생일을 몰라도 볼 수 있는 공용 문구 — 월(YYYY-MM)만으로 시드가 정해져 같은 달엔
// 모든 손님이 같은 문구를 본다.
const GENERIC_MONTHLY_FORTUNE: string[] = [
  "이번 달은 평소보다 마음 가는 대로 움직여도 좋은 흐름이에요.",
  "작은 시도 하나가 이번 달의 분위기를 바꿔놓을 수 있어요.",
  "무리하지 않고 나만의 속도로 가면 한 달이 편안하게 지나가요.",
  "이번 달엔 미뤄둔 안부 연락이 좋은 결과로 이어질 수 있어요.",
];

export interface MonthlyFortune {
  element: ElementKey | null;
  text: string;
}

export function getMonthlyFortune(birthdate: string | null, monthISO: string): MonthlyFortune {
  if (birthdate) {
    const { dominant } = calculateElementProfile(birthdate);
    const bank = MONTHLY_FORTUNE_BANK[dominant];
    const text = bank[pickVariant(`${birthdate}-${monthISO}`, bank.length)];
    return { element: dominant, text };
  }
  const text = GENERIC_MONTHLY_FORTUNE[pickVariant(monthISO, GENERIC_MONTHLY_FORTUNE.length)];
  return { element: null, text };
}
