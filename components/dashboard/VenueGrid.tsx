"use client";

import { useEffect, useState } from "react";
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
  const [currentJcd, setCurrentJcd] = useState<string>(selectedJcd || "10");

  // 競艇場ごとの開催種別（モーニング / デイ / ナイター）
  const MORNING_VENUES = ["10", "14", "18", "21", "23"]; // 三国, 鳴門, 徳山, 芦屋, 唐津
  const NIGHTER_VENUES = ["01", "07", "12", "15", "19", "20", "24"]; // 桐生, 蒲郡, 住之江, 丸亀, 下関, 若松, 大村

  // 種別ごとの標準締切時刻テーブル
  const MORNING_SCHEDULE: Record<string, string> = {
    "1": "08:35", "2": "09:00", "3": "09:25", "4": "09:50", "5": "10:18", "6": "10:50",
    "7": "11:20", "8": "11:52", "9": "12:27", "10": "13:00", "11": "13:35", "12": "14:15"
  };
  const DAY_SCHEDULE: Record<string, string> = {
    "1": "10:45", "2": "11:10", "3": "11:35", "4": "12:05", "5": "12:35", "6": "13:05",
    "7": "13:40", "8": "14:15", "9": "14:50", "10": "15:25", "11": "16:05", "12": "16:45"
  };
  const NIGHTER_SCHEDULE: Record<string, string> = {
    "1": "15:15", "2": "15:40", "3": "16:05", "4": "16:30", "5": "17:00", "6": "17:30",
    "7": "18:00", "8": "18:30", "9": "19:00", "10": "19:35", "11": "20:10", "12": "20:45"
  };

  const getDefaultScheduleForJcd = (jcd: string): Record<string, string> => {
    if (MORNING_VENUES.includes(jcd)) return MORNING_SCHEDULE;
    if (NIGHTER_VENUES.includes(jcd)) return NIGHTER_SCHEDULE;
    return DAY_SCHEDULE;
  };

  // 直近のレース時間を計算する関数
  const getNextCutoff = (jcd: string) => {
    const map = (cutoffTimes && cutoffTimes[jcd] && Object.keys(cutoffTimes[jcd]).length > 0)
      ? (cutoffTimes[jcd] as Record<string, string>)
      : getDefaultScheduleForJcd(jcd);
      
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    let nextTime = "";
    let minDiff = Infinity;
    
    Object.entries(map).forEach(([rno, timeStr]) => {
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
    if (activeVenues.length > 0 && cutoffTimes) {
      let closestJcd = activeVenues[0];
      let globalMinDiff = Infinity;
      
      activeVenues.forEach(jcd => {
        const res = getNextCutoff(jcd);
        if (res && res.minDiff < globalMinDiff) {
          globalMinDiff = res.minDiff;
          closestJcd = jcd;
        }
      });
      
      if (closestJcd && !selectedJcd) {
        setCurrentJcd(closestJcd);
        onSelect(closestJcd);
      }
    }
  }, [activeVenues, cutoffTimes]);

  useEffect(() => {
    if (selectedJcd) {
      setCurrentJcd(selectedJcd);
    }
  }, [selectedJcd]);

  const handleVenueClick = (jcd: string) => {
    setCurrentJcd(jcd);
    onSelect(jcd);
  };

  const handleRaceLink = (jcd: string, rno: number) => {
    const slug = VENUE_SLUG[jcd] || jcd;
    router.push(`/race/${slug}-${rno}r`);
  };

  const selectedVenueObj = VENUE_LIST.find(v => v.jcd === currentJcd) || VENUE_LIST[9]; // デフォルト三国
  const timesMap = (cutoffTimes && cutoffTimes[currentJcd] && Object.keys(cutoffTimes[currentJcd]).length > 0)
    ? cutoffTimes[currentJcd]
    : getDefaultScheduleForJcd(currentJcd);

  return (
    <div className="space-y-6">
      {/* 24競艇場 グリッド (1桐生〜24大村の絶対順序保持) */}
      <div className="grid grid-cols-4 gap-1.5 p-3 bg-slate-950/50 rounded-2xl border border-white/5">
        {VENUE_LIST.map(({ jcd, name }) => {
          // activeVenues が空の場合、cutoffTimesが存在する場を開催場と判定するフォールバック
          const hasCutoff = cutoffTimes && cutoffTimes[jcd] && Object.keys(cutoffTimes[jcd]).length > 0;
          const isActive = activeVenues.includes(jcd) || Boolean(hasCutoff);
          const isSelected = jcd === currentJcd;
          const nextCutoff = isActive ? getNextCutoff(jcd) : null;

          return (
            <button
              key={jcd}
              onClick={() => handleVenueClick(jcd)}
              className={[
                "relative py-2.5 px-1.5 rounded-xl text-sm font-bold transition-all text-center flex flex-col items-center justify-center min-h-[4.2rem]",
                isSelected
                  ? "bg-emerald-500/25 border-2 border-emerald-400 text-emerald-300 scale-[1.03] shadow-[0_0_16px_rgba(16,185,129,0.5)] z-10"
                  : isActive
                  ? "bg-slate-900 border-2 border-emerald-500/60 text-white hover:bg-slate-800 shadow-[0_0_10px_rgba(16,185,129,0.25)] hover:shadow-[0_0_15px_rgba(16,185,129,0.45)] cursor-pointer"
                  : "bg-slate-950/60 border border-white/5 text-slate-600 hover:border-white/10 cursor-pointer",
              ].join(" ")}
            >
              {/* 開催中パルスドット */}
              {isActive && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
                </span>
              )}

              <span className={`block font-black ${isActive ? "text-white" : "text-slate-500"}`}>{name}</span>

              {isActive ? (
                <span className="block text-[10px] text-emerald-400 mt-1 font-mono font-black tracking-wider bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.5 rounded shadow-sm">
                  {nextCutoff?.nextTime ? `${nextCutoff.nextTime}締切` : "開催中"}
                </span>
              ) : (
                <span className="block text-[9px] text-slate-600 mt-1">非開催</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1R〜12R レース選択グリッド */}
      <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>{selectedVenueObj.name}</span>
            <span className="text-slate-400 font-normal text-sm">— レース選択</span>
          </h3>
          <span className="text-xs text-slate-400">タップで詳細予想へ</span>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((rno) => {
            const timeStr = timesMap[String(rno)] || timesMap[rno] || "締切前";
            return (
              <button
                key={rno}
                onClick={() => handleRaceLink(currentJcd, rno)}
                className="py-3 px-2 rounded-xl bg-slate-800/80 hover:bg-emerald-500/20 hover:border-emerald-500/50 border border-slate-700/60 text-center transition-all group flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <span className="text-base font-black text-white group-hover:text-emerald-400">
                  {rno}R
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-emerald-300">
                  {timeStr}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
