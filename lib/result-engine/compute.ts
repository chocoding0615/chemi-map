import { ANIMAL_BANK, zodiacFromYear, type ZodiacKey } from "./animals";
import { RELATIONSHIP_BANK, TEMPERAMENT_LABEL, mbtiToTemperament, type Temperament } from "./temperament";

export interface ComputeResultInput {
  ownerName: string;
  ownerMbti: string;
  visitorName: string;
  visitorMbti: string;
  visitorBirthdate: string; // ISO yyyy-mm-dd, only the year is used
}

export interface ComputeResultOutput {
  visitorZodiac: ZodiacKey;
  visitorTemperament: Temperament;
  ownerTemperament: Temperament;
  title: string;
  animalBlurb: string;
  relationshipBlurb: string;
}

// Pure, deterministic — no network/AI calls. Combines the 12-animal bank and
// the 4x4 temperament bank so ~28 hand-written blurbs cover every input combo.
export function computeResult(input: ComputeResultInput): ComputeResultOutput {
  const ownerTemperament = mbtiToTemperament(input.ownerMbti);
  const visitorTemperament = mbtiToTemperament(input.visitorMbti);
  const visitorYear = Number(input.visitorBirthdate.slice(0, 4));
  const visitorZodiac = zodiacFromYear(visitorYear);

  const animal = ANIMAL_BANK[visitorZodiac];
  const relationshipBlurb = RELATIONSHIP_BANK[ownerTemperament][visitorTemperament];

  const title = `${input.visitorName}님은 ${input.ownerName}님에게 ${animal.emoji} ${animal.label} 같은 ${TEMPERAMENT_LABEL[visitorTemperament]}예요`;

  return {
    visitorZodiac,
    visitorTemperament,
    ownerTemperament,
    title,
    animalBlurb: animal.blurb,
    relationshipBlurb,
  };
}
