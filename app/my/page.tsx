import Link from "next/link";
import FoxMascot from "@/components/FoxMascot";
import LoginButtons from "@/components/LoginButtons";
import LogoutButton from "@/components/LogoutButton";
import ChargeButton from "@/components/ChargeButton";
import NicknameEditForm from "@/components/NicknameEditForm";
import MyPageTabs from "@/components/MyPageTabs";
import { getSession, type Provider } from "@/lib/session";
import { getDb } from "@/lib/firebaseAdmin";

const PROVIDER_BADGE: Record<Provider, { label: string; bg: string; fg: string }> = {
  kakao: { label: "카카오로 가입", bg: "#FEE500", fg: "#181600" },
  naver: { label: "네이버로 가입", bg: "#03C75A", fg: "#ffffff" },
};

async function countUnreadLetters(uid: string): Promise<number> {
  const snap = await getDb()
    .collection("users")
    .doc(uid)
    .collection("letters")
    .where("unlockedAt", "==", null)
    .count()
    .get();
  return snap.data().count;
}

interface MyPageProps {
  searchParams: Promise<{ error?: string }>;
}

interface ActivityRow {
  id: string;
  category: string;
  title: string;
  priceKrw: number;
  unlockedAt: string;
}

async function loadActivity(uid: string): Promise<ActivityRow[]> {
  const snap = await getDb()
    .collection("users")
    .doc(uid)
    .collection("activity")
    .orderBy("unlockedAt", "desc")
    .limit(50)
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data() as { category: string; title: string; priceKrw: number; unlockedAt?: { toDate: () => Date } };
    return {
      id: doc.id,
      category: data.category,
      title: data.title,
      priceKrw: data.priceKrw,
      unlockedAt: (data.unlockedAt?.toDate() ?? new Date()).toISOString(),
    };
  });
}

export default async function MyPage({ searchParams }: MyPageProps) {
  const { error } = await searchParams;
  const session = await getSession();

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">마이페이지</h1>

      <MyPageTabs
        accountTab={
          !session ? (
            <>
              <p className="mt-2 text-center text-sm text-brown-soft/60">
                로그인하면 구매내역과 잔디 잔액이 저장돼요.
              </p>
              {error === "login_failed" && (
                <p className="mt-3 text-center text-xs font-semibold text-coral-dark">
                  로그인에 실패했어요. 다시 시도해주세요.
                </p>
              )}
              <LoginButtons />
            </>
          ) : (
            <>
              <NicknameEditForm nickname={session.nickname} />

              <div className="mt-2 flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{
                    backgroundColor: PROVIDER_BADGE[session.provider].bg,
                    color: PROVIDER_BADGE[session.provider].fg,
                  }}
                >
                  {PROVIDER_BADGE[session.provider].label}
                </span>
                <span className="text-[11px] text-brown-soft/40">
                  {new Date(session.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  가입
                </span>
              </div>

              <div className="mt-2">
                <LogoutButton />
              </div>

              <LetterInboxBanner uid={session.uid} />

              <div className="mt-8 w-full rounded-2xl bg-gradient-to-b from-lavender/30 to-cream p-6 text-center shadow-inner ring-1 ring-brown/10">
                <p className="text-xs font-semibold text-brown-soft/50">🌱 잔디</p>
                <p className="mt-1 text-3xl font-extrabold text-brown">{session.ticketBalance.toLocaleString()}개</p>
                <ChargeButton />
              </div>

              <MyActivityList uid={session.uid} />

              <div className="mt-10 w-full space-y-2 rounded-2xl bg-white p-5 text-center ring-1 ring-brown/5">
                <p className="text-xs font-semibold text-brown-soft/50">고객센터: 준비 중</p>
                <div className="flex items-center justify-center gap-3 text-[11px] font-semibold text-brown-soft/40">
                  <Link href="/terms" className="underline underline-offset-2">
                    이용약관
                  </Link>
                  <Link href="/privacy" className="underline underline-offset-2">
                    개인정보처리방침
                  </Link>
                </div>
              </div>
            </>
          )
        }
      />
    </div>
  );
}

async function LetterInboxBanner({ uid }: { uid: string }) {
  const unreadCount = await countUnreadLetters(uid);

  return (
    <Link
      href="/letter/inbox"
      className="mt-6 flex w-full items-center justify-between rounded-2xl bg-gradient-to-b from-mint/30 to-cream p-4 shadow-sm ring-1 ring-brown/5 transition active:scale-[0.98] hover:bg-mint/20"
    >
      <span className="flex items-center gap-3">
        <span className="text-2xl">🔒</span>
        <span className="text-sm font-bold text-brown">나에게 온 비밀 편지</span>
      </span>
      {unreadCount > 0 ? (
        <span className="rounded-full bg-coral px-2.5 py-1 text-xs font-bold text-white">{unreadCount}</span>
      ) : (
        <span className="text-lg text-brown-soft/30">→</span>
      )}
    </Link>
  );
}

async function MyActivityList({ uid }: { uid: string }) {
  const activity = await loadActivity(uid);

  return (
    <div className="mt-8 w-full">
      <h2 className="text-sm font-semibold text-brown-soft/50">구매한 풀이</h2>
      {activity.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-white p-5 text-center text-sm text-brown-soft/50 ring-1 ring-brown/5">
          아직 열어본 풀이가 없어요.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {activity.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brown/5"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-coral-dark">{item.category}</p>
                <p className="truncate text-sm font-bold text-brown">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-brown-soft/40">
                  {new Date(item.unlockedAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-xs font-bold text-brown-soft/60">
                {item.priceKrw > 0 ? `🌱${item.priceKrw.toLocaleString()}` : "무료"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
