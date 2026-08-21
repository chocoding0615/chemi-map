import { getDb } from "./firebaseAdmin";
import { generateUniqueHandle } from "./handle";

export async function getOrCreateLetterHandle(uid: string): Promise<string> {
  const db = getDb();
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const existing = (userSnap.data() as { letterHandle?: string } | undefined)?.letterHandle;
  if (existing) return existing;

  const handle = await generateUniqueHandle();
  await db.collection("handles").doc(handle).set({ uid });
  await userRef.update({ letterHandle: handle });
  return handle;
}

export async function resolveLetterHandle(handle: string): Promise<{ uid: string; nickname: string } | null> {
  const db = getDb();
  const handleSnap = await db.collection("handles").doc(handle).get();
  if (!handleSnap.exists) return null;
  const { uid } = handleSnap.data() as { uid: string };

  const userSnap = await db.collection("users").doc(uid).get();
  if (!userSnap.exists) return null;
  const { nickname } = userSnap.data() as { nickname: string };
  return { uid, nickname };
}
