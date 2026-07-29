import type { Metadata } from "next";
import { Outfit, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const noto = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "競艇直前物理AI | AIが弾き出すリアルタイム展開予測",
    template: "%s | 競艇直前物理AI",
  },
  description:
    "展示データ×LightGBM×Geminiの3段階AI予測。直前情報を全自動取得し、イン逃げ信頼度・コース別STをリアルタイムスコアリング。",
  metadataBase: new URL("https://kyotei-ai.vercel.app"),
  openGraph: {
    siteName: "競艇直前物理AI",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@kyotei_ai",
  },
};

import GoogleAnalytics from "@/components/GoogleAnalytics";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${outfit.variable} ${noto.variable}`}>
      <body className="min-h-screen bg-slate-950 antialiased font-sans">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID as string} />
        {children}
      </body>
    </html>
  );
}
