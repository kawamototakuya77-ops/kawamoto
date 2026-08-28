"use client";

import { useEffect, useState } from "react";

interface SrankRace {
  venue: string;
  rno: number;
  deadline: string;
  rank: string;
  ev: number | null;
}

/**
 * 本日のAI厳選Sランクレース一覧セクション
 * /api/today-srank から実データを取得して表示
 * データなし or 取得失敗時は非表示（架空データは出さない）
 */
export default function SrankSection() {
  const [races, setRaces] = useState<SrankRace[]>([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSrank() {
      try {
        const res = await fetch("/api/today-srank", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.races && json.races.length > 0) {
            setRaces(json.races);
            setDate(json.date);
          }
        }
      } catch (_) {}
      finally { setLoading(false); }
    }
    fetchSrank();
  }, []);

  if (loading) return null;
  if (races.length === 0) return null;

  return (
    <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          ☀️ 本日（{date}）AI厳選 Sランクレース
        </h2>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          {races.length}R 厳選
        </span>
      </div>

      <div className="space-y-2">
        {races.map((r, i) => (
          <div key={i} className="flex items-center justify-between bg-slate-900/80 rounded-xl px-4 py-3 border border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-500 text-white">S</span>
              <span className="text-sm font-bold text-white">{r.venue} {r.rno}R</span>
            </div>
            <div className="flex items-center gap-3 text-right">
              {r.ev && (
                <span className="text-xs text-amber-400 font-mono font-bold">EV {r.ev}</span>
              )}
              <span className="text-xs text-slate-400 font-mono">締切 {r.deadline}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 text-center">
        ※ 詳細な買い目・EV値はダッシュボードで確認できます
      </p>

      <a
        href="/dashboard"
        className="block w-full py-3 px-4 text-center rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-sm transition-colors"
      >
        🎯 ダッシュボードで買い目を確認する
      </a>
    </section>
  );
}