"use client";

import { useEffect } from "react";
import { useAllPredictions } from "@/hooks/useLivePrediction";
import { useRouter } from "next/navigation";

const ALL_VENUES: Record<string, string> = {
  "01": "桐生", "02": "戸田", "03": "江戸川", "04": "平和島",
  "05": "多摩川", "06": "浜名湖", "07": "蒲郡", "08": "常滑",
  "09": "津", "10": "三国", "11": "びわこ", "12": "住之江",
  "13": "尼崎", "14": "鳴門", "15": "丸亀", "16": "児島",
  "17": "宮島", "18": "徳山", "19": "下関", "20": "若松",
  "21": "芦屋", "22": "福岡", "23": "唐津", "24": "大村",
};

const VENUE_SLUG: Record<string, string> = {
  "01": "kiryu", "02": "toda", "03": "edogawa", "04": "heiwajima",
  "05": "tamagawa", "06": "hamanako", "07": "gamagori", "08": "tokoname",
  "09": "tsu", "10": "mikuni", "11": "biwako", "12": "suminoe",
  "13": "amagasaki", "14": "naruto", "15": "marugame", "16": "kojima",
  "17": "miyajima", "18": "tokuyama", "19": "shimonoseki", "20": "wakamatsu",
  "21": "ashiya", "22": "fukuoka", "23": "karatsu", "24": "omura",
};

interface Props {
  selectedJcd: string;
  selectedRno: number;
  onSelect: (jcd: string) => void;
}

export default function VenueGrid({ selectedJcd, selectedRno, onSelect }: Props) {
  const { activeVenues, predictions, cutoffTimes, loading } = useAllPredictions();
  const router = useRouter();

  // 直近のレース時間を計算する関数
  const getNextCutoff = (jcd: string) => {
    if (!cutoffTimes || !cutoffTimes[jcd]) return null;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    let nextTime = "";
    let minDiff = Infinity;
    
    Object.entries(cutoffTimes[jcd] as Record<string, string>).forEach(([rno, timeStr]) => {
      const parts = timeStr.split(":");
      if (parts.length === 2) {
        const hh = parseInt(parts[0], 10);
        const mm = parseInt(parts[1], 10);
        const raceMins = hh * 60 + mm;
        const diff = raceMins - currentMins;
        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          nextTime = timeStr;
        }
      }
    });
    return { nextTime, minDiff };
  };

  // 初期ロード時に直近のレースがある場を自動選択
  useEffect(() => {
    if (!selectedJcd && activeVenues.length > 0 && cutoffTimes) {
      let closestJcd = activeVenues[0];
      let globalMinDiff = Infinity;
      
      activeVenues.forEach(jcd => {
        const res = getNextCutoff(jcd);
        if (res && res.minDiff < globalMinDiff) {
          globalMinDiff = res.minDiff;
          closestJcd = jcd;
        }
      });
      
      if (closestJcd) {
        onSelect(closestJcd);
      }
    }
  }, [selectedJcd, activeVenues, cutoffTimes, onSelect]);

  const handleVenueClick = (jcd: string) => {
    onSelect(jcd);
  };

  const handleRaceLink = (jcd: string, rno: number) => {
    const slug = VENUE_SLUG[jcd] || jcd;
    router.push(`/race/${slug}-${rno}r`);
  };

  return (
    <div className="space-y-4">
      {/* Venue grid */}
      <div className="grid grid-cols-4 gap-1.5 p-3 bg-slate-950/50 rounded-2xl border border-white/5">
        {Object.entries(ALL_VENUES).map(([jcd, name]) => {
          const isActive = activeVenues.includes(jcd);
          const isSelected = jcd === selectedJcd;
          const key = `${jcd}_${selectedRno}`;
          const pred = predictions[key];
          const phase = pred?.phase ?? 0;
          
          const nextCutoff = isActive ? getNextCutoff(jcd) : null;

          return (
            <button
              key={jcd}
              onClick={() => handleVenueClick(jcd)}
              className={[
                "relative py-2 px-1 rounded-xl text-sm font-bold transition-all text-center flex flex-col items-center justify-center min-h-[4rem]",
                isSelected
                  ? "bg-emerald-500/20 border-2 border-emerald-500/70 text-emerald-300"
                  : isActive
                  ? "bg-slate-800/80 border border-emerald-500/40 text-white hover:bg-slate-700"
                  : "bg-slate-900/40 border border-white/5 text-slate-600",
              ].join(" ")}
            >
              <span className="block">{name}</span>
              {isActive && nextCutoff?.nextTime && (
                <span className="block text-[10px] text-emerald-400 mt-1 font-mono font-black tracking-widest bg-emerald-900/30 px-1.5 py-0.5 rounded">
                  {nextCutoff.nextTime} 締切
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-3 text-sm text-slate-400 animate-pulse">
          データ取得中...
        </div>
      )}

      {/* Race buttons for selected venue */}
      {selectedJcd && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-400">
            {ALL_VENUES[selectedJcd]} — レース選択
          </p>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((rno) => {
              const key = `${selectedJcd}_${rno}`;
              const pred = predictions[key];
              const hasLive = pred?.phase === 2 || pred?.phase === 3;
              
              // このレースの締切時間
              const rTime = cutoffTimes?.[selectedJcd]?.[rno.toString()];

              return (
                <button
                  key={rno}
                  onClick={() => handleRaceLink(selectedJcd, rno)}
                  className={[
                    "py-2 rounded-xl text-sm font-black transition-all border flex flex-col items-center justify-center",
                    hasLive
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 animate-pulse"
                      : rno === selectedRno
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                      : "bg-slate-800 border-white/5 text-slate-400 hover:bg-slate-700 hover:text-white",
                  ].join(" ")}
                >
                  <span>{rno}R</span>
                  {rTime && (
                    <span className="block text-[9px] font-mono opacity-60 mt-0.5">{rTime}</span>
                  )}
                  {hasLive && (
                    <span className="block text-xs font-bold text-emerald-400 mt-0.5">LIVE</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
