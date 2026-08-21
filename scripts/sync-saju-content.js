/**
 * 여우점_사주콘텐츠뱅크 구글시트 -> lib/content/generated/*.json 동기화 스크립트.
 *
 * 시트에서 문구를 고친 뒤 이 스크립트를 실행하면 앱이 쓰는 정적 JSON이 갱신됩니다.
 * 앱 자체는 런타임에 구글시트를 호출하지 않습니다(비용/지연/쿼터 문제 방지).
 *
 * 사용법: node scripts/sync-saju-content.js
 * 필요 env (.env.local): FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * 위 서비스 계정 이메일이 시트에 "뷰어"로 공유돼 있어야 합니다.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node script, not part of the app bundle */
const fs = require("fs");
const path = require("path");
const { JWT } = require("google-auth-library");

const SPREADSHEET_ID = "1sTwFuDTpBudWcvT_pRbO1VUL-zWc9nfHCvZXNCfcg8M";
const OUT_DIR = path.join(__dirname, "..", "lib", "content", "generated");

const SHEETS = [
  { sheetName: "대운세운_60갑자", outFile: "gapjaBank.json" },
  { sheetName: "일간_신강신약", outFile: "dayMasterBank.json" },
  { sheetName: "용신_오행", outFile: "yongsinBank.json" },
  { sheetName: "격국_개요", outFile: "gyeokgukBank.json" },
];

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

function toCamel(header) {
  const map = {
    순번: "seq",
    갑자: "gapja",
    천간: "stem",
    지지: "branch",
    오행: "element",
    키워드1: "keyword1",
    키워드2: "keyword2",
    키워드3: "keyword3",
    흐름설명: "flow",
    조심할점: "caution",
    레벨업포인트: "levelUp",
    일간: "dayMaster",
    신강신약: "strength",
    기질: "temperament",
    강점: "strengthText",
    약점: "weaknessText",
    삶에서모습: "lifeManifestation",
    용신의미: "meaning",
    활용법: "howToUse",
    십신그룹: "tenGodGroup",
    격국명: "gyeokgukName",
    설명: "description",
    인생주제: "lifeTheme",
  };
  return map[header] ?? header;
}

function rowsToObjects(values) {
  const [header, ...rows] = values;
  const keys = header.map(toCamel);
  return rows
    .filter((row) => row.some((cell) => cell && cell.trim()))
    .map((row) => Object.fromEntries(keys.map((key, i) => [key, row[i] ?? ""])));
}

async function main() {
  loadEnvLocal();
  const client = new JWT({
    email: process.env.FIREBASE_CLIENT_EMAIL,
    key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const { sheetName, outFile } of SHEETS) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}`;
    const res = await client.request({ url });
    const objects = rowsToObjects(res.data.values);
    fs.writeFileSync(path.join(OUT_DIR, outFile), JSON.stringify(objects, null, 2) + "\n", "utf8");
    console.log(`✓ ${sheetName} -> ${outFile} (${objects.length}행)`);
  }
}

main().catch((err) => {
  console.error("동기화 실패:", err.message);
  process.exit(1);
});
