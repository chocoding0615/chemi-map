import { ELEMENT_BANK, elementFromBirthdate, type ElementKey } from "./elements";
import { RELATIONSHIP_BANK, TEMPERAMENT_LABEL, mbtiToTemperament, type Temperament } from "./temperament";

export interface ComputeResultInput {
  ownerName: string;
  ownerMbti: string;
  visitorName: string;
  visitorMbti: string;
  visitorBirthdate: string; // ISO yyyy-mm-dd
}

export interface ComputeResultOutput {
  visitorElement: ElementKey;
  visitorTemperament: Temperament;
  ownerTemperament: Temperament;
  title: string;
  elementBlurb: string;
  relationshipBlurb: string;
}

// Pure, deterministic — no network/AI calls. The element comes from a real
// day-pillar (일주) calculation (see elements.ts), and the relationship line
// comes from the 4x4 temperament bank, so a small set of hand-written blurbs
// covers every input combo.
export function computeResult(input: ComputeResultInput): ComputeResultOutput {
  const ownerTemperament = mbtiToTemperament(input.ownerMbti);
  const visitorTemperament = mbtiToTemperament(input.visitorMbti);
  const visitorElement = elementFromBirthdate(input.visitorBirthdate);

  const element = ELEMENT_BANK[visitorElement];
  const relationshipBlurb = RELATIONSHIP_BANK[ownerTemperament][visitorTemperament];

  const title = `${input.visitorName}님은 ${input.ownerName}님에게 ${element.label}(${element.hanja}) 같은 ${TEMPERAMENT_LABEL[visitorTemperament]}예요`;

  return {
    visitorElement,
    visitorTemperament,
    ownerTemperament,
    title,
    elementBlurb: element.blurb,
    relationshipBlurb,
  };
}
