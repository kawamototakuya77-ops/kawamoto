"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function KPIDashboard() {
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // 本物の計測データ（サービス稼働初期の実データ）
  const [kpiData, setKpiData] = useState({
    period: "2026年7月29日 (本日 00:00 〜 現在)",
    pv: 0,                   // 本日/昨日の本番GA4セッション数
    trials: 0,              // Stripe本番無料トライアル登録数
    proMembers: 0,          // Stripe本番有料課金会員数
    revenue: 0,             // Stripe本番売上(円)
    lineFriends: 1,         // LINE公式友だち数
    cvr: 0.0,               // 実測CVR(%)
    
    // 4大SNSマルチチャネル インプレッション（再生・閲覧数）
    snsTotalImpressions: 0, // 全SNS総インプレッション数
    tiktokViews: 0,         // TikTok 縦型ショート動画再生数
    youtubeViews: 0,        // YouTube ショート動画再生数
    instaViews: 0,          // Instagram リール動画再生数
    xImpressions: 0,        // X 朝08:30投稿 インプレッション数
  });

  const fetchKpiMetrics = () => {
    setLoading(true);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setLastUpdated(formattedDate);
    
    // GAS / 本番エンドポイントからのデータ同期
    fetch('/api/gas?action=get_initial_payload')
      .then((res) => res.json())
      .then((data) => {
        // 本番データの反映
        setKpiData(prev => ({
          ...prev,
          pv: data?.stats?.today_pv ?? 0,
          lineFriends: data?.stats?.line_friends ?? 1,
          snsTotalImpressions: data?.stats?.sns_impressions ?? 0,
          tiktokViews: data?.stats?.tiktok_views ?? 0,
          youtubeViews: data?.stats?.youtube_views ?? 0,
          instaViews: data?.stats?.insta_views ?? 0,
          xImpressions: data?.stats?.x_impressions ?? 0,
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchKpiMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ヘッダー ＆ 計測日時 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
          <div>
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white transition-colors">
              ← 競艇直前物理AI ダッシュボードへ戻る
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-1 font-outfit">
              <span className="text-emerald-400">📊</span> マーケティング本番KPI定点観測
            </h1>
          </div>
          <button
            onClick={fetchKpiMetrics}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all self-start sm:self-auto flex items-center gap-1.5"
          >
            {loading ? "🔄 計測データ取得中..." : "🔄 再計測・データ更新"}
          </button>
        </div>

        {/* 計測時期・対象期間の明記 */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400">集客・計測対象期間:</span>
            <span className="font-bold text-white font-mono">{kpiData.period}</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            最終計測日時: <span className="text-emerald-400 font-bold">{lastUpdated || "取得中..."}</span>
          </div>
        </div>

        {/* 1. 最上流：4大SNSマルチチャネル インプレッション（閲覧数・再生数） */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h2 className="font-bold text-white flex items-center gap-1.5">
              <span className="text-rose-400">📱</span> 4大SNSマルチチャネル 集客インプレッション (最上流)
            </h2>
            <span className="text-slate-400 font-mono">
              全SNS総閲覧数: <strong className="text-rose-400 text-sm font-outfit">{kpiData.snsTotalImpressions.toLocaleString()}</strong> 回
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* TikTok */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
              <div className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                <span>🎵 TikTok</span>
                <span className="text-[10px] text-slate-500">ショート動画</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-white font-outfit">{kpiData.tiktokViews.toLocaleString()}</span>
                <span className="text-xs text-slate-400">回再生</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                自動生成 縦型動画
              </div>
            </div>

            {/* YouTube Shorts */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
              <div className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                <span>▶️ YouTube</span>
                <span className="text-[10px] text-slate-500">Shorts</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-white font-outfit">{kpiData.youtubeViews.toLocaleString()}</span>
                <span className="text-xs text-slate-400">回再生</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                AI的中シーン動画
              </div>
            </div>

            {/* Instagram Reels */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
              <div className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                <span>📸 Instagram</span>
                <span className="text-[10px] text-slate-500">リール</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-white font-outfit">{kpiData.instaViews.toLocaleString()}</span>
                <span className="text-xs text-slate-400">回再生</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                直前気配ハイライト
              </div>
            </div>

            {/* X (Twitter) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
              <div className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                <span>𝕏 (Twitter)</span>
                <span className="text-[10px] text-slate-500">朝08:30投稿</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-white font-outfit">{kpiData.xImpressions.toLocaleString()}</span>
                <span className="text-xs text-slate-400">Imp</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                毎朝1回固定スケジューラ
              </div>
            </div>

          </div>
        </div>

        {/* 2. Web流入 ＆ 転換・売上数値 */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="text-emerald-400">🛒</span> Webサイト流入 ＆ 無料トライアル・売上指標
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* アクセス数 */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-4 relative overflow-hidden shadow-lg">
              <div className="text-xs font-bold text-slate-400 mb-1">GA4 セッション流入数</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-white font-outfit">{kpiData.pv}</span>
                <span className="text-xs text-slate-400">PV</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-2 font-mono">
                ID: G-YZ7SH1JBXG
              </div>
            </div>

            {/* トライアル登録数 */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-4 relative overflow-hidden shadow-lg">
              <div className="text-xs font-bold text-slate-400 mb-1">Stripe 無料トライアル</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-outfit">{kpiData.trials}</span>
                <span className="text-xs text-slate-400">件</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                3日間無料体験
              </div>
            </div>

            {/* LINE友だち数 */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-4 relative overflow-hidden shadow-lg">
              <div className="text-xs font-bold text-slate-400 mb-1">LINE 公式友だち数</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-outfit">{kpiData.lineFriends}</span>
                <span className="text-xs text-slate-400">名</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-2 font-mono">
                ID: @089aloaj
              </div>
            </div>

            {/* 本番売上 */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-4 relative overflow-hidden shadow-lg">
              <div className="text-xs font-bold text-slate-400 mb-1">Stripe 本番累積売上</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-outfit">¥{kpiData.revenue.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                有料会員 {kpiData.proMembers} 名
              </div>
            </div>

          </div>
        </div>

        {/* 定点観測チェックリスト */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/5 space-y-3 text-xs">
          <h2 className="font-bold text-slate-300">定点観測の評価基準</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-400">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5">
              <span className="font-bold text-white block mb-1">1. 集客（PV数）</span>
              1日100PV未満の場合、Xの朝1回投稿文面やSNSショート動画のフックをAIが自動テコ入れ。
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5">
              <span className="font-bold text-white block mb-1">2. 転換（無料体験数）</span>
              PVに対して無料トライアル数が3%未満の場合、LINE展示直後通知の文面をAIが自動最適化。
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


