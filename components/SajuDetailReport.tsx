import { calculateSajuDetail, type Gender } from "@/lib/result-engine/sajuDetail";
import { TEN_GOD_MEANING } from "@/lib/content/tenGods";
import { getDayMasterEntry, getGyeokgukEntry, getGapjaEntry, getYongsinEntry } from "@/lib/content/sajuBank";
import { ELEMENT_BANK } from "@/lib/result-engine/elements";

interface SajuDetailReportProps {
  label: string;
  birthdate: string;
  birthTime?: string;
  gender: Gender;
}

export default function SajuDetailReport({ label, birthdate, birthTime, gender }: SajuDetailReportProps) {
  const detail = calculateSajuDetail(birthdate, birthTime, gender);
  const dayMasterEntry = getDayMasterEntry(detail.dayMaster, detail.strength);
  const gyeokgukEntry = getGyeokgukEntry(detail.dominantGroup);
  const currentLuckGapja = detail.currentLuckPillar ? getGapjaEntry(detail.currentLuckPillar.korean) : undefined;
  const currentYearEntry = getGapjaEntry(detail.currentYearGapja);
  const yongsinEntry = getYongsinEntry(detail.yongsinElement);

  return (
    <div className="mt-4 rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-brown/10">
      <p className="text-xs font-semibold text-brown-soft/90">{label}의 십신·대운 풀이</p>

      {dayMasterEntry && (
        <div className="mt-3 rounded-lg bg-cream/60 p-3">
          <p className="text-xs font-bold text-coral-dark">
            일간 {detail.dayMaster} · {detail.strength}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-brown-soft">{dayMasterEntry.temperament}</p>
          <div className="mt-2 space-y-1.5 border-t border-brown/10 pt-2">
            <p className="text-sm leading-relaxed text-brown-soft">
              <span className="font-semibold text-mint-dark">강점 ·</span> {dayMasterEntry.strengthText}
            </p>
            <p className="text-sm leading-relaxed text-brown-soft">
              <span className="font-semibold text-lavender-dark">약점 ·</span> {dayMasterEntry.weaknessText}
            </p>
            <p className="text-sm leading-relaxed text-brown-soft">{dayMasterEntry.lifeManifestation}</p>
          </div>
        </div>
      )}

      {gyeokgukEntry && (
        <div className="mt-2 rounded-lg bg-cream/60 p-3">
          <p className="text-xs font-bold text-coral-dark">{gyeokgukEntry.gyeokgukName}</p>
          <p className="mt-1 text-sm leading-relaxed text-brown-soft">{gyeokgukEntry.description}</p>
          <p className="mt-1 text-sm leading-relaxed text-brown-soft">{gyeokgukEntry.lifeTheme}</p>
        </div>
      )}

      {detail.topTenGods.length > 0 && (
        <div className="mt-3 space-y-2">
          {detail.topTenGods.map((tenGod) => (
            <div key={tenGod} className="rounded-lg bg-cream/60 p-3">
              <p className="text-xs font-bold text-coral-dark">
                {tenGod} <span className="font-normal text-brown-soft/90">· {TEN_GOD_MEANING[tenGod].meaning}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-brown-soft">{TEN_GOD_MEANING[tenGod].manyText}</p>
            </div>
          ))}
        </div>
      )}

      {detail.luckPillars && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-brown-soft/90">대운 흐름</p>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {detail.luckPillars.map((p) => {
              const isCurrent = detail.currentLuckPillar?.age === p.age;
              return (
                <div
                  key={p.age}
                  className={`flex shrink-0 flex-col items-center rounded-lg px-2.5 py-2 text-center ${
                    isCurrent ? "bg-coral text-white" : "bg-cream/60 text-brown-soft"
                  }`}
                >
                  <span className="text-[10px] font-semibold">{p.age}세~</span>
                  <span className="text-xs font-bold">{p.korean}</span>
                </div>
              );
            })}
          </div>
          {detail.currentLuckPillar && currentLuckGapja && (
            <div className="mt-2 rounded-lg bg-cream/60 p-3">
              <p className="text-xs font-bold text-coral-dark">
                {detail.currentLuckPillar.age}세부터 · {currentLuckGapja.gapja}대운 ·{" "}
                {currentLuckGapja.keyword1} · {currentLuckGapja.keyword2}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-brown-soft">{currentLuckGapja.flow}</p>
              <p className="mt-1 text-sm leading-relaxed text-brown-soft">
                <span className="font-semibold text-lavender-dark">조심할 점 ·</span> {currentLuckGapja.caution}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-brown-soft">
                <span className="font-semibold text-mint-dark">레벨업 ·</span> {currentLuckGapja.levelUp}
              </p>
            </div>
          )}
        </div>
      )}

      {currentYearEntry && (
        <div className="mt-2 rounded-lg bg-cream/60 p-3">
          <p className="text-xs font-bold text-coral-dark">
            올해 세운 · {currentYearEntry.gapja}년 · {currentYearEntry.keyword1} · {currentYearEntry.keyword2}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-brown-soft">{currentYearEntry.flow}</p>
          <p className="mt-1 text-sm leading-relaxed text-brown-soft">
            <span className="font-semibold text-lavender-dark">조심할 점 ·</span> {currentYearEntry.caution}
          </p>
        </div>
      )}

      {yongsinEntry && (
        <div className="mt-2 rounded-lg bg-cream/60 p-3">
          <p className="text-xs font-bold text-coral-dark">
            용신 · {ELEMENT_BANK[detail.yongsinElement].label}({ELEMENT_BANK[detail.yongsinElement].hanja})
          </p>
          <p className="mt-1 text-sm leading-relaxed text-brown-soft">{yongsinEntry.meaning}</p>
          <p className="mt-1 text-sm leading-relaxed text-brown-soft">{yongsinEntry.lifeManifestation}</p>
          <p className="mt-1 text-sm leading-relaxed text-brown-soft">
            <span className="font-semibold text-mint-dark">활용법 ·</span> {yongsinEntry.howToUse}
          </p>
        </div>
      )}
    </div>
  );
}
