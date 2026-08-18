import type { Temperament } from "./result-engine/temperament";
import type { ZodiacKey } from "./result-engine/animals";

export interface MapDoc {
  slug: string;
  ownerName: string;
  ownerMbti: string;
  ownerBirthdate: string;
  ownerZodiac: ZodiacKey;
  ownerTemperament: Temperament;
  entryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EntryDoc {
  id: string;
  visitorName: string;
  visitorMbti: string;
  visitorBirthdate: string;
  visitorZodiac: ZodiacKey;
  visitorTemperament: Temperament;
  resultTitle: string;
  resultAnimalBlurb: string;
  resultRelationshipBlurb: string;
  createdAt: string;
}
