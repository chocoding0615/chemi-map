import type { Temperament } from "./result-engine/temperament";
import type { ElementKey } from "./result-engine/elements";

export interface MapDoc {
  slug: string;
  ownerName: string;
  ownerMbti: string;
  ownerBirthdate: string;
  ownerElement: ElementKey;
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
  visitorElement: ElementKey;
  visitorTemperament: Temperament;
  resultTitle: string;
  resultElementBlurb: string;
  resultRelationshipBlurb: string;
  createdAt: string;
}
