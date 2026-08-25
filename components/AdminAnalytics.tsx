import type { BreakdownRow } from "@/lib/adminStats";

// 막대 하나하나의 색은 항목을 구분하는 용도가 아니라 "얼마나 큰지"(크기)만
// 나타내면 되는 상황이라, 카테고리마다 다른 색을 쓰지 않고 브랜드 색 하나로
// 통일했다(단일 색상 = magnitude 인코딩, 범례가 필요 없다).
function BreakdownBarList({ title, rows, caption }: { title: string; rows: BreakdownRow[]; caption?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.totalKrw));
  return (
    <div>
      <h2 className="text-sm font-semibold text-brown-soft/90">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-white p-5 text-center text-sm text-brown-soft/60 ring-1 ring-brown/5">
          아직 데이터가 없어요.
        </p>
      ) : (
        <div className="mt-3 space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brown/5">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="min-w-0 truncate font-bold text-brown">{row.label}</span>
                <span className="shrink-0 font-semibold text-brown-soft/70">
                  🌱{row.totalKrw.toLocaleString()} · {row.count}건
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-cream">
                <div
                  className="h-full rounded-full bg-coral"
                  style={{ width: `${Math.max(4, (row.totalKrw / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {caption && <p className="mt-2 text-[11px] leading-relaxed text-brown-soft/50">{caption}</p>}
    </div>
  );
}

export default function AdminAnalytics({
  byCategory,
  byAgeRange,
}: {
  byCategory: BreakdownRow[];
  byAgeRange: BreakdownRow[];
}) {
  return (
    <div className="w-full space-y-6">
      <BreakdownBarList
        title="🌱 카테고리별 소진"
        rows={byCategory}
        caption="환불 건은 제외한 순수 결제(잔디 소진) 기준이에요. 실제 결제 연동 전이라 원화가 아니라 잔디 수량 지표예요."
      />
      <BreakdownBarList
        title="🎂 연령대별 소진"
        rows={byAgeRange}
        caption="연령대는 카카오/네이버 로그인 시 사용자가 동의해야 받아와요. 개발자 콘솔에서 연령대 제공 동의항목을 켜기 전이거나, 유저가 아직 재로그인하지 않았으면 대부분 '정보 없음'으로 잡혀요. 기존 가입자는 소급 적용이 안 되고, 다음 로그인부터 반영돼요."
      />
    </div>
  );
}
