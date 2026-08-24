import {
  ELEMENT_BANK,
  calculateElementProfile,
  describeDistribution,
  pickVariant,
  getSeasonType,
  type ElementKey,
} from "./elements";
import { mbtiToTemperament, type Temperament } from "./temperament";
import { getAffinityCategory, AFFINITY_BANK, calculateAffinityScore, type AffinityCategory } from "./affinity";

export interface ComputeResultInput {
  ownerName: string;
  ownerMbti: string;
  ownerElement: ElementKey;
  visitorName: string;
  visitorMbti: string;
  visitorBirthdate: string; // ISO yyyy-mm-dd
  visitorIsLunar?: boolean;
  visitorBirthTime?: string; // "HH:mm", optional
}

export interface ComputeResultOutput {
  visitorElement: ElementKey;
  visitorTemperament: Temperament;
  ownerTemperament: Temperament;
  affinityCategory: AffinityCategory;
  affinityLabel: string;
  affinityEmoji: string;
  affinityScore: number;
  affinityBlurb: string;
  seasonType: string;
  title: string;
  elementBlurb: string;
  distribution: Record<ElementKey, number>;
  distributionBlurb: string;
  pillarText: string;
  hasTimeInput: boolean;
}

// Pure, deterministic — no network/AI calls. The visitor's element comes from
// a real 사주팔자 calculation (elements.ts), and the "귀인/단짝/내 사람/오른팔/
// 호랑이 선생" relationship comes from the classical 오행 상생상극(相生相剋)
// cycle between the owner's and visitor's element (affinity.ts) — a fixed 5x5
// lookup, not an AI call. MBTI is still collected and stored per entry but no
// longer drives the headline relationship (kept for potential future use).
export function computeResult(input: ComputeResultInput): ComputeResultOutput {
  const ownerTemperament = mbtiToTemperament(input.ownerMbti);
  const visitorTemperament = mbtiToTemperament(input.visitorMbti);
  const profile = calculateElementProfile(input.visitorBirthdate, input.visitorBirthTime, {
    isLunar: input.visitorIsLunar || undefined,
  });

  const element = ELEMENT_BANK[profile.dominant];
  const variantIndex = pickVariant(`${input.visitorName}-${input.visitorBirthdate}`, element.blurbs.length);
  const elementBlurb = element.blurbs[variantIndex];
  const distributionBlurb = describeDistribution(profile.distribution);
  const seasonType = getSeasonType(profile.dominant, input.visitorBirthdate);

  const affinityCategory = getAffinityCategory(input.ownerElement, profile.dominant);
  const affinity = AFFINITY_BANK[affinityCategory];
  const affinityScore = calculateAffinityScore(
    affinityCategory,
    `${input.visitorName}-${input.visitorBirthdate}-score`
  );
  const affinityBlurb = affinity.blurb(input.ownerElement, profile.dominant);

  const title = `${input.visitorName}님은 ${input.ownerName}님의 ${affinity.label}이에요`;

  return {
    visitorElement: profile.dominant,
    visitorTemperament,
    ownerTemperament,
    affinityCategory,
    affinityLabel: affinity.label,
    affinityEmoji: affinity.emoji,
    affinityScore,
    affinityBlurb,
    seasonType,
    title,
    elementBlurb,
    distribution: profile.distribution,
    distributionBlurb,
    pillarText: profile.pillarText,
    hasTimeInput: profile.hasTimeInput,
  };
}
