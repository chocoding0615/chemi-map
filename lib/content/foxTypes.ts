import type { ElementKey } from "@/lib/result-engine/elements";

// 여우상 관련 카피는 전부 이 파일 하나에서만 관리한다 — 로직(lib/result-engine/foxType.ts)은
// 이 데이터를 조합만 하고 문구를 직접 갖고 있지 않는다.

export interface FoxBaseEntry {
  name: string; // 기본 라벨(MBTI 없을 때 그대로 노출) — 회귀 방지를 위해 바꾸지 않는다.
  tagline: string;
  color: string;
  bg: string;
  prop: string; // 소품 이모지 — 캐릭터 이미지가 없을 때의 폴백이기도 하다.
  img: string; // public/ 경로. 파일이 없으면 FoxCharacterImage가 자동으로 prop 이모지로 대체한다.
}

// 오행 5종 기본 여우상(기존 유지) — 캐릭터 이미지(public/fox/*.png)는 별도 제공 예정.
export const FOX_BASE: Record<ElementKey, FoxBaseEntry> = {
  wood: {
    name: "새싹여우상",
    tagline: "쑥쑥 자라나는 성장형 여우",
    color: "#6BBF59",
    bg: "#EAF6E6",
    prop: "🌱",
    img: "/fox/sprout.png",
  },
  fire: {
    name: "불꽃여우상",
    tagline: "반짝반짝 빛나는 열정형 여우",
    color: "#F0663F",
    bg: "#FDEAE2",
    prop: "🔥",
    img: "/fox/flame.png",
  },
  earth: {
    name: "달빛여우상",
    tagline: "든든하고 포근한 중심형 여우",
    color: "#E0A82E",
    bg: "#FBF1DA",
    prop: "🌙",
    img: "/fox/moon.png",
  },
  metal: {
    name: "서리여우상",
    tagline: "단단하고 야무진 결단형 여우",
    color: "#8FA3B0",
    bg: "#EEF2F5",
    prop: "❄️",
    img: "/fox/frost.png",
  },
  water: {
    name: "잔잔물여우상",
    tagline: "속 깊고 지혜로운 여우",
    color: "#3E92CC",
    bg: "#E6F1F9",
    prop: "💧",
    img: "/fox/water.png",
  },
};

export type ModifierKey = "JN" | "JS" | "PN" | "PS";

// MBTI 수식어 — J/P(리듬) × N/S(시선) 조합.
export const MODIFIERS: Record<ModifierKey, string> = {
  JN: "차분히 꿈꾸는",
  JS: "단단히 현실적인",
  PN: "자유롭게 꿈꾸는",
  PS: "가볍게 현실적인",
};

export interface MatchTagEntry {
  label: string;
  desc: string;
}

// 궁합 태그 — 오행 방향과 MBTI 방향의 일치도(binary).
export const MATCH_TAGS: { aligned: MatchTagEntry; reversed: MatchTagEntry } = {
  aligned: {
    label: "타고난 결 그대로",
    desc: "타고난 기운과 성격이 같은 곳을 바라보는 타입이에요. 결이 하나로 흘러서, 한번 방향을 정하면 흔들림이 적어요.",
  },
  reversed: {
    label: "반전 매력형",
    desc: "타고난 기운과 겉으로 드러나는 성격이 살짝 다른 타입이에요. 겪어볼수록 의외의 면이 나와서, 쉽게 질리지 않는 매력이 있어요.",
  },
};

// 특정 (오행 x 수식어) 조합에만 붙는 특별 카피 — 있으면 기본 설명 뱅크 대신 이걸 쓴다.
export const SPECIAL_COMBOS: Partial<Record<`${ElementKey}-${ModifierKey}`, string>> = {
  "wood-PN":
    "호기심이 이끄는 대로 뻗어나가는 새싹여우예요. 오늘 문득 떠오른 생각이 내일의 시작이 되는, 가능성으로 가득한 타입.",
  "fire-JN": "뜨거운 마음에 또렷한 계획까지 얹은 불꽃여우예요. 한번 불붙으면 끝을 보는 추진력이 남달라요.",
  "water-JN": "고요한 물결 아래 깊은 계획이 흐르는 잔잔물여우예요. 말수는 적어도 머릿속은 늘 몇 수 앞을 그리고 있어요.",
  "metal-PS": "원칙은 뚜렷하지만 순간의 흐름도 즐길 줄 아는 서리여우예요. 단호함과 여유를 오가는 균형 감각이 매력이에요.",
  "earth-PN": "든든한 중심에 상상력을 더한 달빛여우예요. 곁에 있으면 편안한데, 가끔 툭 던지는 아이디어가 신선해요.",
};

// 기본 설명 뱅크(오행별 변형, 결정론적으로 하나 선택) — SPECIAL_COMBOS에 해당하지
// 않을 때 쓰인다.
export const FOX_TYPE_DESCRIPTIONS: Record<ElementKey, string[]> = {
  wood: [
    "호기심 많고 배우는 걸 좋아하는 여우예요. 한번 마음먹은 건 끝까지 밀고 나가는 뚝심이 있어서, 주변에서 '쟤 또 뭔가 시작했네' 소리를 자주 들어요.",
    "새로운 걸 시도하는 데 겁이 없는 여우예요. 뿌리내린 관계는 오래 지켜가는 편이라, 오래된 인연일수록 더 깊어지는 타입이에요.",
  ],
  fire: [
    "가는 곳마다 분위기를 밝히는 여우예요. 감정에 솔직하고 리액션이 커서, 옆에 있으면 심심할 틈이 없어요.",
    "좋아하는 일 앞에서는 누구보다 뜨거워지는 여우예요. 하고 싶은 말은 참지 않고 시원하게 표현하는 편이에요.",
  ],
  earth: [
    "든든하고 포근한 중심을 가진 여우예요. 화려하게 나서진 않지만, 힘든 일이 생기면 다들 가장 먼저 찾게 되는 존재예요.",
    "누구든 편하게 받아주는 포용력 넓은 여우예요. 겉으론 무던해 보여도 속으론 은근히 세심하게 챙겨요.",
  ],
  metal: [
    "야무지고 똑부러지는 여우예요. 디테일을 놓치지 않는 완벽주의 기질이 있어서, 한번 맡은 일은 확실하게 해내요.",
    "판단이 빠르고 명확한 여우예요. 겉으로는 냉철해 보여도, 한번 믿은 사람은 끝까지 챙기는 의리파예요.",
  ],
  water: [
    "겉은 조용해도 속엔 생각이 참 많은 여우예요. 상황 파악이 빨라서, 알아갈수록 매력이 깊어지는 타입이에요.",
    "상황에 맞춰 유연하게 움직이는 여우예요. 부드러운 인상 뒤에 의외로 단단한 심지를 갖고 있어요.",
  ],
};
