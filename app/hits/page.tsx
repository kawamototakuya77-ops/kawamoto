"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LpHeader from "@/components/lp/LpHeader";
import LpFooter from "@/components/lp/LpFooter";

export default function HitsLogPage() {
  const stripeProUrl = "https://buy.stripe.com/14A9AT6E6aBY0pHbDFgjC02";
  const [hits, setHits] = useState<Array<{ venue: string; combo: string; payout: string; dateLabel: string; rank?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHits = async () => {
      try {
        const res = await fetch("/api/recent-hits");
        if (res.ok) {
          const json = await res.json();
          if (json && json.hits && json.hits.length > 0) {
            setHits(json.hits);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch hits log:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchHits();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <LpHeader />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-16 space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-black text-emerald-400 tracking-wider">
            データ透明性100%保証
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            🎯 AI的中実績 ＆ 月間回収率(ROI) ログ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            物理モデル（Gemini × LightGBM）が事前・直前展示データから算出し、実際に確定・的中した本物の実績のみを記録・公開しています。
          </p>
        </div>

        {/* Hits Table Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <span>🔥 直近確定のAI推奨的中結果</span>
            </h2>
            <span className="text-xs text-emerald-400 font-mono font-bold">100%実測検証済み</span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400 font-mono">
              データを読み込み中...
            </div>
          ) : hits.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              本日の確定的中レースはまだありません。リアルタイム監視を継続中です。
            </div>
          ) : (
            <div className="space-y-3">
              {hits.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-white/5 hover:border-emerald-500/30 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black font-mono">
                        {h.rank || "S"}ランク
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{h.dateLabel}</span>
                    </div>
                    <div className="text-base font-black text-white">{h.venue}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold font-mono text-base">{h.combo}</div>
                    <div className="text-amber-400 font-black text-sm">{h.payout} 的中🎯</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-emerald-500/30 text-center space-y-4">
          <h3 className="text-lg font-black text-white">PROプランで全24場リアルタイムAI分析を解放</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            展示直前の物理データ（スリット隊形・タイム差）から期待値(EV)1.2以上のレースを全自動で検知。
          </p>
          <a
            href={stripeProUrl}
            className="inline-block py-3 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm shadow-lg transition-all"
          >
            👑 PROプランに登録（月額1,980円）
          </a>
        </div>

      </main>
      <LpFooter />
    </div>
  );
}
