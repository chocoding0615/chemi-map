import {
  ELEMENT_BANK,
  calculateElementProfile,
  describeDistribution,
  pickVariant,
  type ElementKey,
} from "./elements";
import { RELATIONSHIP_BANK, TEMPERAMENT_LABEL, mbtiToTemperament, type Temperament } from "./temperament";

export interface ComputeResultInput {
  ownerName: string;
  ownerMbti: string;
  visitorName: string;
  visitorMbti: string;
  visitorBirthdate: string; // ISO yyyy-mm-dd
  visitorBirthTime?: string; // "HH:mm", optional
}

export interface ComputeResultOutput {
  visitorElement: ElementKey;
  visitorTemperament: Temperament;
  ownerTemperament: Temperament;
  title: string;
  elementBlurb: string;
  relationshipBlurb: string;
  distribution: Record<ElementKey, number>;
  distributionBlurb: string;
  pillarText: string;
  hasTimeInput: boolean;
}

// Pure, deterministic — no network/AI calls. The element profile comes from a
// real 사주팔자 calculation (see elements.ts), the relationship line from the
// 4x4 temperament bank, and the blurb variant from a seeded hash — so a small
// hand-written content set covers every input combo, and results are stable
// across reloads.
export function computeResult(input: ComputeResultInput): ComputeResultOutput {
  const ownerTemperament = mbtiToTemperament(input.ownerMbti);
  const visitorTemperament = mbtiToTemperament(input.visitorMbti);
  const profile = calculateElementProfile(input.visitorBirthdate, input.visitorBirthTime);

  const element = ELEMENT_BANK[profile.dominant];
  const relationshipBlurb = RELATIONSHIP_BANK[ownerTemperament][visitorTemperament];
  const variantIndex = pickVariant(`${input.visitorName}-${input.visitorBirthdate}`, element.blurbs.length);
  const elementBlurb = element.blurbs[variantIndex];
  const distributionBlurb = describeDistribution(profile.distribution);

  const title = `${input.visitorName}님은 ${input.ownerName}님에게 ${element.label}(${element.hanja}) 같은 ${TEMPERAMENT_LABEL[visitorTemperament]}예요`;

  return {
    visitorElement: profile.dominant,
    visitorTemperament,
    ownerTemperament,
    title,
    elementBlurb,
    relationshipBlurb,
    distribution: profile.distribution,
    distributionBlurb,
    pillarText: profile.pillarText,
    hasTimeInput: profile.hasTimeInput,
  };
}
