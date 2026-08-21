import { customAlphabet } from "nanoid";
import { getDb } from "./firebaseAdmin";

const generateHandleCandidate = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

export async function generateUniqueHandle(): Promise<string> {
  const db = getDb();
  for (let attempt = 0; attempt < 5; attempt++) {
    const handle = generateHandleCandidate();
    const doc = await db.collection("handles").doc(handle).get();
    if (!doc.exists) return handle;
  }
  throw new Error("handle generation failed, please retry");
}
