import { customAlphabet } from "nanoid";
import { getDb } from "./firebaseAdmin";

const generateSlugCandidate = customAlphabet("abcdefghijklmnopqrstuvwxyz", 8);

export async function generateUniqueSlug(): Promise<string> {
  const db = getDb();
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlugCandidate();
    const doc = await db.collection("maps").doc(slug).get();
    if (!doc.exists) return slug;
  }
  throw new Error("slug generation failed, please retry");
}
