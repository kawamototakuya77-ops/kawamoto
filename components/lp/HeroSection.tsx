"use client";

import React, { useState, useEffect } from "react";

interface HitItem {
  venue: string;
  combo: string;
  payout: string;
  dateLabel: string;
  rank?: string;
}

export default function HeroSection() {
  const stripeProUrl = "https://buy.stripe.com/14A9AT6E6aBY0pHbDFgjC02";

  // 動的フェッチ用状態（ダミー固定データの完全廃止）
  const [hits, setHits] = useState<HitItem[]>([
    { venue: "直近的中実績", combo: "--", payout: "--円", dateLabel: "データ読み込み中...", rank: "S" }
  ]);
  const [hitIdx, setHitIdx] = useState(0);

  useEffect(() => {
    // APIから本物の確定的中実績を取得
    async function fetchRealHits() {
      try {
        const res = await fetch("/api/recent-hits");
        if (res.ok) {
          const data = await res.json();
          if (data && data.hits && data.hits.length > 0) {
            setHits(data.hits);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch real hits:", e);
      }
    }
    fetchRealHits();
  }, []);

  useEffect(() => {
    if (hits.length <= 1) return;
    const timer = setInterval(() => {
      setHitIdx((prev) => (prev + 1) % hits.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [hits.length]);

  const currentHit = hits[hitIdx] || hits[0];

  return (
    <section className="relative py-12 px-4 max-w-4xl mx-auto overflow-hidden">
      {/* Background Neon Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 text-left sm:text-center">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap sm:justify-center">
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-black text-emerald-400 tracking-widest uppercase">
            Physics-Based AI
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-black text-indigo-400">
            全国24場 リアルタイム直前監視
          </span>
        </div>

        {/* H1 Main Copy */}
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight font-outfit tracking-tight">
          感情ゼロ。
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #34d399, #2dd4bf)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            直前展示の『偽物』を暴く
          </span>
          <br />
          データ解析エンジン
        </h1>

        {/* Sub Copy */}
        <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
          展示タイムの数字や過剰人気オッズに騙されていませんか？
          <br className="hidden sm:inline" />
          スリットの行き足・回り足の物理データをGemini × LightGBMがミリ秒解析。
          <strong className="text-amber-400 font-bold"> 期待値(EV) 1.2以上の激アツレース</strong>だけを冷徹に厳選。
        </p>

        {/* Realtime Hit Evidence Card (100% Real Data Dynamic) */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 max-w-lg mx-auto shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-bl-lg flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            AI信頼度 {currentHit.rank || "S"}ランク
          </div>
          <p className="text-xs font-bold text-slate-400 flex items-center justify-between gap-1.5 mb-1.5 pr-20">
            <span>🔥 <strong className="text-amber-400 font-extrabold">直近のAI推奨ヒット実績</strong></span>
            <span className="text-[11px] text-emerald-400 font-mono font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              {currentHit.dateLabel}
            </span>
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-xl font-black text-white">{currentHit.venue}</span>
            <span className="text-emerald-400 font-bold font-mono text-lg">{currentHit.combo}</span>
            <span className="text-amber-400 font-black text-xl">{currentHit.payout} 的中🎯</span>
          </div>
        </div>

        {/* 3 Stats Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-center">
          <div className="bg-slate-950/70 rounded-2xl p-3 border border-white/10">
            <div className="text-lg sm:text-xl font-black font-outfit text-emerald-400">24場</div>
            <div className="text-xs text-slate-400 font-bold mt-0.5">全場LIVE監視</div>
          </div>
          <div className="bg-slate-950/70 rounded-2xl p-3 border border-white/10">
            <div className="text-lg sm:text-xl font-black font-outfit text-amber-400">資金防衛</div>
            <div className="text-xs text-slate-400 font-bold mt-0.5">見送りAI判定</div>
          </div>
          <div className="bg-slate-950/70 rounded-2xl p-3 border border-white/10">
            <div className="text-lg sm:text-xl font-black font-outfit text-indigo-400">¥0</div>
            <div className="text-xs text-slate-400 font-bold mt-0.5">解約金0円・いつでも解約可能</div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2 max-w-lg mx-auto">
          <a
            href={stripeProUrl}
            className="block w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all text-center"
          >
            👑 PROプランを全場完全解禁（月額1,980円）
          </a>
        </div>
      </div>
    </section>
  );
}
