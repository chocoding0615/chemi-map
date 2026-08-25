import { ELEMENT_ORDER, pickVariant, type ElementKey } from "./elements";
import { getAffinityCategory, AFFINITY_BANK } from "./affinity";
import { CELEBRITY_BANK, type CelebrityEntry } from "@/lib/content/celebrities";

// 나(dominant)와 가장 잘 맞는 오행을 찾는다 - 5개 오행 후보 전부에 상생/상극 관계를
// 매겨서 점수(AFFINITY_BANK.scoreBase)가 가장 높은 쪽을 고른다. 동점은 없다
// (5개 카테고리가 서로 다른 scoreBase를 가지고 있어서 오행마다 점수가 전부 다르다).
export function getBestMatchingElement(dominant: ElementKey): ElementKey {
  return ELEMENT_ORDER.reduce((best, candidate) => {
    const bestScore = AFFINITY_BANK[getAffinityCategory(dominant, best)].scoreBase;
    const candidateScore = AFFINITY_BANK[getAffinityCategory(dominant, candidate)].scoreBase;
    return candidateScore > bestScore ? candidate : best;
  }, ELEMENT_ORDER[0]);
}

export interface CelebrityMatches {
  male: CelebrityEntry;
  female: CelebrityEntry;
}

// 사용자 성별과 무관하게 항상 남/녀 유명인을 한 명씩 뽑는다. 같은 seed면 항상 같은
// 결과가 나오도록 pickVariant(결정론적 해시)를 쓴다 - 새로고침해도 매칭이 안 바뀐다.
export function getCelebrityMatches(dominant: ElementKey, seed: string): CelebrityMatches {
  const pool = CELEBRITY_BANK[getBestMatchingElement(dominant)];
  const males = pool.filter((c) => c.gender === "male");
  const females = pool.filter((c) => c.gender === "female");
  return {
    male: males[pickVariant(`${seed}-male`, males.length)],
    female: females[pickVariant(`${seed}-female`, females.length)],
  };
}
