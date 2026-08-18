import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDb } from "@/lib/firebaseAdmin";
import { ELEMENT_BANK, ELEMENT_ORDER, getVillageName } from "@/lib/result-engine/elements";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mapSnap = await getDb().collection("maps").doc(slug).get();
  const mapData = mapSnap.exists ? mapSnap.data()! : null;
  const ownerName = mapData?.ownerName ?? "누군가";
  const villageName = mapData
    ? getVillageName(mapData.ownerElement, mapData.ownerName, mapData.ownerBirthdate)
    : "케미 마을";

  const fontData = await readFile(path.join(process.cwd(), "public/fonts/Pretendard-Bold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff2d6",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ display: "flex", fontSize: 80, marginBottom: 16 }}>🏠</div>
        <div style={{ display: "flex", fontSize: 56, color: "#3a2a1a", textAlign: "center" }}>
          {`${ownerName}님의 ${villageName}`}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
          {ELEMENT_ORDER.map((key) => (
            <div
              key={key}
              style={{
                display: "flex",
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: ELEMENT_BANK[key].color,
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#7a5c3a", marginTop: 26 }}>
          생일과 MBTI만 넣으면, 내가 이 사람에게 어떤 사람인지 나와요
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Pretendard", data: fontData, weight: 700, style: "normal" }],
    }
  );
}
