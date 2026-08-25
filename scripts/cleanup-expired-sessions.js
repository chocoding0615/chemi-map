/**
 * 만료된 sessions 문서를 일괄 삭제하는 관리 스크립트.
 *
 * lib/session.ts의 getSession()은 만료된 세션을 "읽어갈 때"만 지운다 — 한 번도
 * 다시 방문하지 않는 만료 세션은 영원히 안 지워지고 쌓이기만 한다. 이 스크립트는
 * 그런 문서를 한 번에 정리한다. (근본적인 해결책은 docs/session-ttl.md의 Firestore
 * TTL 정책 — 이 스크립트는 TTL을 아직 안 걸었거나, 지금 당장 정리하고 싶을 때 쓴다.)
 *
 * 사용법:
 *   node scripts/cleanup-expired-sessions.js          # 실제로 삭제
 *   node scripts/cleanup-expired-sessions.js --dry-run # 몇 개나 지워질지만 확인
 *
 * 필요 env (.env.local): FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */
/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node script, not part of the app bundle */
const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}

const BATCH_SIZE = 500; // Firestore 배치 쓰기 한 번당 최대 작업 수

async function main() {
  loadEnvLocal();
  const dryRun = process.argv.includes("--dry-run");

  const { initializeApp, cert } = require("firebase-admin/app");
  const { getFirestore } = require("firebase-admin/firestore");

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
  const db = getFirestore();

  const snap = await db.collection("sessions").where("expiresAt", "<", new Date()).get();

  if (snap.empty) {
    console.log("만료된 세션이 없어요.");
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] 만료된 세션 ${snap.size}개 발견 (실제로 지우려면 --dry-run 없이 실행하세요).`);
    return;
  }

  let deleted = 0;
  for (let i = 0; i < snap.docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    for (const doc of snap.docs.slice(i, i + BATCH_SIZE)) {
      batch.delete(doc.ref);
    }
    await batch.commit();
    deleted += Math.min(BATCH_SIZE, snap.docs.length - i);
  }

  console.log(`만료된 세션 ${deleted}개 삭제 완료.`);
}

main().catch((err) => {
  console.error("정리 실패:", err);
  process.exit(1);
});
