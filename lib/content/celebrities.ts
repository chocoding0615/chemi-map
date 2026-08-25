import type { ElementKey } from "@/lib/result-engine/elements";

// 사주 궁합 유명인 매칭용 큐레이션 데이터.
// 실제 유명인의 정확한 생시는 대부분 비공개라 진짜 사주 계산은 불가능하다 - 대신
// 오행이 상징하는 이미지(목=성장/창의, 화=열정/표현, 토=안정/신뢰, 금=예리함/절제,
// 수=차분함/지혜)에 어울리는 인물을 사람이 직접 골라 배정한 "이미지 매칭"이다.
//
// wikiTitle은 위키피디아 REST API(page/summary)에 그대로 넣을 문서 제목이다 -
// 새 인물을 추가하면 반드시 아래 명령으로 썸네일이 정상 반환되는지 먼저 확인할 것:
//   curl -s "https://{wikiLang}.wikipedia.org/api/rest_v1/page/summary/{encodeURIComponent(wikiTitle)}"
export interface CelebrityEntry {
  id: string;
  name: string;
  gender: "male" | "female";
  wikiTitle: string;
  wikiLang: "ko" | "en";
  blurb: string;
}

export const CELEBRITY_BANK: Record<ElementKey, CelebrityEntry[]> = {
  wood: [
    { id: "gdragon", name: "지드래곤", gender: "male", wikiTitle: "지드래곤", wikiLang: "ko", blurb: "장르를 계속 새로 만들어내는 창작력이 나무처럼 뻗어나가는 기운과 닮았어요." },
    { id: "bongjoonho", name: "봉준호", gender: "male", wikiTitle: "봉준호", wikiLang: "ko", blurb: "익숙한 걸 비틀어 완전히 새로운 이야기로 키워내는 성장형 상상력이에요." },
    { id: "stevejobs", name: "스티브 잡스", gender: "male", wikiTitle: "Steve Jobs", wikiLang: "en", blurb: "없던 걸 처음부터 자라나게 만드는 개척자적 기운이 목(木)과 잘 어울려요." },
    { id: "iu", name: "아이유", gender: "female", wikiTitle: "아이유", wikiLang: "ko", blurb: "매번 새로운 장르로 옮겨가면서도 꾸준히 성장하는 모습이 나무의 기운이에요." },
    { id: "taylorswift", name: "테일러 스위프트", gender: "female", wikiTitle: "Taylor Swift", wikiLang: "en", blurb: "매 앨범 스스로를 새로 써 내려가는 창작력이 성장의 기운과 통해요." },
    { id: "jisoo", name: "지수", gender: "female", wikiTitle: "지수 (가수)", wikiLang: "ko", blurb: "그룹과 솔로 양쪽에서 계속 새 영역을 넓혀가는 성장형 아티스트예요." },
  ],
  fire: [
    { id: "ronaldo", name: "크리스티아누 호날두", gender: "male", wikiTitle: "Cristiano Ronaldo", wikiLang: "en", blurb: "경기장을 태우는 승부욕과 자기표현 에너지가 화(火)의 기운 그 자체예요." },
    { id: "trump", name: "도널드 트럼프", gender: "male", wikiTitle: "Donald Trump", wikiLang: "en", blurb: "어디서든 시선을 끄는 강렬한 존재감이 불의 기운과 닮았어요." },
    { id: "madongseok", name: "마동석", gender: "male", wikiTitle: "마동석", wikiLang: "ko", blurb: "화면을 뚫고 나오는 듯한 에너지와 화끈한 존재감이 매력이에요." },
    { id: "beyonce", name: "비욘세", gender: "female", wikiTitle: "Beyoncé", wikiLang: "en", blurb: "무대 위에서 폭발하는 카리스마가 불의 기운을 대표해요." },
    { id: "rihanna", name: "리한나", gender: "female", wikiTitle: "Rihanna", wikiLang: "en", blurb: "거침없는 자기표현과 화려한 존재감이 화(火)의 매력이에요." },
    { id: "jennie", name: "제니", gender: "female", wikiTitle: "제니 (1996년)", wikiLang: "ko", blurb: "무대를 장악하는 강렬한 카리스마가 불의 기운을 닮았어요." },
  ],
  earth: [
    { id: "yoojaesuk", name: "유재석", gender: "male", wikiTitle: "유재석", wikiLang: "ko", blurb: "오랜 시간 흔들림 없이 신뢰를 쌓아온 안정감이 토(土)의 기운이에요." },
    { id: "billgates", name: "빌 게이츠", gender: "male", wikiTitle: "Bill Gates", wikiLang: "en", blurb: "긴 호흡으로 꾸준히 쌓아 올리는 신중함이 흙의 기운과 닮았어요." },
    { id: "sonheungmin", name: "손흥민", gender: "male", wikiTitle: "손흥민", wikiLang: "ko", blurb: "묵묵히 꾸준함을 쌓아 결과로 증명하는 성실함이 토(土)의 매력이에요." },
    { id: "oprah", name: "오프라 윈프리", gender: "female", wikiTitle: "Oprah Winfrey", wikiLang: "en", blurb: "누구든 편하게 마음을 터놓게 만드는 포용력이 흙의 기운이에요." },
    { id: "kimtaehee", name: "김태희", gender: "female", wikiTitle: "김태희", wikiLang: "ko", blurb: "오랫동안 변함없는 안정적인 이미지가 토(土)의 신뢰감과 닮았어요." },
    { id: "michelleobama", name: "미셸 오바마", gender: "female", wikiTitle: "Michelle Obama", wikiLang: "en", blurb: "단단한 중심을 지키며 주변을 든든하게 받쳐주는 힘이에요." },
  ],
  metal: [
    { id: "faker", name: "페이커", gender: "male", wikiTitle: "페이커", wikiLang: "ko", blurb: "군더더기 없는 판단력과 절제된 실행력이 금(金)의 예리함이에요." },
    { id: "elonmusk", name: "일론 머스크", gender: "male", wikiTitle: "Elon Musk", wikiLang: "en", blurb: "복잡한 문제를 날카롭게 잘라내는 공학적 사고가 쇠의 기운과 닮았어요." },
    { id: "jungkook", name: "정국", gender: "male", wikiTitle: "정국 (가수)", wikiLang: "ko", blurb: "칼같이 정확한 무대 완성도가 금(金)의 정교함을 보여줘요." },
    { id: "kimyuna", name: "김연아", gender: "female", wikiTitle: "김연아", wikiLang: "ko", blurb: "0.01초까지 다듬는 완벽주의가 금(金)의 예리함 그 자체예요." },
    { id: "serenawilliams", name: "세레나 윌리엄스", gender: "female", wikiTitle: "Serena Williams", wikiLang: "en", blurb: "결정적인 순간 흔들리지 않는 냉철함이 쇠의 기운과 닮았어요." },
    { id: "rose", name: "로제", gender: "female", wikiTitle: "로제 (가수)", wikiLang: "ko", blurb: "절제된 감정 표현 속에 담긴 정교함이 금(金)의 매력이에요." },
  ],
  water: [
    { id: "obama", name: "버락 오바마", gender: "male", wikiTitle: "Barack Obama", wikiLang: "en", blurb: "어떤 상황에서도 흔들리지 않는 차분함과 깊이가 수(水)의 기운이에요." },
    { id: "leebyunghun", name: "이병헌", gender: "male", wikiTitle: "이병헌", wikiLang: "ko", blurb: "말을 아끼면서도 깊은 무게감을 전하는 연기가 물의 기운과 닮았어요." },
    { id: "gongyoo", name: "공유", gender: "male", wikiTitle: "Gong Yoo", wikiLang: "en", blurb: "잔잔하지만 깊게 스며드는 분위기가 수(水)의 매력이에요." },
    { id: "sonyejin", name: "손예진", gender: "female", wikiTitle: "손예진", wikiLang: "ko", blurb: "은은하게 깊어지는 존재감이 물처럼 스며드는 기운이에요." },
    { id: "hansohee", name: "한소희", gender: "female", wikiTitle: "한소희", wikiLang: "ko", blurb: "잔잔한 얼굴 아래 깊은 감정을 담아내는 힘이 수(水)의 기운이에요." },
    { id: "emmawatson", name: "엠마 왓슨", gender: "female", wikiTitle: "Emma Watson", wikiLang: "en", blurb: "차분하고 사려 깊은 태도로 자기 길을 지켜가는 모습이 물의 지혜예요." },
  ],
};
