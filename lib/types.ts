import type { Temperament } from "./result-engine/temperament";
import type { ElementKey } from "./result-engine/elements";

export interface MapDoc {
  slug: string;
  ownerName: string;
  ownerMbti: string;
  ownerBirthdate: string;
  ownerBirthTime: string | null;
  ownerElement: ElementKey;
  ownerElementDistribution: Record<ElementKey, number>;
  ownerHasTimeInput: boolean;
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
  visitorBirthTime: string | null;
  visitorElement: ElementKey;
  visitorElementDistribution: Record<ElementKey, number>;
  visitorHasTimeInput: boolean;
  visitorTemperament: Temperament;
  resultTitle: string;
  resultElementBlurb: string;
  resultRelationshipBlurb: string;
  resultDistributionBlurb: string;
  resultPillarText: string;
  createdAt: string;
}
