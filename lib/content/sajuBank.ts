import type { TenGodGroup } from "@/lib/result-engine/sajuDetail";
import gapjaData from "./generated/gapjaBank.json";
import dayMasterData from "./generated/dayMasterBank.json";
import yongsinData from "./generated/yongsinBank.json";
import gyeokgukData from "./generated/gyeokgukBank.json";

// 구글시트("여우점_사주콘텐츠뱅크")에서 scripts/sync-saju-content.js로 동기화한 정적 콘텐츠.
// 런타임에 시트를 호출하지 않는다 — 문구를 고치려면 시트를 수정한 뒤 스크립트를 다시 실행할 것.

export interface GapjaEntry {
  seq: string;
  gapja: string;
  stem: string;
  branch: string;
  element: string;
  keyword1: string;
  keyword2: string;
  keyword3: string;
  flow: string;
  caution: string;
  levelUp: string;
}

export interface DayMasterEntry {
  dayMaster: string;
  strength: "신강" | "신약";
  temperament: string;
  strengthText: string;
  weaknessText: string;
  lifeManifestation: string;
}

export interface YongsinEntry {
  element: string;
  meaning: string;
  lifeManifestation: string;
  howToUse: string;
}

export interface GyeokgukEntry {
  tenGodGroup: string;
  gyeokgukName: string;
  description: string;
  lifeTheme: string;
}

const gapjaBank = gapjaData as GapjaEntry[];
const dayMasterBank = dayMasterData as DayMasterEntry[];
const yongsinBank = yongsinData as YongsinEntry[];
const gyeokgukBank = gyeokgukData as GyeokgukEntry[];

export function getGapjaEntry(gapja: string): GapjaEntry | undefined {
  return gapjaBank.find((row) => row.gapja === gapja);
}

export function getDayMasterEntry(dayMaster: string, strength: "신강" | "신약"): DayMasterEntry | undefined {
  return dayMasterBank.find((row) => row.dayMaster === dayMaster && row.strength === strength);
}

const ELEMENT_KEY_TO_LABEL: Record<string, string> = { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" };

export function getYongsinEntry(elementKey: string): YongsinEntry | undefined {
  const label = ELEMENT_KEY_TO_LABEL[elementKey] ?? elementKey;
  return yongsinBank.find((row) => row.element === label);
}

export function getGyeokgukEntry(group: TenGodGroup): GyeokgukEntry | undefined {
  return gyeokgukBank.find((row) => row.tenGodGroup === group);
}
