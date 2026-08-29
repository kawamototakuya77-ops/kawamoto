"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SrankRace {
  venue: string;
  rno: number;
  deadline: string;
  rank: string;
  ev: number | null;
}

const VENUE_SLUG_MAP: Record<string, string> = {
  "桐生": "kiryu", "戸田": "toda", "江戸川": "edogawa", "平和島": "heiwajima",
  "多摩川": "tamagawa", "浜名湖": "hamanako", "蒲郡": "gamagori", "常滑": "tokoname",
  "津": "tsu", "三国": "mikuni", "びわこ": "biwako", "住之江": "suminoe",
  "尼崎": "amagasaki", "鳴門": "naruto", "丸亀": "marugame", "児島": "kojima",
  "宮島": "miyajima", "徳山": "tokuyama", "下関": "shimonoseki", "若松": "wakamatsu",
  "芦屋": "ashiya", "福岡": "fukuoka", "唐津": "karatsu", "大村": "omura"
};

/**
 * 本日のAI厳選Sランクレース一覧セクション
 * /api/today-srank から実データを取得して出走順で表示
 */
export default function SrankSection() {
  const [races, setRaces] = useState<SrankRace[]>([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

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

  const displayedRaces = showAll ? races : races.slice(0, 6);

  return (
    <section className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-slate-900/90 p-5 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
          </span>
          ☀️ 本日（{date}）AI厳選 Sランクレース
        </h2>
        <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
          {races.length}R 厳選（出走順）
        </span>
      </div>

      <div className="space-y-2">
        {displayedRaces.map((r, i) => {
          const slug = VENUE_SLUG_MAP[r.venue] || "mikuni";
          return (
            <Link
              key={i}
              href={`/race/${slug}-${r.rno}r`}
              className="flex items-center justify-between bg-slate-900/90 hover:bg-emerald-950/40 rounded-xl px-4 py-3 border border-white/5 hover:border-emerald-500/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                  ★S
                </span>
                <span className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                  {r.venue} {r.rno}R
                </span>
              </div>
              <div className="flex items-center gap-3 text-right">
                {r.ev && (
                  <span className="text-xs text-amber-400 font-mono font-bold bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                    EV {r.ev}
                  </span>
                )}
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  締切 {r.deadline}
                </span>
                <span className="text-xs text-slate-500 group-hover:text-emerald-400 transition-colors">
                  ➔
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {races.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-center text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          {showAll ? "▲ 表示を折りたたむ" : `▼ 残り ${races.length - 6} レースをすべて見る`}
        </button>
      )}

      <Link
        href="/dashboard"
        className="block w-full py-3.5 px-4 text-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-98"
      >
        🏁 全24場 リアルタイムAIダッシュボードへ
      </Link>
    </section>
  );
}