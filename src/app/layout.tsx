import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "제주도 여행 가계부";
const description = "친구들과 함께 쓰고, 공평하게 나누는 제주도 여행 경비 가계부";

export const metadata: Metadata = {
  // OG 이미지 등 절대 URL 생성 기준. 배포 서버의 .env.local 에 SITE_URL 설정
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: title,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
