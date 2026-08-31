import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const GAS_API_URL =
  process.env.GAS_API_URL ||
  "https://script.google.com/macros/s/AKfycbyvJwPQZXBaFeh6DA3GnTDTapqRaOg7OEJHiBmhEDrqO3--CkpbEgZQbcjGvxQo_XLm/exec";

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const y = jst.getUTCFullYear();
    const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
    const d = String(jst.getUTCDate()).padStart(2, "0");
    const dateStr = `${y}${m}${d}`;
    const dateLabel = `${jst.getUTCMonth() + 1}/${jst.getUTCDate()}`;

    // GASから本日のリアルタイムデータを取得
    const gasUrl = `${GAS_API_URL}?action=get_predictions_only&pass=BATCH_INTERNAL_ACCESS_2026&date=${dateStr}`;
    const res = await fetch(gasUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    let totalRaces = 144;
    let skipCount = 95;
    let srankCount = 49;

    if (res.ok) {
      const json = await res.json();
      const predictions = json?.predictions || {};
      const total = Object.keys(predictions).length;
      if (total > 0) {
        totalRaces = total;
        let skips = 0;
        let sranks = 0;

        for (const val of Object.values(predictions)) {
          const v = val as Record<string, any>;
          const conf =
            v.confidence_score ||
            (typeof v.confidence === "object" ? v.confidence?.level : v.confidence);
          if (v.recommend_skip || v.recommendation === "見" || conf === "C" || conf === "D") {
            skips++;
          } else if (conf === "S" || conf === "SS" || conf === "A") {
            sranks++;
          }
        }
        skipCount = skips;
        srankCount = sranks;
      }
    }

    const successRate = totalRaces > 0 ? Math.round((skipCount / totalRaces) * 100) : 70;

    return NextResponse.json(
      {
        success: true,
        skipCount,
        srankCount,
        totalRaces,
        successRate,
        dateLabel,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (_) {
    return NextResponse.json({
      success: true,
      skipCount: 95,
      srankCount: 49,
      totalRaces: 144,
      successRate: 66,
      dateLabel: "",
    });
  }
}
