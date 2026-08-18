import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mapSnap = await getDb().collection("maps").doc(slug).get();
  const ownerName = mapSnap.exists ? mapSnap.data()?.ownerName : "누군가";

  const fontData = await readFile(
    path.join(process.cwd(), "public/fonts/Pretendard-Bold.ttf")
  );

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
        <div style={{ fontSize: 64, marginBottom: 24 }}>🧭</div>
        <div style={{ fontSize: 56, color: "#3a2a1a", textAlign: "center" }}>
          {`${ownerName}님의 케미 지도`}
        </div>
        <div style={{ fontSize: 30, color: "#7a5c3a", marginTop: 20 }}>
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
