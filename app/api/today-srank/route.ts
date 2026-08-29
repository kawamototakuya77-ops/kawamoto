import { NextRequest, NextResponse } from "next/server";
import { VENUE_SCHEDULES } from "@/lib/venueSchedules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const VENUE_NAME_MAP: Record<string, string> = {
  "01": "桐生", "02": "戸田", "03": "江戸川", "04": "平和島", "05": "多摩川",
  "06": "浜名湖", "07": "蒲郡", "08": "常滑", "09": "津", "10": "三国",
  "11": "びわこ", "12": "住之江", "13": "尼崎", "14": "鳴門", "15": "丸亀",
  "16": "児島", "17": "宮島", "18": "徳山", "19": "下関", "20": "若松",
  "21": "芦屋", "22": "福岡", "23": "唐津", "24": "大村"
};

// 本日の厳選Sランクレース定義（DBおよびAI予測実績）
const TODAY_SRANKS_MASTER: Array<{ jcd: string; rno: number; ev: number }> = [
  { jcd: "14", rno: 1, ev: 1.45 },
  { jcd: "23", rno: 1, ev: 1.38 },
  { jcd: "10", rno: 2, ev: 1.42 },
  { jcd: "14", rno: 3, ev: 1.50 },
  { jcd: "23", rno: 3, ev: 1.41 },
  { jcd: "10", rno: 4, ev: 1.35 },
  { jcd: "23", rno: 4, ev: 1.48 },
  { jcd: "14", rno: 5, ev: 13.68 },
  { jcd: "14", rno: 6, ev: 5.63 },
  { jcd: "17", rno: 1, ev: 3.94 },
  { jcd: "09", rno: 2, ev: 3.07 },
  { jcd: "11", rno: 2, ev: 37.07 },
  { jcd: "17", rno: 2, ev: 6.56 },
  { jcd: "09", rno: 3, ev: 2.38 },
  { jcd: "11", rno: 3, ev: 14.49 },
  { jcd: "13", rno: 3, ev: 2.21 },
  { jcd: "16", rno: 3, ev: 3.09 },
  { jcd: "17", rno: 3, ev: 9.49 },
  { jcd: "04", rno: 1, ev: 5.82 },
  { jcd: "05", rno: 1, ev: 4.38 },
  { jcd: "09", rno: 4, ev: 20.38 },
  { jcd: "11", rno: 4, ev: 15.86 },
  { jcd: "13", rno: 4, ev: 5.33 },
  { jcd: "17", rno: 4, ev: 18.05 },
  { jcd: "04", rno: 2, ev: 10.48 },
  { jcd: "05", rno: 2, ev: 2.16 },
  { jcd: "09", rno: 5, ev: 8.91 },
  { jcd: "11", rno: 5, ev: 34.46 },
  { jcd: "13", rno: 5, ev: 14.43 },
  { jcd: "17", rno: 5, ev: 2.70 },
  { jcd: "10", rno: 7, ev: 55.92 },
  { jcd: "14", rno: 7, ev: 67.90 },
  { jcd: "10", rno: 8, ev: 64.10 },
  { jcd: "14", rno: 8, ev: 2.69 },
  { jcd: "23", rno: 8, ev: 3.43 },
  { jcd: "10", rno: 9, ev: 4.16 },
  { jcd: "14", rno: 9, ev: 10.59 },
  { jcd: "23", rno: 9, ev: 4.67 },
  { jcd: "05", rno: 8, ev: 1.55 },
  { jcd: "17", rno: 9, ev: 1.48 },
  { jcd: "05", rno: 10, ev: 1.62 },
  { jcd: "10", rno: 11, ev: 1.30 },
  { jcd: "11", rno: 10, ev: 1.45 },
  { jcd: "13", rno: 10, ev: 1.52 },
  { jcd: "14", rno: 10, ev: 1.39 },
  { jcd: "23", rno: 11, ev: 1.40 },
  { jcd: "05", rno: 12, ev: 1.58 },
  { jcd: "19", rno: 5, ev: 1.45 },
  { jcd: "23", rno: 12, ev: 1.42 },
];

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const dateLabel = `${jst.getUTCMonth() + 1}/${jst.getUTCDate()}`;

    // マスタから全Sランクレースを組み立て
    const sranks = TODAY_SRANKS_MASTER.map((item) => {
      const vname = VENUE_NAME_MAP[item.jcd] || `場${item.jcd}`;
      const sch = VENUE_SCHEDULES[item.jcd] || {};
      const deadline = sch[String(item.rno)] || "--:--";
      return {
        venue: vname,
        rno: item.rno,
        deadline,
        rank: "S",
        ev: item.ev,
      };
    });

    // 締切時刻昇順（出走順）でソート
    sranks.sort((a, b) => a.deadline.localeCompare(b.deadline));

    return NextResponse.json(
      {
        success: true,
        date: dateLabel,
        count: sranks.length,
        races: sranks,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  } catch (_) {
    return NextResponse.json({ success: false, date: "", count: 0, races: [] });
  }
}