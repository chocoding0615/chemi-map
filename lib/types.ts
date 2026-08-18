import type { Temperament } from "./result-engine/temperament";
import type { ElementKey } from "./result-engine/elements";
import type { AffinityCategory } from "./result-engine/affinity";
import type { EquipmentSlot } from "./result-engine/equipment";

export type Gender = "male" | "female";

export interface MapDoc {
  slug: string;
  ownerName: string;
  ownerGender: Gender;
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
  affinityCategory: AffinityCategory;
  affinityScore: number;
  equipmentSlot: EquipmentSlot | null;
  seasonType: string;
  resultTitle: string;
  resultElementBlurb: string;
  resultAffinityBlurb: string;
  resultDistributionBlurb: string;
  resultPillarText: string;
  createdAt: string;
}
