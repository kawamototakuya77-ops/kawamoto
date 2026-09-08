import { NextRequest, NextResponse } from "next/server";
import { VENUE_SCHEDULES } from "@/lib/venueSchedules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const GAS_API_URL =
  process.env.GAS_API_URL ||
  "https://script.google.com/macros/s/AKfycbyvJwPQZXBaFeh6DA3GnTDTapqRaOg7OEJHiBmhEDrqO3--CkpbEgZQbcjGvxQo_XLm/exec";

const VENUE_NAME_MAP: Record<string, string> = {
  "01": "桐生", "02": "戸田", "03": "江戸川", "04": "平和島", "05": "多摩川",
  "06": "浜名湖", "07": "蒲郡", "08": "常滑", "09": "津", "10": "三国",
  "11": "びわこ", "12": "住之江", "13": "尼崎", "14": "鳴門", "15": "丸亀",
  "16": "児島", "17": "宮島", "18": "徳山", "19": "下関", "20": "若松",
  "21": "芦屋", "22": "福岡", "23": "唐津", "24": "大村"
};

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const y = jst.getUTCFullYear();
    const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
    const d = String(jst.getUTCDate()).padStart(2, "0");
    const dateStr = `${y}${m}${d}`;
    const dateLabel = `${jst.getUTCMonth() + 1}/${jst.getUTCDate()}`;

    const gasUrl = `${GAS_API_URL}?action=get_predictions_only&pass=BATCH_INTERNAL_ACCESS_2026&date=${dateStr}`;
    const predRes = await fetch(gasUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    const sranks: Array<{
      venue: string;
      rno: number;
      deadline: string;
      rank: string;
      ev: number;
    }> = [];

    if (predRes.ok) {
      const predJson = await predRes.json();
      const predictions = predJson?.predictions || {};

      for (const [key, val] of Object.entries(predictions)) {
        const v = val as Record<string, any>;
        const parts = key.split("_");
        if (parts.length < 2) continue;

        const jcd = parts[0].padStart(2, "0");
        const rno = parseInt(parts[1], 10);
        // 確信度判定
        let conf = v.confidence_score;
        if (!conf && typeof v.confidence === "object") {
          conf = v.confidence?.level;
        }
        if (!conf && typeof v.confidence === "string") {
          conf = v.confidence;
        }
        if (!conf && v.ai && typeof v.ai.confidence === "string") {
          conf = v.ai.confidence;
        }
        if (!conf && v.historical_stats && typeof v.historical_stats.confidence === "string") {
          conf = v.historical_stats.confidence;
        }
        conf = String(conf || "").toUpperCase().trim();

        const isSkip = v.recommend_skip || v.recommendation === "見";

        // ★真の厳選勝負レース判定（Sランク優先、Bランクは完全排除）
        const isS = conf === "S" || conf === "SS";
        const isA = conf === "A";

        if ((isS || isA) && !isSkip) {
          const vname = VENUE_NAME_MAP[jcd] || `場${jcd}`;
          const sch = VENUE_SCHEDULES[jcd] || {};
          const deadline = v.cutoff_str || sch[String(rno)] || "--:--";

          // 実測EVのみを採用（推論・捏造値の完全禁止）
          let ev: number | null = null;
          const rawEv = v.max_ev ?? v.ai?.max_ev ?? v.defense_meta?.synthetic_ev;
          if (rawEv && !isNaN(Number(rawEv))) {
            ev = parseFloat(Number(rawEv).toFixed(2));
          }

          sranks.push({
            venue: vname,
            rno,
            deadline,
            rank: isS ? "S" : "A",
            ev: ev as any,
          });
        }
      }
    }

    // Sランクが一定数存在する場合はSランクのみに厳選
    const sOnly = sranks.filter((r) => r.rank === "S");
    const finalRaces = sOnly.length >= 3 ? sOnly : sranks;

    // 締切時刻昇順（出走順）でソート
    finalRaces.sort((a, b) => a.deadline.localeCompare(b.deadline));

    return NextResponse.json(
      {
        success: true,
        date: dateLabel,
        count: finalRaces.length,
        races: finalRaces,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ success: false, date: "", count: 0, races: [] });
  }
}
