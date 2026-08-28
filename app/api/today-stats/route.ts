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
    const h = jst.getUTCHours();
    const dateLabel = `${m}/${d}`;
    const y = jst.getUTCFullYear();
    const dateStr = `${y}${String(m).padStart(2,"0")}${String(d).padStart(2,"0")}`;
    let skipCount = 0;
    let totalRaces = 0;
    const gasUrl = process.env.GAS_API_URL || "https://script.google.com/macros/s/AKfycbyvJwPQZXBaFeh6DA3GnTDTapqRaOg7OEJHiBmhEDrqO3--CkpbEgZQbcjGvxQo_XLm/exec";
    try {
      const res = await fetch(`${gasUrl}?action=get_predictions_only&pass=BATCH_INTERNAL_ACCESS_2026&date=${dateStr}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" }, signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const json = await res.json();
        if (json && json.predictions) {
          for (const k of Object.keys(json.predictions)) {
            const p = json.predictions[k];
            totalRaces++;
            const ev = p.ev ? Number(p.ev) : 0;
            if (ev < 1.2 || (p.skip_recommended === true)) skipCount++;
          }
        }
      }
    } catch (_) {}
    if (totalRaces === 0) {
      return NextResponse.json({ success: false });
    }
    const successRate = Math.round((skipCount / totalRaces) * 100);
    return NextResponse.json({ success: true, skipCount, totalRaces, successRate, dateLabel }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache" } });
  } catch (_) {
    return NextResponse.json({ success: false });
  }
}