import FoxMascot from "@/components/FoxMascot";
import LoginButtons from "@/components/LoginButtons";
import CopyLinkButton from "@/components/CopyLinkButton";
import SecretLetterCard from "@/components/SecretLetterCard";
import DeleteLetterButton from "@/components/DeleteLetterButton";
import { getSession } from "@/lib/session";
import { getOrCreateLetterHandle } from "@/lib/letterHandle";
import { hasUnlockedAnyLetter } from "@/lib/letters";
import { getDb } from "@/lib/firebaseAdmin";

const PREVIEW_LEN = 15;
const UNLOCK_PRICE_KRW = 2;

interface LetterRow {
  id: string;
  senderName: string;
  isUnlocked: boolean;
  content: string | null;
  preview: string;
}

async function loadLetters(uid: string): Promise<LetterRow[]> {
  const snap = await getDb()
    .collection("users")
    .doc(uid)
    .collection("letters")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data() as { senderName: string; content: string; unlockedAt: unknown };
    const isUnlocked = Boolean(data.unlockedAt);
    return {
      id: doc.id,
      senderName: data.senderName,
      isUnlocked,
      content: isUnlocked ? data.content : null,
      preview: isUnlocked ? "" : data.content.slice(0, PREVIEW_LEN),
    };
  });
}

export default async function LetterInboxPage() {
  const session = await getSession();

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} prop="heart" />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">비밀 편지함</h1>

      {!session ? (
        <>
          <p className="mt-2 text-center text-sm text-brown-soft">
            로그인하면 나만의 편지함 링크가 생겨요.
          </p>
          <LoginButtons />
        </>
      ) : (
        <LetterInboxBody uid={session.uid} />
      )}
    </div>
  );
}

async function LetterInboxBody({ uid }: { uid: string }) {
  const handle = await getOrCreateLetterHandle(uid);
  const letters = await loadLetters(uid);
  const unreadCount = letters.filter((l) => !l.isUnlocked).length;
  const nextUnlockIsFree = !(await hasUnlockedAnyLetter(uid));

  return (
    <>
      <div className="mt-6 w-full rounded-2xl bg-gradient-to-b from-lavender/30 to-cream p-5 text-center shadow-inner ring-1 ring-brown/10">
        <p className="text-xs font-semibold text-brown-soft/90">내 편지함 링크를 친구에게 공유해보세요</p>
        <p className="mt-1 truncate text-xs text-brown-soft/40">/letter/{handle}</p>
        <CopyLinkButton path={`/letter/${handle}`} label="링크 복사하기" />
      </div>

      <div className="mt-8 w-full">
        <h2 className="text-sm font-semibold text-brown-soft/90">
          받은 편지 {letters.length > 0 && unreadCount > 0 && `· 안 읽은 편지 ${unreadCount}개`}
        </h2>
        {letters.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-white p-5 text-center text-sm text-brown-soft/90 ring-1 ring-brown/5">
            아직 도착한 편지가 없어요. 링크를 공유해보세요!
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {letters.map((letter) =>
              letter.isUnlocked ? (
                <div key={letter.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brown/5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-coral-dark">{letter.senderName}</p>
                    <DeleteLetterButton id={letter.id} />
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-brown">{letter.content}</p>
                </div>
              ) : (
                <SecretLetterCard
                  key={letter.id}
                  id={letter.id}
                  senderName={letter.senderName}
                  preview={letter.preview}
                  priceKrw={nextUnlockIsFree ? 0 : UNLOCK_PRICE_KRW}
                />
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}
