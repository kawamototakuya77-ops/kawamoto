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

    let totalRaces = 0;
    let finishedRaces = 0;
    let skipCount = 0;
    let srankCount = 0;
    let pendingSkips = 0;
    let pendingSranks = 0;

    if (res.ok) {
      const json = await res.json();
      const predictions = json?.predictions || {};
      const total = Object.keys(predictions).length;
      if (total > 0) {
        totalRaces = total;

        for (const val of Object.values(predictions)) {
          const v = val as Record<string, any>;
          const conf =
            v.confidence_score ||
            (typeof v.confidence === "object" ? v.confidence?.level : v.confidence);
          const isSkip = v.recommend_skip || v.recommendation === "見" || conf === "C" || conf === "D";
          const isSrank = conf === "S" || conf === "SS" || conf === "A";

          // 事前スクリーニング段階のカウント
          if (isSkip) pendingSkips++;
          if (isSrank) pendingSranks++;

          // 確定終了したレース（着順確定データが存在するもの）のみを確定実績として集計
          const hasFinished =
            Boolean(v.result && typeof v.result === "object" && (v.result.combo || v.result.winning_combo)) ||
            Boolean(v.review && typeof v.review === "object" && (v.review.combo || v.review.winning_combo));

          if (hasFinished) {
            finishedRaces++;
            if (isSkip) {
              skipCount++;
            } else if (isSrank) {
              srankCount++;
            }
          }
        }
      }
    }

    const successRate = finishedRaces > 0 ? Math.round((skipCount / finishedRaces) * 100) : 0;

    return NextResponse.json(
      {
        success: true,
        skipCount,
        srankCount,
        totalRaces,
        finishedRaces,
        pendingSkips,
        pendingSranks,
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
      skipCount: 0,
      srankCount: 0,
      totalRaces: 0,
      finishedRaces: 0,
      pendingSkips: 0,
      pendingSranks: 0,
      successRate: 0,
      dateLabel: "",
    });
  }
}
