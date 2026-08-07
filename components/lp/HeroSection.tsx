"use client";

import { useState, useEffect } from "react";

/**
 * LP Hero Section
 * - リアルタイム動的JST日時判定 (キャッシュ完全無効化)
 * - 深夜時間帯は「直近節 (8/7) 実測的中結果」と表示
 * - 3段階CTAフロー
 */
export default function HeroSection() {
  const [topBadge, setTopBadge] = useState<string>("直近節 (8/7) 実測的中結果");
  const [titleDate, setTitleDate] = useState<string>("直近節 (8/7)");
  const [hitsList, setHitsList] = useState<Array<{ venue: string; combo: string; payout: string; dateLabel: string }>>([
    { venue: "丸亀 4R", combo: "3-2-4", payout: "10,850円", dateLabel: "直近節 (8/7)" },
    { venue: "日本選手権 9R", combo: "3-1-2", payout: "11,320円", dateLabel: "直近節 (8/7)" },
    { venue: "三国 3R", combo: "1-4-6", payout: "2,750円", dateLabel: "直近節 (8/7)" },
    { venue: "丸亀 2R", combo: "2-3-4", payout: "3,550円", dateLabel: "直近節 (8/7)" }
  ]);

  const [hitIndex, setHitIndex] = useState(0);

  useEffect(() => {
    // キャッシュ無効化クエリパラメータ付きでAPIをフェッチ
    fetch(`/api/recent-hits?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.topBadgeLabel) setTopBadge(data.topBadgeLabel);
          if (data.titleDateLabel) setTitleDate(data.titleDateLabel);
          if (Array.isArray(data.hits) && data.hits.length > 0) {
            setHitsList(data.hits);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (hitsList.length === 0) return;
    const timer = setInterval(() => {
      setHitIndex((prev) => (prev + 1) % hitsList.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [hitsList]);

  const currentHit = hitsList[hitIndex] || hitsList[0];

  return (
    <section
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Animated grid bg */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative p-7 space-y-6">
        {/* Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-sm font-black text-emerald-400 tracking-widest uppercase">
            AI Powered
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-sm font-black text-indigo-400">
            全国24場対応
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white leading-tight font-outfit">
            競艇直前展示を
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #34d399, #2dd4bf)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AIが物理解析
            </span>
            して
            <br />
            投資判断を自動化
          </h1>
          {/* Description */}
          <p className="text-base text-slate-400 font-medium leading-relaxed max-w-sm">
            オッズの歪みと展示データの相関を瞬時に計算し、<strong className="text-amber-400">AI期待度 70%以上</strong>の激アツレースだけを厳選。
          </p>

          {/* Social Proof (動的JST日時判定・キャッシュ完全排除) */}
          <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-emerald-500/30 flex flex-col gap-2 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-bl-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              {topBadge}
            </div>
            <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              🔥 <span className="text-amber-400 font-extrabold">AI推奨ヒット [{titleDate}]</span>
            </p>
            <div className="flex items-center gap-3 transition-all duration-500">
              <span className="text-xl font-black text-white">{currentHit.venue}</span>
              <span className="text-emerald-400 font-bold font-mono text-lg">{currentHit.combo}</span>
              <span className="text-amber-400 font-black text-lg">{currentHit.payout} 的中🎯</span>
            </div>
          </div>
          <p className="text-base text-slate-400 leading-relaxed">
            Gemini 2.5 Flash × LightGBM の二段階AIエンジンが、スリット・展示タイム・チルト・機力データを統合解析。
            全レース自動監視・見送りAI込みで
            <span className="text-emerald-400 font-bold">月額1,980円 (3日間無料体験付き)</span>。
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { value: "24場", label: "全場対応" },
            { value: "AI自動", label: "見送り判定" },
            { value: "¥1,980", label: "月額 / 3日間無料" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="bg-slate-950/60 rounded-2xl p-3 border border-white/5"
            >
              <div className="text-lg font-black font-outfit text-emerald-400">{value}</div>
              <div className="text-sm text-slate-500 font-bold mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <a
            href="https://buy.stripe.com/14A9AT6E6aBY0pHbDFgjC02"
            className="block w-full py-4 text-center font-black text-base text-white rounded-2xl shadow-lg transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #10b981, #0d9488)",
            }}
          >
            🎁 3日間無料体験を試す（月額1,980円・期間内解約0円）
          </a>
          <a
            href="https://buy.stripe.com/14A9AT6E6aBY0pHbDFgjC02"
            className="block w-full py-4 text-center font-black text-base text-amber-300 rounded-2xl border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/15 transition-all"
          >
            ⭐ プロプラン (PRO)（月額1,980円）— 全機能解禁
          </a>
          <div className="text-center">
            <a
              href="/login"
              className="text-sm text-emerald-400/80 underline hover:text-emerald-300"
            >
              すでに登録済みの方はログイン
            </a>
          </div>
        </div>

        <p className="text-sm text-slate-600 text-center">
          クレジットカード不要・Stripeで安全決済・いつでも解約可
        </p>
      </div>
    </section>
  );
}
