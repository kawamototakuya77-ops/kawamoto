"use client";

import React from 'react';
import Link from 'next/link';

export default function KPIDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ヘッダー */}
        <div className="border-b border-white/10 pb-4">
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← 競艇直前物理AI ダッシュボードへ戻る
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-1 font-outfit">
            <span className="text-emerald-400">📊</span> マーケティング実データ・管理画面ポータル
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            本物のアクセス数・売上・登録者数は、以下の各公式管理画面にてリアルタイムに確認できます。
          </p>
        </div>

        {/* 公式管理画面 ダイレクトリンク */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-500 transition-all group"
          >
            <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center justify-between">
              <span>GA4 アクセス解析</span>
              <span className="group-hover:translate-x-1 transition-transform">↗</span>
            </div>
            <div className="text-sm font-black text-white mb-2">リアルタイムPV / 流入元</div>
            <div className="text-[11px] text-slate-400 font-mono">ID: G-YZ7SH1JBXG</div>
          </a>

          <a
            href="https://dashboard.stripe.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-500 transition-all group"
          >
            <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center justify-between">
              <span>Stripe 決済管理</span>
              <span className="group-hover:translate-x-1 transition-transform">↗</span>
            </div>
            <div className="text-sm font-black text-white mb-2">売上 (MRR) / トライアル数</div>
            <div className="text-[11px] text-slate-400">3日間無料体験付き月額1,980円</div>
          </a>

          <a
            href="https://manager.line.biz/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-500 transition-all group"
          >
            <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center justify-between">
              <span>LINE 公式管理</span>
              <span className="group-hover:translate-x-1 transition-transform">↗</span>
            </div>
            <div className="text-sm font-black text-white mb-2">友だち数 / 送信ログ</div>
            <div className="text-[11px] text-slate-400 font-mono">ID: @089aloaj</div>
          </a>

        </div>

        {/* 全自動システム監視状況 */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
          <h2 className="text-xs font-bold text-slate-400">全自動マーケティング ＆ インフラ稼働状態</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-white/5">
              <div className="text-slate-300 font-bold mb-1">🤖 4大SNSマルチ自動投稿</div>
              <div className="text-slate-400">TikTok / Shorts / Insta / X（朝08:30投稿）が裏で全自動稼働中</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/80 border border-white/5">
              <div className="text-slate-300 font-bold mb-1">☁️ クラウドバックアップ</div>
              <div className="text-slate-400">GitHub Actions / Vercel Cron により自宅PCオフでも24時間365日稼働</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

