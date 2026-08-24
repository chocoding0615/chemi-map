import { getDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { ProfileInput, ProfileDoc } from "./profileTypes";

export type { ProfileInput, ProfileDoc };

function profilesRef(uid: string) {
  return getDb().collection("users").doc(uid).collection("profiles");
}

export async function listProfiles(uid: string): Promise<ProfileDoc[]> {
  const snap = await profilesRef(uid).orderBy("createdAt", "asc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ProfileInput) }));
}

export async function createProfile(uid: string, input: ProfileInput): Promise<string> {
  const ref = await profilesRef(uid).add({ ...input, createdAt: FieldValue.serverTimestamp() });
  return ref.id;
}

export async function updateProfile(uid: string, id: string, input: ProfileInput): Promise<void> {
  await profilesRef(uid).doc(id).set(input, { merge: true });
}

export async function deleteProfile(uid: string, id: string): Promise<void> {
  await profilesRef(uid).doc(id).delete();
}

export function parseProfileInput(body: unknown): ProfileInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const label = typeof b.label === "string" ? b.label.trim().slice(0, 20) : "";
  const birthdate = typeof b.birthdate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.birthdate) ? b.birthdate : "";
  const gender = b.gender === "male" || b.gender === "female" ? b.gender : null;
  if (!label || !birthdate || !gender) return null;

  const birthTime = typeof b.birthTime === "string" && /^\d{2}:\d{2}$/.test(b.birthTime) ? b.birthTime : "";
  const mbti = typeof b.mbti === "string" ? b.mbti.slice(0, 4) : "";

  return { label, birthdate, gender, birthTime, mbti };
}
