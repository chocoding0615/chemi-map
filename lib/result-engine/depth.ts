import { pickVariant, type ElementKey } from "./elements";

// "성향(오행 블러브)"만으로는 결과가 얕게 느껴진다는 피드백에 맞춰, 모든 운세 결과에
// 공통으로 붙는 두 섹션(조언/주의할 점)과 행운 정보를 오행별로 추가한다.
// 카테고리마다 따로 쓰지 않고 오행 5종 기준으로만 관리해서, 카테고리가 늘어나도
// 손으로 쓸 문구가 늘어나지 않는다 — compute.ts의 "콘텐츠 뱅크는 최소로" 원칙 유지.

const ADVICE_BANK: Record<ElementKey, string[]> = {
  wood: [
    "지금 배우고 있는 것에 조금만 더 시간을 투자해보세요. 생각보다 빨리 결실이 보여요.",
    "혼자 끌고 가기보다 주변에 도움을 청해보세요. 함께할 때 훨씬 크게 자라나요.",
  ],
  fire: [
    "마음속 열정을 숨기지 말고 겉으로 표현해보세요. 그게 오히려 좋은 기회를 불러와요.",
    "하고 싶은 말이 있다면 오늘 안에 해보세요. 타이밍이 중요한 시기예요.",
  ],
  earth: [
    "서두르지 말고 원래 하던 대로 꾸준히 가보세요. 그게 가장 빠른 길이에요.",
    "누군가 도움을 청하면 기꺼이 손을 내밀어보세요. 돌아오는 게 클 거예요.",
  ],
  metal: [
    "미뤄둔 결정이 있다면 지금 내려보세요. 판단력이 유독 좋은 시기예요.",
    "디테일 하나를 더 챙기면 결과가 확실히 달라지는 시기예요.",
  ],
  water: [
    "혼자 생각할 시간을 충분히 가져보세요. 답은 이미 마음속에 있어요.",
    "너무 재지 말고 한 번쯤 직감을 믿고 움직여봐도 좋아요.",
  ],
};

const CAUTION_BANK: Record<ElementKey, string[]> = {
  wood: [
    "욕심내서 한 번에 너무 많이 벌이면 지칠 수 있어요. 하나씩 순서대로 가세요.",
    "새로운 것에 정신이 팔려 원래 하던 걸 소홀히 하지 않도록 조심하세요.",
  ],
  fire: [
    "감정이 앞서서 실수하기 쉬운 시기예요. 중요한 말은 한 번 더 생각하고 하세요.",
    "너무 빨리 태우면 금방 지칠 수 있어요. 페이스 조절이 필요해요.",
  ],
  earth: [
    "너무 신중하다가 타이밍을 놓칠 수 있어요. 가끔은 결단이 필요해요.",
    "혼자 다 짊어지려 하지 마세요. 부담을 나누는 것도 능력이에요.",
  ],
  metal: [
    "원칙을 지키다가 융통성을 잃지 않도록 조심하세요. 가끔은 예외도 필요해요.",
    "완벽하려다 시작이 늦어질 수 있어요. 70%만 준비돼도 일단 움직여보세요.",
  ],
  water: [
    "생각이 너무 많아지면 오히려 결정이 늦어져요. 마감 시한을 정해두세요.",
    "속마음을 너무 감추면 오해를 살 수 있어요. 가끔은 먼저 표현해보세요.",
  ],
};

const LUCKY_COLOR: Record<ElementKey, string> = {
  wood: "초록색",
  fire: "빨간색",
  earth: "황토색",
  metal: "흰색",
  water: "남색",
};

const LUCKY_ITEM: Record<ElementKey, string> = {
  wood: "작은 화분",
  fire: "향초",
  earth: "도자기 소품",
  metal: "은색 액세서리",
  water: "유리컵",
};

export interface FortuneDepth {
  advice: string;
  caution: string;
  luckyColor: string;
  luckyItem: string;
}

export function getFortuneDepth(element: ElementKey, seed: string): FortuneDepth {
  const adviceBank = ADVICE_BANK[element];
  const cautionBank = CAUTION_BANK[element];
  return {
    advice: adviceBank[pickVariant(`${seed}-advice`, adviceBank.length)],
    caution: cautionBank[pickVariant(`${seed}-caution`, cautionBank.length)],
    luckyColor: LUCKY_COLOR[element],
    luckyItem: LUCKY_ITEM[element],
  };
}
