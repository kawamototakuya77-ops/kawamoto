import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const m = jst.getUTCMonth() + 1;
    const d = jst.getUTCDate();
    const y = jst.getUTCFullYear();
    const dateStr = `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;

    const gasUrl =
      process.env.GAS_API_URL ||
      "https://script.google.com/macros/s/AKfycbyvJwPQZXBaFeh6DA3GnTDTapqRaOg7OEJHiBmhEDrqO3--CkpbEgZQbcjGvxQo_XLm/exec";

    let skipCount = 0;
    let finishedRaces = 0;
    let label = `本日 ${m}/${d}`;

    // 1. 本日の確定済みレースを集計
    try {
      const res = await fetch(
        `${gasUrl}?action=get_predictions_only&pass=BATCH_INTERNAL_ACCESS_2026&date=${dateStr}`,
        { cache: "no-store", headers: { "Cache-Control": "no-cache" }, signal: AbortSignal.timeout(4000) }
      );
      if (res.ok) {
        const json = await res.json();
        if (json && json.predictions) {
          for (const k of Object.keys(json.predictions)) {
            const p = json.predictions[k];
            const hasResult = Boolean(p.result || p.actual_result);
            if (hasResult) {
              finishedRaces++;
              const ev = p.ev ? Number(p.ev) : 0;
              if (ev < 1.2 || p.skip_recommended === true) skipCount++;
            }
          }
        }
      }
    } catch (_) {}

    // 2. 本日の確定レースがまだない（朝など）場合、前日の確定実績を集計
    if (finishedRaces === 0) {
      const yesterday = new Date(jst.getTime() - 24 * 60 * 60 * 1000);
      const ym = yesterday.getUTCMonth() + 1;
      const yd = yesterday.getUTCDate();
      const yy = yesterday.getUTCFullYear();
      const yDateStr = `${yy}${String(ym).padStart(2, "0")}${String(yd).padStart(2, "0")}`;
      label = `昨日 ${ym}/${yd} 確定`;

      try {
        const resY = await fetch(
          `${gasUrl}?action=get_predictions_only&pass=BATCH_INTERNAL_ACCESS_2026&date=${yDateStr}`,
          { cache: "no-store", headers: { "Cache-Control": "no-cache" }, signal: AbortSignal.timeout(4000) }
        );
        if (resY.ok) {
          const jsonY = await resY.json();
          if (jsonY && jsonY.predictions) {
            for (const k of Object.keys(jsonY.predictions)) {
              const p = jsonY.predictions[k];
              const hasResult = Boolean(p.result || p.actual_result);
              if (hasResult) {
                finishedRaces++;
                const ev = p.ev ? Number(p.ev) : 0;
                if (ev < 1.2 || p.skip_recommended === true) skipCount++;
              }
            }
          }
        }
      } catch (_) {}
    }

    if (finishedRaces === 0) {
      return NextResponse.json({ success: false });
    }

    const successRate = Math.round((skipCount / finishedRaces) * 100);
    return NextResponse.json(
      { success: true, skipCount, totalRaces: finishedRaces, successRate, dateLabel: label },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate", Pragma: "no-cache" } }
    );
  } catch (_) {
    return NextResponse.json({ success: false });
  }
}