import Link from "next/link";
import { getSession } from "@/lib/session";
import { isAdmin, isEnvAdmin } from "@/lib/admin";
import { getAdminOverview, getSpendingBreakdown, listAllUsers } from "@/lib/adminStats";
import AdminTabs from "@/components/AdminTabs";
import AdminAnalytics from "@/components/AdminAnalytics";
import AdminUserList from "@/components/AdminUserList";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="mx-auto flex w-full max-w-[480px] md:max-w-2xl flex-1 flex-col items-center px-6 py-16 text-center">
        <p className="text-sm font-semibold text-brown-soft">로그인이 필요해요.</p>
        <Link href="/my" className="mt-3 text-xs font-bold text-coral-dark underline underline-offset-2">
          마이페이지로 가기
        </Link>
      </div>
    );
  }

  if (!(await isAdmin(session.uid))) {
    return (
      <div className="mx-auto flex w-full max-w-[480px] md:max-w-2xl flex-1 flex-col items-center px-6 py-16 text-center">
        <p className="text-sm font-semibold text-brown-soft">이 페이지에 접근할 권한이 없어요.</p>
      </div>
    );
  }

  const [overview, breakdown, users] = await Promise.all([
    getAdminOverview(),
    getSpendingBreakdown(),
    listAllUsers(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-[480px] md:max-w-2xl flex-1 flex-col items-center px-6 py-12">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-brown">관리자</h1>
        <Link
          href="/"
          className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brown-soft shadow-sm ring-1 ring-brown/10 transition active:scale-95 hover:bg-cream"
        >
          👤 유저 화면으로
        </Link>
      </div>

      <AdminTabs
        overviewTab={
          <div className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="가입자 수" value={`${overview.userCount.toLocaleString()}명`} />
              <StatCard label="AI 리포트 생성" value={`${overview.reportCount.toLocaleString()}건`} />
              <StatCard label="보유 잔디 합계" value={`🌱${overview.totalTicketBalance.toLocaleString()}`} />
              <StatCard label="소진된 잔디 합계" value={`🌱${overview.totalSpentKrw.toLocaleString()}`} />
            </div>
            <p className="text-[11px] text-brown-soft/50">
              * 실제 결제 연동 전이라 원화 매출이 아니라 잔디(무료 충전) 기준 사용량 지표예요.
            </p>

            <div>
              <h2 className="text-sm font-semibold text-brown-soft/90">최근 활동</h2>
              {overview.recentActivity.length === 0 ? (
                <p className="mt-3 rounded-2xl bg-white p-5 text-center text-sm text-brown-soft/60 ring-1 ring-brown/5">
                  아직 활동 기록이 없어요.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {overview.recentActivity.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-brown/5"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-coral-dark">{item.category}</p>
                        <p className="truncate text-sm font-bold text-brown">{item.title}</p>
                        <p className="mt-0.5 text-[11px] text-brown-soft/40">
                          {new Date(item.unlockedAt).toLocaleString("ko-KR")}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-xs font-bold text-brown-soft">
                        {item.priceKrw > 0 ? `🌱${item.priceKrw.toLocaleString()}` : "무료"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        }
        analyticsTab={<AdminAnalytics byCategory={breakdown.byCategory} byAgeRange={breakdown.byAgeRange} />}
        usersTab={
          <AdminUserList
            users={users.map((u) => ({ ...u, isEnvAdmin: isEnvAdmin(u.uid) }))}
            myUid={session.uid}
          />
        }
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-brown/5">
      <p className="text-[11px] font-semibold text-brown-soft/60">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-brown">{value}</p>
    </div>
  );
}
