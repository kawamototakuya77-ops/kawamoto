import type { Metadata } from "next";
import HeroSection from "@/components/lp/HeroSection";
import PricingTable from "@/components/lp/PricingTable";
import FeatureGrid from "@/components/lp/FeatureGrid";
import DefenseCounter from "@/components/lp/DefenseCounter";
import SrankSection from "@/components/lp/SrankSection";
import LineBanner from "@/components/lp/LineBanner";
import LpHeader from "@/components/lp/LpHeader";
import LpFooter from "@/components/lp/LpFooter";

export const metadata: Metadata = {
  title: "競艇直前物理AI | AIが弾き出すリアルタイム展開予測",
  description:
    "展示データ×LightGBM×Geminiの3段階AI予測。単発100円で事前予想開放、月額1,980円でプロプランへ完全解禁。",
};

/**
 * LP ページ (/)
 * - 未ログインユーザーが最初に見るページ
 * - SSG でビルド時に生成 → 高速表示
 * - ダッシュボードのコードは一切含まない（認知負荷ゼロ）
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <LpHeader />
      <main className="max-w-lg mx-auto px-4 pt-20 pb-16 space-y-12">
        {/* ① ヒーロー：キャッチコピー + 一次CTA */}
        <HeroSection />
        {/* ② 本日のSランクレース一覧（実データあり時のみ表示） */}
        <SrankSection />
        {/* ③ 社会的証明：AIが今日回避した損失額のリアルタイムカウンター */}
        <DefenseCounter />
        {/* ④ 機能訴求 */}
        <FeatureGrid />
        {/* ⑤ 料金表：プロプランをアンカーに（松竹梅の法則） */}
        <PricingTable />
        {/* ⑥ LINEへの導線：X→サイト→LINE→PRO ファネルをつなぐ */}
        <LineBanner />
      </main>
      <LpFooter />
    </div>
  );
}
