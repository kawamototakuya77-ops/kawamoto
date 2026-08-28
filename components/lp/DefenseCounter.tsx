"use client";

import { useEffect, useState } from "react";

/**
 * 本日の見送り推奨レース実績カウンター
 * - /api/today-stats から実際のDBデータを取得して表示
 * - データがない場合はセクション自体を非表示（架空の数値は出さない）
 */
export default function DefenseCounter() {
  const [data, setData] = useState<{ skipCount: number; totalRaces: number; successRate: number; dateLabel: string } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/today-stats");
        if (res.ok) {
          const json = await res.json();
          if (json && json.skipCount > 0) {
            setData(json);
          }
        }
      } catch (e) {
        console.warn("DefenseCounter: fetch failed", e);
      }
    }
    fetchStats();
  }, []);

  // データなし or 0件の場合は表示しない（架空数値で誤誘導しない）
  if (!data) return null;

  return (
    <section className="rounded-3xl p-6 border border-amber-500/30 bg-amber-500/5 space-y-3 text-center">
      <p className="text-sm font-bold text-amber-400 tracking-wider uppercase flex items-center justify-center gap-2">
        <span>🛡️ 本日（{data.dateLabel}）AI見送り推奨レース実績</span>
      </p>
      <div className="text-5xl font-black font-outfit tabular-nums"
        style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {data.skipCount}R
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">
        AIが本日「見送り推奨」と判定したレース数
        <br />
        <span className="text-amber-300 font-semibold">
          （本日解析対象{data.totalRaces}R中 / 見送り判定率 {data.successRate}%）
        </span>
      </p>
      <p className="text-xs text-slate-500">
        ※ 当日の全場開催レース解析データより集計。EV1.2未満を見送り推奨と判定。
      </p>
    </section>
  );
}
