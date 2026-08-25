import { getDb } from "./firebaseAdmin";

export interface AdminOverview {
  userCount: number;
  totalTicketBalance: number;
  totalSpentKrw: number;
  reportCount: number;
  recentActivity: { uid: string; category: string; title: string; priceKrw: number; unlockedAt: string }[];
}

export interface AdminUserRow {
  uid: string;
  nickname: string;
  provider: string;
  ticketBalance: number;
  isAdmin: boolean;
  /** 접근권한과 무관한 순수 라벨 - 관리자가 잔디를 챙겨줄 대상 표시용. */
  isTester: boolean;
  createdAt: string;
  /** 관리자 목록 화면에서만 숨김 처리된 유저 - 계정/데이터는 그대로 남아있다. */
  hidden: boolean;
}

// 실제 결제 전이라 "결제 현황" 대신 지금 낼 수 있는 가장 정직한 지표(가입자 수,
// 보유/소진 잔디, AI 리포트 생성 건수, 최근 활동)를 보여준다. collectionGroup은
// where/orderBy 없이 단순 조회해야 별도 복합 인덱스 없이 바로 동작한다.
export async function getAdminOverview(): Promise<AdminOverview> {
  const db = getDb();

  const [usersSnap, reportsCountSnap, activitySnap] = await Promise.all([
    db.collection("users").get(),
    db.collectionGroup("sajuLlmReports").count().get(),
    db.collectionGroup("activity").limit(500).get(),
  ]);

  let totalTicketBalance = 0;
  for (const doc of usersSnap.docs) {
    totalTicketBalance += (doc.data().ticketBalance as number | undefined) ?? 0;
  }

  const activityRows = activitySnap.docs.map((doc) => {
    const data = doc.data() as { category: string; title: string; priceKrw: number; unlockedAt?: { toDate: () => Date } };
    const uid = doc.ref.parent.parent?.id ?? "";
    return {
      uid,
      category: data.category,
      title: data.title,
      priceKrw: data.priceKrw ?? 0,
      unlockedAt: (data.unlockedAt?.toDate() ?? new Date(0)).toISOString(),
    };
  });

  const totalSpentKrw = activityRows.reduce((sum, row) => sum + row.priceKrw, 0);
  const recentActivity = [...activityRows]
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 20);

  return {
    userCount: usersSnap.size,
    totalTicketBalance,
    totalSpentKrw,
    reportCount: reportsCountSnap.data().count,
    recentActivity,
  };
}

export interface BreakdownRow {
  label: string;
  totalKrw: number;
  count: number;
}

// 카카오는 "20~29", 네이버는 "20-29" 형태로 온다 - 구분자는 다르지만 둘 다 하한
// 숫자로 10년 단위 구간을 판정할 수 있어 하나의 정규화 함수로 처리한다.
function normalizeAgeRange(raw: string | undefined): string {
  const match = raw?.match(/(\d+)/);
  if (!match) return "정보 없음";
  const lower = Number(match[1]);
  if (lower < 20) return "10대 이하";
  if (lower < 30) return "20대";
  if (lower < 40) return "30대";
  if (lower < 50) return "40대";
  if (lower < 60) return "50대";
  return "60대 이상";
}

// "어디에 많이 썼는지"를 카테고리별/연령대별로 집계한다. 환불(isRefund) 건은
// 순수 결제 지표를 흐리게 만들어서 제외한다 - 총 소진액(getAdminOverview)은
// 잔액 관점이라 환불을 포함해 순액을 보여주지만, 여긴 "무엇을 샀는지" 관점이라
// 다르다. collectionGroup 전체 스캔이라 데이터가 아주 많아지면 페이지네이션이
// 필요하지만, 지금 규모에선 한 번에 읽어도 충분하다.
export async function getSpendingBreakdown(): Promise<{ byCategory: BreakdownRow[]; byAgeRange: BreakdownRow[] }> {
  const db = getDb();
  const [activitySnap, usersSnap] = await Promise.all([
    db.collectionGroup("activity").limit(3000).get(),
    db.collection("users").get(),
  ]);

  const ageByUid = new Map<string, string>();
  for (const doc of usersSnap.docs) {
    ageByUid.set(doc.id, normalizeAgeRange(doc.data().ageRange as string | undefined));
  }

  const categoryMap = new Map<string, BreakdownRow>();
  const ageMap = new Map<string, BreakdownRow>();

  for (const doc of activitySnap.docs) {
    const data = doc.data() as { category?: string; priceKrw?: number; isRefund?: boolean };
    if (data.isRefund || !data.priceKrw || data.priceKrw <= 0) continue;

    const category = data.category ?? "기타";
    const uid = doc.ref.parent.parent?.id ?? "";
    const ageLabel = ageByUid.get(uid) ?? "정보 없음";

    const catRow = categoryMap.get(category) ?? { label: category, totalKrw: 0, count: 0 };
    catRow.totalKrw += data.priceKrw;
    catRow.count += 1;
    categoryMap.set(category, catRow);

    const ageRow = ageMap.get(ageLabel) ?? { label: ageLabel, totalKrw: 0, count: 0 };
    ageRow.totalKrw += data.priceKrw;
    ageRow.count += 1;
    ageMap.set(ageLabel, ageRow);
  }

  const byDescKrw = (a: BreakdownRow, b: BreakdownRow) => b.totalKrw - a.totalKrw;
  return {
    byCategory: [...categoryMap.values()].sort(byDescKrw),
    byAgeRange: [...ageMap.values()].sort(byDescKrw),
  };
}

export async function listAllUsers(limit = 200): Promise<AdminUserRow[]> {
  const snap = await getDb().collection("users").limit(limit).get();
  return snap.docs
    .map((doc) => {
      const data = doc.data() as {
        nickname?: string;
        provider?: string;
        ticketBalance?: number;
        isAdmin?: boolean;
        isTester?: boolean;
        hiddenInAdminList?: boolean;
        createdAt?: { toDate: () => Date } | Date;
      };
      const createdAt = data.createdAt
        ? data.createdAt instanceof Date
          ? data.createdAt
          : data.createdAt.toDate()
        : new Date(0);
      return {
        uid: doc.id,
        nickname: data.nickname ?? "(닉네임 없음)",
        provider: data.provider ?? "",
        ticketBalance: data.ticketBalance ?? 0,
        isAdmin: data.isAdmin === true,
        isTester: data.isTester === true,
        hidden: data.hiddenInAdminList === true,
        createdAt: createdAt.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
