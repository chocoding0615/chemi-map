import { calculateSajuDetail, type Gender } from "@/lib/result-engine/sajuDetail";
import { TEN_GOD_MEANING } from "@/lib/content/tenGods";
import { ELEMENT_BANK, pickVariant } from "@/lib/result-engine/elements";

interface SajuDetailReportProps {
  label: string;
  birthdate: string;
  birthTime?: string;
  gender: Gender;
}

export default function SajuDetailReport({ label, birthdate, birthTime, gender }: SajuDetailReportProps) {
  const detail = calculateSajuDetail(birthdate, birthTime, gender);

  return (
    <div className="mt-4 rounded-xl bg-white/60 p-4 text-left">
      <p className="text-xs font-semibold text-brown-soft/50">{label}의 십신·대운 풀이</p>

      {detail.topTenGods.length > 0 && (
        <div className="mt-3 space-y-2">
          {detail.topTenGods.map((tenGod) => (
            <div key={tenGod} className="rounded-lg bg-cream/60 p-3">
              <p className="text-xs font-bold text-coral-dark">
                {tenGod} <span className="font-normal text-brown-soft/50">· {TEN_GOD_MEANING[tenGod].meaning}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-brown-soft/70">{TEN_GOD_MEANING[tenGod].manyText}</p>
            </div>
          ))}
        </div>
      )}

      {detail.luckPillars && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-brown-soft/50">대운 흐름</p>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {detail.luckPillars.map((p) => {
              const isCurrent = detail.currentLuckPillar?.age === p.age;
              return (
                <div
                  key={p.age}
                  className={`flex shrink-0 flex-col items-center rounded-lg px-2.5 py-2 text-center ${
                    isCurrent ? "bg-coral text-white" : "bg-cream/60 text-brown-soft/60"
                  }`}
                >
                  <span className="text-[10px] font-semibold">{p.age}세~</span>
                  <span className="text-xs font-bold">{p.korean}</span>
                </div>
              );
            })}
          </div>
          {detail.currentLuckPillar && (
            <p className="mt-2 text-sm leading-relaxed text-brown-soft/70">
              지금은 {detail.currentLuckPillar.age}세부터 시작된{" "}
              {ELEMENT_BANK[detail.currentLuckPillar.element].label}({ELEMENT_BANK[detail.currentLuckPillar.element].hanja})
              대운 구간이에요.{" "}
              {
                ELEMENT_BANK[detail.currentLuckPillar.element].blurbs[
                  pickVariant(`${birthdate}-luckpillar`, ELEMENT_BANK[detail.currentLuckPillar.element].blurbs.length)
                ]
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
}
