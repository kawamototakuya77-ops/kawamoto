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

const DEFAULT_TODAY_SRANKS: SrankRace[] = [
  { venue: "鳴門", rno: 1, deadline: "08:32", rank: "S", ev: 1.45 },
  { venue: "唐津", rno: 1, deadline: "08:40", rank: "S", ev: 1.38 },
  { venue: "三国", rno: 2, deadline: "09:12", rank: "S", ev: 1.42 },
  { venue: "鳴門", rno: 3, deadline: "09:20", rank: "S", ev: 1.50 },
  { venue: "唐津", rno: 3, deadline: "09:28", rank: "S", ev: 1.41 },
  { venue: "三国", rno: 4, deadline: "10:01", rank: "S", ev: 1.35 },
  { venue: "唐津", rno: 4, deadline: "10:19", rank: "S", ev: 1.48 },
  { venue: "鳴門", rno: 5, deadline: "10:12", rank: "S", ev: 13.68 },
  { venue: "鳴門", rno: 6, deadline: "10:41", rank: "S", ev: 5.63 },
  { venue: "宮島", rno: 1, deadline: "10:45", rank: "S", ev: 3.94 },
  { venue: "津", rno: 2, deadline: "10:54", rank: "S", ev: 3.07 },
  { venue: "びわこ", rno: 2, deadline: "10:58", rank: "S", ev: 37.07 },
  { venue: "宮島", rno: 2, deadline: "11:12", rank: "S", ev: 6.56 },
  { venue: "津", rno: 3, deadline: "11:21", rank: "S", ev: 2.38 },
  { venue: "びわこ", rno: 3, deadline: "11:25", rank: "S", ev: 14.49 },
  { venue: "尼崎", rno: 3, deadline: "11:29", rank: "S", ev: 2.21 },
  { venue: "児島", rno: 3, deadline: "12:17", rank: "S", ev: 3.09 },
  { venue: "宮島", rno: 3, deadline: "11:40", rank: "S", ev: 9.49 },
  { venue: "平和島", rno: 1, deadline: "11:48", rank: "S", ev: 5.82 },
  { venue: "多摩川", rno: 1, deadline: "11:29", rank: "S", ev: 4.38 },
  { venue: "津", rno: 4, deadline: "11:49", rank: "S", ev: 20.38 },
  { venue: "びわこ", rno: 4, deadline: "11:53", rank: "S", ev: 15.86 },
  { venue: "尼崎", rno: 4, deadline: "11:57", rank: "S", ev: 5.33 },
  { venue: "宮島", rno: 4, deadline: "12:09", rank: "S", ev: 18.05 },
  { venue: "平和島", rno: 2, deadline: "12:15", rank: "S", ev: 10.48 },
  { venue: "多摩川", rno: 2, deadline: "11:57", rank: "S", ev: 2.16 },
  { venue: "津", rno: 5, deadline: "12:18", rank: "S", ev: 8.91 },
  { venue: "びわこ", rno: 5, deadline: "12:22", rank: "S", ev: 34.46 },
  { venue: "尼崎", rno: 5, deadline: "12:26", rank: "S", ev: 14.43 },
  { venue: "宮島", rno: 5, deadline: "12:39", rank: "S", ev: 2.70 },
  { venue: "三国", rno: 7, deadline: "11:27", rank: "S", ev: 55.92 },
  { venue: "鳴門", rno: 7, deadline: "11:11", rank: "S", ev: 67.90 },
  { venue: "三国", rno: 8, deadline: "11:59", rank: "S", ev: 64.10 },
  { venue: "鳴門", rno: 8, deadline: "11:43", rank: "S", ev: 2.69 },
  { venue: "唐津", rno: 8, deadline: "11:49", rank: "S", ev: 3.43 },
  { venue: "三国", rno: 9, deadline: "12:32", rank: "S", ev: 4.16 },
  { venue: "鳴門", rno: 9, deadline: "12:16", rank: "S", ev: 10.59 },
  { venue: "唐津", rno: 9, deadline: "12:22", rank: "S", ev: 4.67 },
  { venue: "多摩川", rno: 8, deadline: "15:03", rank: "S", ev: 1.55 },
  { venue: "宮島", rno: 9, deadline: "14:51", rank: "S", ev: 1.48 },
  { venue: "多摩川", rno: 10, deadline: "16:11", rank: "S", ev: 1.62 },
  { venue: "三国", rno: 11, deadline: "13:43", rank: "S", ev: 1.30 },
  { venue: "びわこ", rno: 10, deadline: "15:07", rank: "S", ev: 1.45 },
  { venue: "尼崎", rno: 10, deadline: "15:11", rank: "S", ev: 1.52 },
  { venue: "鳴門", rno: 10, deadline: "12:51", rank: "S", ev: 1.39 },
  { venue: "唐津", rno: 11, deadline: "13:38", rank: "S", ev: 1.40 },
  { venue: "多摩川", rno: 12, deadline: "17:15", rank: "S", ev: 1.58 },
  { venue: "下関", rno: 5, deadline: "17:08", rank: "S", ev: 1.45 },
  { venue: "唐津", rno: 12, deadline: "14:21", rank: "S", ev: 1.42 }
].sort((a, b) => a.deadline.localeCompare(b.deadline));

/**
 * 本日のAI厳選Sランクレース一覧セクション
 * /api/today-srank から実データを取得して出走順で表示
 */
export default function SrankSection() {
  const [races, setRaces] = useState<SrankRace[]>(DEFAULT_TODAY_SRANKS);
  const [date, setDate] = useState("8/29");
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
    }
    fetchSrank();
  }, []);

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