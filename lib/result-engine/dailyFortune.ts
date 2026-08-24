import { calculateElementProfile, pickVariant, type ElementKey } from "./elements";
import { MBTI_ADVICE } from "@/lib/content/mbtiAdvice";
import type { MbtiType } from "./temperament";

export interface DailyFortuneCategory {
  label: string;
  /** 굵게 강조할 짧은 포인트 — 없으면(공용 문구) 굵게 처리 안 함 */
  point: string;
  /** 포인트를 풀어주는 일반체 설명 */
  detail: string;
}

// 오행별 "총운/직업운/연애운/금전운" 짧은 요약. 각 카테고리는 point(굵게)+detail(일반체)
// 한 쌍으로, 시드에 날짜가 들어가 자정마다 자연스럽게 다른 조합이 뽑힌다.
const CATEGORY_LABELS = ["총운", "직업운", "연애운", "금전운"] as const;
type CategoryKey = (typeof CATEGORY_LABELS)[number];

const DAILY_BANK: Record<ElementKey, Record<CategoryKey, DailyFortuneCategory[]>> = {
  wood: {
    총운: [
      { label: "총운", point: "새로운 시작이 잘 맞는 날", detail: "미뤄뒀던 걸 하나 꺼내보면 의외로 술술 풀려요." },
      { label: "총운", point: "관계가 자라나는 날", detail: "오랜만에 연락 한 번 해보면 반가운 소식이 따라올 수 있어요." },
    ],
    직업운: [
      { label: "직업운", point: "배움의 기회가 오는 날", detail: "새로운 걸 시도해보면 좋은 경험이 돼요." },
      { label: "직업운", point: "협업이 잘 풀리는 날", detail: "함께 하는 일에서 좋은 아이디어가 나와요." },
    ],
    연애운: [
      { label: "연애운", point: "자연스럽게 다가가기 좋은 날", detail: "먼저 다가가도 부담스럽지 않게 받아들여져요." },
      { label: "연애운", point: "관계가 천천히 자라는 날", detail: "조급해하지 않아도 흐름이 좋아요." },
    ],
    금전운: [
      { label: "금전운", point: "천천히 불어나는 흐름", detail: "장기적인 저축·투자가 잘 맞는 날이에요." },
      { label: "금전운", point: "작은 기회가 보이는 날", detail: "사소한 수입원도 눈여겨보세요." },
    ],
  },
  fire: {
    총운: [
      { label: "총운", point: "에너지가 넘치는 날", detail: "적극적으로 나서면 좋은 반응이 돌아와요." },
      { label: "총운", point: "존재감이 확 드러나는 날", detail: "사람들 앞에서 자신 있게 움직여도 좋아요." },
    ],
    직업운: [
      { label: "직업운", point: "발표·제안이 잘 통하는 날", detail: "주목받을 자리라면 미루지 마세요." },
      { label: "직업운", point: "추진력이 붙는 날", detail: "마음먹은 일을 속도감 있게 밀어붙여도 좋아요." },
    ],
    연애운: [
      { label: "연애운", point: "마음을 전하기 좋은 날", detail: "솔직하게 표현하면 확실히 전달돼요." },
      { label: "연애운", point: "설렘이 커지는 날", detail: "다만 너무 빨리 몰아가진 마세요." },
    ],
    금전운: [
      { label: "금전운", point: "돈의 흐름이 빨라지는 날", detail: "충동적인 지출만 조심하면 좋은 흐름이에요." },
      { label: "금전운", point: "과감하게 움직이면 좋은 날", detail: "예상보다 큰 수입이 생길 수 있어요." },
    ],
  },
  earth: {
    총운: [
      { label: "총운", point: "차분하게 흘러가는 날", detail: "서두르지 않아도 결국 잘 정리돼요." },
      { label: "총운", point: "신뢰가 쌓이는 날", detail: "묵묵히 하던 대로만 해도 인정받아요." },
    ],
    직업운: [
      { label: "직업운", point: "성실함이 빛나는 날", detail: "큰 변화보다 안정적인 성과가 어울려요." },
      { label: "직업운", point: "신뢰를 얻는 날", detail: "꾸준히 해온 게 좋은 평가로 돌아와요." },
    ],
    연애운: [
      { label: "연애운", point: "안정감이 매력이 되는 날", detail: "서두르지 않는 태도가 좋은 인상을 남겨요." },
      { label: "연애운", point: "신뢰가 쌓이는 날", detail: "꾸준함이 관계를 더 단단하게 만들어요." },
    ],
    금전운: [
      { label: "금전운", point: "지키는 게 유리한 날", detail: "무리한 투자보다 안정적인 선택이 나아요." },
      { label: "금전운", point: "차곡차곡 쌓이는 날", detail: "꾸준한 저축이 든든한 자산이 돼요." },
    ],
  },
  metal: {
    총운: [
      { label: "총운", point: "판단력이 또렷한 날", detail: "망설이던 결정을 내리기 딱 좋아요." },
      { label: "총운", point: "정리가 잘 되는 날", detail: "미뤄둔 일을 깔끔하게 마무리해보세요." },
    ],
    직업운: [
      { label: "직업운", point: "완성도로 인정받는 날", detail: "디테일까지 챙긴 결과물이 좋은 반응을 얻어요." },
      { label: "직업운", point: "결단이 필요한 날", detail: "원칙대로 판단하면 후회가 적어요." },
    ],
    연애운: [
      { label: "연애운", point: "확실한 마음이 통하는 날", detail: "애매한 관계는 오늘 정리해도 좋아요." },
      { label: "연애운", point: "예의 있는 태도가 빛나는 날", detail: "깔끔한 인상이 좋게 작용해요." },
    ],
    금전운: [
      { label: "금전운", point: "정리하면 도움이 되는 날", detail: "불필요한 지출은 과감히 줄여보세요." },
      { label: "금전운", point: "원칙 있는 소비가 빛나는 날", detail: "계획적인 소비가 확실한 결과로 돌아와요." },
    ],
  },
  water: {
    총운: [
      { label: "총운", point: "생각이 깊어지는 날", detail: "혼자만의 시간을 가지면 답이 보여요." },
      { label: "총운", point: "유연하게 흘러가는 날", detail: "상황에 맞춰 움직이면 오히려 기회가 돼요." },
    ],
    직업운: [
      { label: "직업운", point: "한 발 앞서 보이는 날", detail: "상황을 유연하게 살피면 유리해요." },
      { label: "직업운", point: "정보가 도움이 되는 날", detail: "주변 얘기를 잘 들어보면 힌트를 얻어요." },
    ],
    연애운: [
      { label: "연애운", point: "진심이 은근히 전해지는 날", detail: "말하지 않아도 상대는 알아챌 수 있어요." },
      { label: "연애운", point: "여유로운 태도가 매력적인 날", detail: "서두르지 않아도 관계는 잘 흘러가요." },
    ],
    금전운: [
      { label: "금전운", point: "흐름을 잘 타면 유리한 날", detail: "정보를 살피면 기회가 보여요." },
      { label: "금전운", point: "유연한 대응이 필요한 날", detail: "지출을 줄이기보다 흐름을 잘 타보세요." },
    ],
  },
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
  categories: DailyFortuneCategory[];
  mbtiTip: string | null;
}

function getMbtiDailyTip(mbti: MbtiType, dateISO: string): string {
  const entry = MBTI_ADVICE[mbti];
  const pool = [...entry.avoid, ...entry.embrace];
  return pool[pickVariant(`${mbti}-${dateISO}-dailytip`, pool.length)];
}

export function getDailyFortune(
  birthdate: string | null,
  dateISO: string,
  isLunar = false,
  mbti?: MbtiType
): DailyFortune {
  const mbtiTip = mbti ? getMbtiDailyTip(mbti, dateISO) : null;

  if (birthdate) {
    const { dominant } = calculateElementProfile(birthdate, undefined, { isLunar: isLunar || undefined });
    const bank = DAILY_BANK[dominant];
    const categories = CATEGORY_LABELS.map((key) => {
      const pool = bank[key];
      return pool[pickVariant(`${birthdate}-${dateISO}-${key}`, pool.length)];
    });
    return { element: dominant, categories, mbtiTip };
  }

  const text = GENERIC_DAILY_FORTUNE[pickVariant(dateISO, GENERIC_DAILY_FORTUNE.length)];
  return { element: null, categories: [{ label: "오늘의 기운", point: "", detail: text }], mbtiTip };
}
