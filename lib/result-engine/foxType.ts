import { pickVariant, type ElementKey } from "./elements";

export interface FoxTypeEntry {
  name: string;
  tagline: string;
  prop: "brush" | "scroll" | "heart" | "star";
  descriptions: string[];
}

// 오행별 여우상 5종. 생일만으로 결정되는 dominant 오행에 그대로 매핑해서,
// 별도의 새 판정 로직 없이 기존 사주 엔진을 그대로 재사용한다.
export const FOX_TYPE_BANK: Record<ElementKey, FoxTypeEntry> = {
  wood: {
    name: "새싹여우상",
    tagline: "쑥쑥 자라나는 성장형 여우",
    prop: "scroll",
    descriptions: [
      "호기심 많고 배우는 걸 좋아하는 여우예요. 한번 마음먹은 건 끝까지 밀고 나가는 뚝심이 있어서, 주변에서 '쟤 또 뭔가 시작했네' 소리를 자주 들어요.",
      "새로운 걸 시도하는 데 겁이 없는 여우예요. 뿌리내린 관계는 오래 지켜가는 편이라, 오래된 인연일수록 더 깊어지는 타입이에요.",
    ],
  },
  fire: {
    name: "반짝불꽃여우상",
    tagline: "에너지 넘치는 인기형 여우",
    prop: "star",
    descriptions: [
      "가는 곳마다 분위기를 밝히는 여우예요. 감정에 솔직하고 리액션이 커서, 옆에 있으면 심심할 틈이 없어요.",
      "좋아하는 일 앞에서는 누구보다 뜨거워지는 여우예요. 하고 싶은 말은 참지 않고 시원하게 표현하는 편이에요.",
    ],
  },
  earth: {
    name: "포근흙여우상",
    tagline: "듬직하게 챙겨주는 여우",
    prop: "heart",
    descriptions: [
      "묵묵히 중심을 잡아주는 여우예요. 화려하게 나서진 않지만, 힘든 일이 생기면 다들 가장 먼저 찾게 되는 존재예요.",
      "누구든 편하게 받아주는 포용력 넓은 여우예요. 겉으론 무던해 보여도 속으론 은근히 세심하게 챙겨요.",
    ],
  },
  metal: {
    name: "칼끝여우상",
    tagline: "야무지고 똑부러지는 여우",
    prop: "brush",
    descriptions: [
      "맺고 끊는 게 분명한 여우예요. 디테일을 놓치지 않는 완벽주의 기질이 있어서, 한번 맡은 일은 확실하게 해내요.",
      "판단이 빠르고 명확한 여우예요. 겉으로는 냉철해 보여도, 한번 믿은 사람은 끝까지 챙기는 의리파예요.",
    ],
  },
  water: {
    name: "잔잔물여우상",
    tagline: "속 깊고 지혜로운 여우",
    prop: "scroll",
    descriptions: [
      "겉은 조용해도 속엔 생각이 참 많은 여우예요. 상황 파악이 빨라서, 알아갈수록 매력이 깊어지는 타입이에요.",
      "상황에 맞춰 유연하게 움직이는 여우예요. 부드러운 인상 뒤에 의외로 단단한 심지를 갖고 있어요.",
    ],
  },
};

export function getFoxType(element: ElementKey, seed: string): { entry: FoxTypeEntry; description: string } {
  const entry = FOX_TYPE_BANK[element];
  const description = entry.descriptions[pickVariant(seed, entry.descriptions.length)];
  return { entry, description };
}
