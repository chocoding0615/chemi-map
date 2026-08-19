import type { Metadata } from "next";
import localFont from "next/font/local";
import { Gaegu } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import TailProgress from "@/components/TailProgress";
import ToastHost from "@/components/ToastHost";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.ttf",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

const gaegu = Gaegu({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-gaegu",
  display: "swap",
});

export const metadata: Metadata = {
  title: "여우점",
  description: "아기 구미호 복실이가 그려주는 나의 사주 — 여우점",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${gaegu.variable} h-full antialiased`}>
      <body className="bg-dots flex min-h-full flex-col bg-gradient-to-b from-cream via-apricot to-cream font-[family-name:var(--font-pretendard)]">
        <ToastHost />
        <TailProgress />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
