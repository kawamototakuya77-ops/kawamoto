"use client";

import { useEffect } from "react";
import { useAllPredictions } from "@/hooks/useLivePrediction";
import { useRouter } from "next/navigation";

// 明示的配列定義でJSオブジェクトキーソート順化バグ(01-09が10-24の後に回る現象)を100%防止
const VENUE_LIST = [
  { jcd: "01", name: "桐生" },
  { jcd: "02", name: "戸田" },
  { jcd: "03", name: "江戸川" },
  { jcd: "04", name: "平和島" },
  { jcd: "05", name: "多摩川" },
  { jcd: "06", name: "浜名湖" },
  { jcd: "07", name: "蒲郡" },
  { jcd: "08", name: "常滑" },
  { jcd: "09", name: "津" },
  { jcd: "10", name: "三国" },
  { jcd: "11", name: "びわこ" },
  { jcd: "12", name: "住之江" },
  { jcd: "13", name: "尼崎" },
  { jcd: "14", name: "鳴門" },
  { jcd: "15", name: "丸亀" },
  { jcd: "16", name: "児島" },
  { jcd: "17", name: "宮島" },
  { jcd: "18", name: "徳山" },
  { jcd: "19", name: "下関" },
  { jcd: "20", name: "若松" },
  { jcd: "21", name: "芦屋" },
  { jcd: "22", name: "福岡" },
  { jcd: "23", name: "唐津" },
  { jcd: "24", name: "大村" }
];

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
      {/* Venue grid (1桐生〜24大村の絶対順序保持) */}
      <div className="grid grid-cols-4 gap-1.5 p-3 bg-slate-950/50 rounded-2xl border border-white/5">
        {VENUE_LIST.map(({ jcd, name }) => {
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
    </div>
  );
}
