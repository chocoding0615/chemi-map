import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.ttf",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "케미 지도",
  description: "생일과 MBTI만 넣으면, 내가 이 사람에게 어떤 사람인지 나와요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 font-[family-name:var(--font-pretendard)]">
        {children}
      </body>
    </html>
  );
}
