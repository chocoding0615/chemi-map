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
  createdAt: string;
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

export async function listAllUsers(limit = 200): Promise<AdminUserRow[]> {
  const snap = await getDb().collection("users").limit(limit).get();
  return snap.docs
    .map((doc) => {
      const data = doc.data() as {
        nickname?: string;
        provider?: string;
        ticketBalance?: number;
        isAdmin?: boolean;
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
        createdAt: createdAt.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
